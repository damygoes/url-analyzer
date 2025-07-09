package crawler

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
	"url-analyzer/internal/models"

	"github.com/PuerkitoBio/goquery"
	"github.com/go-resty/resty/v2"
)

// Crawler is the main crawler struct
type Crawler struct {
	client   *resty.Client
	options  models.CrawlOptions
	progress models.ProgressCallback
	mu       sync.RWMutex
}

// NewCrawler creates a new crawler instance
func NewCrawler(options models.CrawlOptions) *Crawler {
	client := resty.New()
	client.SetTimeout(options.Timeout)
	client.SetRedirectPolicy(resty.FlexibleRedirectPolicy(options.MaxRedirects))
	
	// Set headers to appear more like a real browser
	client.SetHeaders(map[string]string{
		"User-Agent":       options.UserAgent,
		"Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		"Accept-Language": "en-US,en;q=0.5",
		"Accept-Encoding": "gzip, deflate",
		"DNT":             "1",
		"Connection":      "keep-alive",
		"Upgrade-Insecure-Requests": "1",
	})

	return &Crawler{
		client:  client,
		options: options,
	}
}

// SetProgressCallback sets a callback function to receive progress updates
func (c *Crawler) SetProgressCallback(callback models.ProgressCallback) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.progress = callback
}

// reportProgress safely reports progress to the callback
func (c *Crawler) reportProgress(status models.CrawlStatus, message string, progress float64) {
	c.mu.RLock()
	callback := c.progress
	c.mu.RUnlock()
	
	if callback != nil {
		callback(status, message, progress)
	}
}

// CrawlURL crawls a single URL and returns detailed information
func (c *Crawler) CrawlURL(targetURL string) *models.CrawlJobResult {
	startTime := time.Now()
	
	result := &models.CrawlJobResult{
		URL:             targetURL,
		HeadingCounts:   make(map[string]int),
		BrokenLinks:     []models.CrawlBrokenLink{},
		ResponseHeaders: make(map[string]string),
	}
	
	c.reportProgress(models.CrawlStatusStarted, "Starting crawl", 0.0)
	
	// Validate URL
	parsedURL, err := url.Parse(targetURL)
	if err != nil {
		result.Error = fmt.Errorf("invalid URL: %w", err)
		c.reportProgress(models.CrawlStatusFailed, "Invalid URL", 100.0)
		return result
	}
	
	// Fetch the webpage
	c.reportProgress(models.CrawlStatusFetching, "Fetching webpage", 10.0)
	resp, err := c.client.R().Get(targetURL)
	if err != nil {
		result.Error = fmt.Errorf("failed to fetch URL: %w", err)
		c.reportProgress(models.CrawlStatusFailed, "Failed to fetch webpage", 100.0)
		return result
	}
	
	result.StatusCode = resp.StatusCode()
	result.ContentLength = int64(len(resp.Body()))
	
	// Store response headers
	for key, values := range resp.Header() {
		if len(values) > 0 {
			result.ResponseHeaders[key] = values[0]
		}
	}
	
	if resp.StatusCode() >= 400 {
		result.Error = fmt.Errorf("HTTP error: %d %s", resp.StatusCode(), http.StatusText(resp.StatusCode()))
		c.reportProgress(models.CrawlStatusFailed, fmt.Sprintf("HTTP %d error", resp.StatusCode()), 100.0)
		return result
	}
	
	// Parse HTML
	c.reportProgress(models.CrawlStatusParsing, "Parsing HTML", 30.0)
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(resp.Body())))
	if err != nil {
		result.Error = fmt.Errorf("failed to parse HTML: %w", err)
		c.reportProgress(models.CrawlStatusFailed, "Failed to parse HTML", 100.0)
		return result
	}
	
	// Extract HTML information
	c.reportProgress(models.CrawlStatusAnalyzing, "Analyzing content", 50.0)
	htmlInfo := c.extractHTMLInfo(doc, parsedURL)
	
	result.Title = htmlInfo.Title
	result.HTMLVersion = htmlInfo.HTMLVersion
	result.HeadingCounts = htmlInfo.Headings
	result.HasLoginForm = htmlInfo.HasLoginForm
	
	// Count internal vs external links
	result.InternalLinks = 0
	result.ExternalLinks = 0
	
	for _, link := range htmlInfo.Links {
		if link.IsInternal {
			result.InternalLinks++
		} else if link.IsExternal {
			result.ExternalLinks++
		}
	}
	
	// Check for broken links if enabled
	if c.options.CheckBrokenLinks {
		c.reportProgress(models.CrawlStatusChecking, "Checking links", 70.0)
		result.BrokenLinks = c.checkBrokenLinks(htmlInfo.Links, parsedURL)
	}
	
	result.CrawlDuration = time.Since(startTime)
	c.reportProgress(models.CrawlStatusCompleted, "Crawl completed", 100.0)
	
	return result
}

// extractHTMLInfo extracts detailed information from the HTML document
func (c *Crawler) extractHTMLInfo(doc *goquery.Document, baseURL *url.URL) models.HTMLInfo {
	info := models.HTMLInfo{
		Headings: make(map[string]int),
		Links:    []models.LinkInfo{},
		MetaTags: make(map[string]string),
	}
	
	// Extract title
	info.Title = strings.TrimSpace(doc.Find("title").First().Text())
	
	// Detect HTML version
	info.HTMLVersion = c.detectHTMLVersion(doc)
	
	// Count headings
	for i := 1; i <= 6; i++ {
		tag := fmt.Sprintf("h%d", i)
		count := doc.Find(tag).Length()
		info.Headings[tag] = count
	}
	
	// Extract links
	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}
		
		// Skip non-HTTP/HTTPS links
		if c.shouldSkipLink(href) {
			return
		}
		
		// Resolve relative URLs
		linkURL, err := baseURL.Parse(href)
		if err != nil {
			return
		}
		
		// Only count HTTP/HTTPS links
		if linkURL.Scheme != "http" && linkURL.Scheme != "https" {
			return
		}
		
		linkInfo := models.LinkInfo{
			URL:  linkURL.String(),
			Text: strings.TrimSpace(s.Text()),
		}
		
		// Determine if link is internal or external
		if linkURL.Host == "" || linkURL.Host == baseURL.Host {
			linkInfo.IsInternal = true
		} else {
			linkInfo.IsExternal = true
		}
		
		info.Links = append(info.Links, linkInfo)
	})
	
	// Check for login forms
	info.HasLoginForm = c.detectLoginForm(doc)
	
	// Extract meta tags
	doc.Find("meta").Each(func(i int, s *goquery.Selection) {
		if name, exists := s.Attr("name"); exists {
			if content, exists := s.Attr("content"); exists {
				info.MetaTags[name] = content
			}
		}
	})
	
	return info
}

// detectHTMLVersion attempts to detect the HTML version
func (c *Crawler) detectHTMLVersion(doc *goquery.Document) string {
	// Check for HTML5 doctype
	doctype := doc.Find("html").First().AttrOr("", "")
	
	// Look for HTML5 indicators
	if doc.Find("article, aside, footer, header, nav, section, main").Length() > 0 {
		return "HTML5"
	}
	
	// Check for specific HTML4 doctypes in the raw content
	// This is a simplified detection - in a real scenario you'd parse the doctype declaration
	if strings.Contains(strings.ToLower(doctype), "html 4") {
		return "HTML 4.01"
	}
	
	if strings.Contains(strings.ToLower(doctype), "xhtml") {
		return "XHTML 1.0"
	}
	
	// Default assumption for modern websites
	return "HTML5"
}

// detectLoginForm checks if the page contains a login form
func (c *Crawler) detectLoginForm(doc *goquery.Document) bool {
	// Look for password fields first (most reliable indicator)
	if doc.Find("input[type='password']").Length() > 0 {
		return true
	}
	
	// Look for common login form patterns with password fields
	loginIndicators := []string{
		"input[name*='password']",
		"input[name*='login']",
		"input[name*='username']",
	}
	
	for _, selector := range loginIndicators {
		if doc.Find(selector).Length() > 0 {
			// Check if there's also a password field in the same form
			doc.Find(selector).Each(func(i int, s *goquery.Selection) {
				form := s.Closest("form")
				if form.Length() > 0 && form.Find("input[type='password']").Length() > 0 {
					return
				}
			})
		}
	}
	
	// Look for forms with login-related actions that also have password fields
	loginActions := []string{"login", "signin", "auth"}
	for _, action := range loginActions {
		selector := fmt.Sprintf("form[action*='%s']", action)
		doc.Find(selector).Each(func(i int, form *goquery.Selection) {
			if form.Find("input[type='password']").Length() > 0 {
				return
			}
		})
	}
	
	return false
}

// checkBrokenLinks checks a list of links for broken ones
func (c *Crawler) checkBrokenLinks(links []models.LinkInfo, baseURL *url.URL) []models.CrawlBrokenLink {
	brokenLinks := []models.CrawlBrokenLink{}
	
	// Limit the number of links to check
	linksToCheck := links
	if len(links) > c.options.MaxLinksToCheck {
		linksToCheck = links[:c.options.MaxLinksToCheck]
	}
	
	// Use a channel to limit concurrency
	semaphore := make(chan struct{}, c.options.ConcurrentChecks)
	var wg sync.WaitGroup
	var mu sync.Mutex
	
	for _, link := range linksToCheck {
		// Skip certain types of links
		if c.shouldSkipLink(link.URL) {
			continue
		}
		
		wg.Add(1)
		go func(linkInfo models.LinkInfo) {
			defer wg.Done()
			
			// Acquire semaphore
			semaphore <- struct{}{}
			defer func() { <-semaphore }()
			
			// Rate limiting
			if c.options.RespectRateLimit {
				time.Sleep(c.options.RateLimitDelay)
			}
			
			brokenLink := c.checkSingleLink(linkInfo)
			if brokenLink != nil {
				mu.Lock()
				brokenLinks = append(brokenLinks, *brokenLink)
				mu.Unlock()
			}
		}(link)
	}
	
	wg.Wait()
	return brokenLinks
}

// shouldSkipLink determines if a link should be skipped during broken link checking
func (c *Crawler) shouldSkipLink(linkURL string) bool {
	// Skip javascript:, mailto:, tel:, ftp: links
	skipPrefixes := []string{"javascript:", "mailto:", "tel:", "ftp:", "#"}
	
	for _, prefix := range skipPrefixes {
		if strings.HasPrefix(strings.ToLower(linkURL), prefix) {
			return true
		}
	}
	
	return false
}

// checkSingleLink checks if a single link is broken
func (c *Crawler) checkSingleLink(linkInfo models.LinkInfo) *models.CrawlBrokenLink {
	// Use HEAD request first for efficiency
	resp, err := c.client.R().Head(linkInfo.URL)
	
	if err != nil {
		// If HEAD fails, try GET
		resp, err = c.client.R().Get(linkInfo.URL)
		if err != nil {
			return &models.CrawlBrokenLink{
				URL:          linkInfo.URL,
				StatusCode:   0,
				ErrorMessage: err.Error(),
				LinkText:     linkInfo.Text,
				IsInternal:   linkInfo.IsInternal,
			}
		}
	}
	
	statusCode := resp.StatusCode()
	
	// Consider 4xx and 5xx as broken
	if statusCode >= 400 {
		return &models.CrawlBrokenLink{
			URL:          linkInfo.URL,
			StatusCode:   statusCode,
			ErrorMessage: http.StatusText(statusCode),
			LinkText:     linkInfo.Text,
			IsInternal:   linkInfo.IsInternal,
		}
	}
	
	return nil
}

// GetStats returns crawler statistics
func (c *Crawler) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"timeout":            c.options.Timeout.String(),
		"max_redirects":      c.options.MaxRedirects,
		"user_agent":         c.options.UserAgent,
		"check_broken_links": c.options.CheckBrokenLinks,
		"max_links_to_check": c.options.MaxLinksToCheck,
		"concurrent_checks":  c.options.ConcurrentChecks,
	}
}
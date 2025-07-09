package models

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// URLStatus represents the status of a URL crawl
type URLStatus string

const (
	StatusQueued    URLStatus = "queued"
	StatusRunning   URLStatus = "running"
	StatusCompleted URLStatus = "completed"
	StatusError     URLStatus = "error"
)

// Scan implements the sql.Scanner interface
func (s *URLStatus) Scan(value interface{}) error {
	if value == nil {
		*s = StatusQueued
		return nil
	}
	switch v := value.(type) {
	case string:
		*s = URLStatus(v)
	case []byte:
		*s = URLStatus(v)
	default:
		return fmt.Errorf("cannot scan %T into URLStatus", value)
	}
	return nil
}

// Value implements the driver.Valuer interface
func (s URLStatus) Value() (driver.Value, error) {
	return string(s), nil
}

// CrawlStatus represents the current status of a crawl operation
type CrawlStatus string

const (
	CrawlStatusStarted   CrawlStatus = "started"
	CrawlStatusFetching  CrawlStatus = "fetching"
	CrawlStatusParsing   CrawlStatus = "parsing"
	CrawlStatusAnalyzing CrawlStatus = "analyzing"
	CrawlStatusChecking  CrawlStatus = "checking_links"
	CrawlStatusCompleted CrawlStatus = "completed"
	CrawlStatusFailed    CrawlStatus = "failed"
)

// URL represents a URL to be crawled (Database model)
type URL struct {
	ID           int       `json:"id" db:"id"`
	URL          string    `json:"url" db:"url"`
	Status       URLStatus `json:"status" db:"status"`
	ErrorMessage *string   `json:"error_message,omitempty" db:"error_message"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// CrawlResult represents the result of crawling a URL (Database model)
type CrawlResult struct {
	ID               int       `json:"id" db:"id"`
	URLID            int       `json:"url_id" db:"url_id"`
	Title            *string   `json:"title" db:"title"`
	HTMLVersion      *string   `json:"html_version" db:"html_version"`
	H1Count          int       `json:"h1_count" db:"h1_count"`
	H2Count          int       `json:"h2_count" db:"h2_count"`
	H3Count          int       `json:"h3_count" db:"h3_count"`
	H4Count          int       `json:"h4_count" db:"h4_count"`
	H5Count          int       `json:"h5_count" db:"h5_count"`
	H6Count          int       `json:"h6_count" db:"h6_count"`
	InternalLinks    int       `json:"internal_links" db:"internal_links"`
	ExternalLinks    int       `json:"external_links" db:"external_links"`
	BrokenLinksCount int       `json:"broken_links_count" db:"broken_links_count"`
	HasLoginForm     bool      `json:"has_login_form" db:"has_login_form"`
	CrawledAt        time.Time `json:"crawled_at" db:"crawled_at"`
}

// BrokenLink represents a broken link found during crawling (Database model)
type BrokenLink struct {
	ID              int    `json:"id" db:"id"`
	CrawlResultID   int    `json:"crawl_result_id" db:"crawl_result_id"`
	URL             string `json:"url" db:"url"`
	StatusCode      int    `json:"status_code" db:"status_code"`
	ErrorMessage    string `json:"error_message" db:"error_message"`
	LinkText        string `json:"link_text" db:"link_text"`
	IsInternal      bool   `json:"is_internal" db:"is_internal"`
}

// User represents an API user
type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	APIKey    string    `json:"api_key" db:"api_key"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// URLWithResult combines URL with its crawl result
type URLWithResult struct {
	URL
	CrawlResult *CrawlResult `json:"crawl_result,omitempty"`
}

// ============================================================================
// Business Logic Types (used by crawler and services)
// ============================================================================

// CrawlJobResult represents the complete result of crawling a webpage
type CrawlJobResult struct {
	URL              string                 `json:"url"`
	Title            string                 `json:"title"`
	HTMLVersion      string                 `json:"html_version"`
	HeadingCounts    map[string]int         `json:"heading_counts"`
	InternalLinks    int                    `json:"internal_links"`
	ExternalLinks    int                    `json:"external_links"`
	BrokenLinks      []CrawlBrokenLink      `json:"broken_links"`
	HasLoginForm     bool                   `json:"has_login_form"`
	CrawlDuration    time.Duration          `json:"crawl_duration"`
	Error            error                  `json:"error,omitempty"`
	StatusCode       int                    `json:"status_code"`
	ContentLength    int64                  `json:"content_length"`
	ResponseHeaders  map[string]string      `json:"response_headers"`
}

// CrawlBrokenLink represents a broken link found during crawling
type CrawlBrokenLink struct {
	URL          string `json:"url"`
	StatusCode   int    `json:"status_code"`
	ErrorMessage string `json:"error_message"`
	LinkText     string `json:"link_text"`
	IsInternal   bool   `json:"is_internal"`
}

// CrawlOptions contains configuration for the crawler
type CrawlOptions struct {
	Timeout           time.Duration `json:"timeout"`
	MaxRedirects      int           `json:"max_redirects"`
	UserAgent         string        `json:"user_agent"`
	FollowRobotsTxt   bool          `json:"follow_robots_txt"`
	CheckBrokenLinks  bool          `json:"check_broken_links"`
	MaxLinksToCheck   int           `json:"max_links_to_check"`
	ConcurrentChecks  int           `json:"concurrent_checks"`
	RespectRateLimit  bool          `json:"respect_rate_limit"`
	RateLimitDelay    time.Duration `json:"rate_limit_delay"`
}

// LinkInfo represents information about a link found on the page
type LinkInfo struct {
	URL        string `json:"url"`
	Text       string `json:"text"`
	IsInternal bool   `json:"is_internal"`
	IsExternal bool   `json:"is_external"`
}

// HTMLInfo represents parsed HTML structure information
type HTMLInfo struct {
	Title        string            `json:"title"`
	HTMLVersion  string            `json:"html_version"`
	Headings     map[string]int    `json:"headings"`
	Links        []LinkInfo        `json:"links"`
	HasLoginForm bool              `json:"has_login_form"`
	MetaTags     map[string]string `json:"meta_tags"`
}

// CrawlJob represents an active crawl job
type CrawlJob struct {
	ID        int               `json:"id"`
	URL       string            `json:"url"`
	Status    CrawlStatus       `json:"status"`
	Progress  float64           `json:"progress"`
	Message   string            `json:"message"`
	StartTime time.Time         `json:"start_time"`
	EndTime   *time.Time        `json:"end_time,omitempty"`
	Result    *CrawlJobResult   `json:"result,omitempty"`
	Cancel    chan struct{}     `json:"-"` // Don't serialize channel
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// CreateURLRequest represents the request to create a new URL
type CreateURLRequest struct {
	URL string `json:"url" binding:"required,url"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	Total      int         `json:"total"`
	TotalPages int         `json:"total_pages"`
}

// URLFilter represents filters for URL listing
type URLFilter struct {
	Status    *URLStatus `form:"status"`
	Search    string     `form:"search"`
	Page      int        `form:"page,default=1"`
	PageSize  int        `form:"page_size,default=10"`
	SortBy    string     `form:"sort_by,default=created_at"`
	SortOrder string     `form:"sort_order,default=desc"`
}

// ============================================================================
// Helper Methods
// ============================================================================

// HeadingCounts returns a map of heading counts
func (cr *CrawlResult) HeadingCounts() map[string]int {
	return map[string]int{
		"h1": cr.H1Count,
		"h2": cr.H2Count,
		"h3": cr.H3Count,
		"h4": cr.H4Count,
		"h5": cr.H5Count,
		"h6": cr.H6Count,
	}
}

// DefaultCrawlOptions returns default crawler options
func DefaultCrawlOptions() CrawlOptions {
	return CrawlOptions{
		Timeout:          30 * time.Second,
		MaxRedirects:     5,
		UserAgent:        "URL-Analyzer-Bot/1.0 (Educational Purpose)",
		FollowRobotsTxt:  true,
		CheckBrokenLinks: true,
		MaxLinksToCheck:  100,
		ConcurrentChecks: 5,
		RespectRateLimit: true,
		RateLimitDelay:   1 * time.Second,
	}
}

// ProgressCallback is called to report crawl progress
type ProgressCallback func(status CrawlStatus, message string, progress float64)

// ============================================================================
// Conversion Methods
// ============================================================================

// ToCrawlResult converts CrawlJobResult to database CrawlResult
func (cjr *CrawlJobResult) ToCrawlResult(urlID int) *CrawlResult {
	result := &CrawlResult{
		URLID:            urlID,
		H1Count:          cjr.HeadingCounts["h1"],
		H2Count:          cjr.HeadingCounts["h2"],
		H3Count:          cjr.HeadingCounts["h3"],
		H4Count:          cjr.HeadingCounts["h4"],
		H5Count:          cjr.HeadingCounts["h5"],
		H6Count:          cjr.HeadingCounts["h6"],
		InternalLinks:    cjr.InternalLinks,
		ExternalLinks:    cjr.ExternalLinks,
		BrokenLinksCount: len(cjr.BrokenLinks),
		HasLoginForm:     cjr.HasLoginForm,
	}
	
	if cjr.Title != "" {
		result.Title = &cjr.Title
	}
	if cjr.HTMLVersion != "" {
		result.HTMLVersion = &cjr.HTMLVersion
	}
	
	return result
}

// ToBrokenLinks converts CrawlBrokenLink slice to database BrokenLink slice
func (cjr *CrawlJobResult) ToBrokenLinks(crawlResultID int) []BrokenLink {
	brokenLinks := make([]BrokenLink, len(cjr.BrokenLinks))
	for i, bl := range cjr.BrokenLinks {
		brokenLinks[i] = BrokenLink{
			CrawlResultID: crawlResultID,
			URL:           bl.URL,
			StatusCode:    bl.StatusCode,
			ErrorMessage:  bl.ErrorMessage,
			LinkText:      bl.LinkText,
			IsInternal:    bl.IsInternal,
		}
	}
	return brokenLinks
}
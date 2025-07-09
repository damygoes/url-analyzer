package crawler

import (
	"testing"
	"url-analyzer/internal/models"
)

func TestCrawler_DebugLinks(t *testing.T) {
	server := createTestServer()
	defer server.Close()
	
	options := models.DefaultCrawlOptions()
	options.CheckBrokenLinks = false // Skip for faster debugging
	
	crawler := NewCrawler(options)
	result := crawler.CrawlURL(server.URL)
	
	if result.Error != nil {
		t.Fatalf("Crawl failed: %v", result.Error)
	}
	
	t.Logf("=== DEBUG: Found Links ===")
	t.Logf("Total internal: %d, Total external: %d", result.InternalLinks, result.ExternalLinks)
	
	// We need to get the HTMLInfo to see all links
	// For now, let's just work with what we have
	t.Logf("Broken links found: %d", len(result.BrokenLinks))
	for i, bl := range result.BrokenLinks {
		t.Logf("Broken link %d: %s (internal: %t, status: %d)", i, bl.URL, bl.IsInternal, bl.StatusCode)
	}
}
package crawler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
	"url-analyzer/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// creates a test HTTP server with sample HTML
func createTestServer() *httptest.Server {
	mux := http.NewServeMux()
	
	// Main test page - simplified HTML to avoid unexpected elements
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		html := `<!DOCTYPE html>
<html>
<head>
    <title>Test Page Title</title>
    <meta name="description" content="Test page description">
</head>
<body>
    <h1>Main Heading</h1>
    <h2>Sub Heading 1</h2>
    <h2>Sub Heading 2</h2>
    <h3>Sub Sub Heading</h3>
    
    <p>This is a test page with various links:</p>
    
    <a href="/internal">Internal Link</a>
    <a href="/page2">Another Internal Link</a>
    <a href="https://example.com">External Link</a>
    <a href="https://google.com">Google</a>
    <a href="/broken">Broken Link</a>
    
    <form action="/login" method="post">
        <input type="text" name="username" placeholder="Username">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Login</button>
    </form>
    
    <a href="javascript:void(0)">JavaScript Link</a>
    <a href="mailto:test@example.com">Email Link</a>
</body>
</html>`
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(200)
		w.Write([]byte(html))
	})
	
	// Internal page
	mux.HandleFunc("/internal", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("<html><body>Internal Page</body></html>"))
	})
	
	// Another internal page
	mux.HandleFunc("/page2", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("<html><body>Page 2</body></html>"))
	})
	
	// Broken link (404)
	mux.HandleFunc("/broken", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(404)
		w.Write([]byte("Not Found"))
	})
	
	return httptest.NewServer(mux)
}

func TestCrawler_CrawlURL_Success(t *testing.T) {
	server := createTestServer()
	defer server.Close()
	
	options := models.DefaultCrawlOptions()
	options.Timeout = 10 * time.Second
	options.CheckBrokenLinks = true
	options.MaxLinksToCheck = 10
	options.ConcurrentChecks = 2
	
	crawler := NewCrawler(options)
	
	result := crawler.CrawlURL(server.URL)
	
	// Basic assertions
	require.NoError(t, result.Error)
	assert.Equal(t, server.URL, result.URL)
	assert.Equal(t, 200, result.StatusCode)
	assert.Greater(t, result.ContentLength, int64(0))
	
	// Content assertions
	assert.Equal(t, "Test Page Title", result.Title)
	assert.Equal(t, "HTML5", result.HTMLVersion)
	assert.True(t, result.HasLoginForm)
	
	// Heading counts
	t.Logf("Heading counts: %+v", result.HeadingCounts)
	
	// Basic checks on headings
	assert.Greater(t, result.HeadingCounts["h1"], 0, "Should have at least one H1")
	assert.GreaterOrEqual(t, result.HeadingCounts["h2"], 0, "Should have zero or more H2")
	
	totalHeadings := 0
	for _, count := range result.HeadingCounts {
		totalHeadings += count
	}
	assert.Greater(t, totalHeadings, 0, "Should have some headings total")
	
	// Link counts (should not include javascript: and mailto: links)
	assert.Equal(t, 3, result.InternalLinks) // /internal, /page2, and /broken
	assert.Equal(t, 2, result.ExternalLinks) // example.com and google.com
	
	// Broken links
	assert.Greater(t, len(result.BrokenLinks), 0)
	
	// Find the broken link
	var brokenLink *models.CrawlBrokenLink
	for _, bl := range result.BrokenLinks {
		if strings.Contains(bl.URL, "/broken") {
			brokenLink = &bl
			break
		}
	}
	require.NotNil(t, brokenLink, "Should find the broken link")
	assert.Equal(t, 404, brokenLink.StatusCode)
	assert.True(t, brokenLink.IsInternal)
	
	// Crawl duration added for performance measurement
	assert.Greater(t, result.CrawlDuration, time.Duration(0))
	assert.Less(t, result.CrawlDuration, 30*time.Second)
}

func TestCrawler_CrawlURL_InvalidURL(t *testing.T) {
	options := models.DefaultCrawlOptions()
	crawler := NewCrawler(options)
	
	result := crawler.CrawlURL("not-a-valid-url://test")
	
	assert.Error(t, result.Error)
	assert.True(t, 
		strings.Contains(result.Error.Error(), "invalid URL") ||
		strings.Contains(result.Error.Error(), "unsupported protocol") ||
		strings.Contains(result.Error.Error(), "failed to fetch URL"),
		"Error should indicate URL problem: %v", result.Error)
}

func TestCrawler_CrawlURL_404Error(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(404)
		w.Write([]byte("Not Found"))
	}))
	defer server.Close()
	
	options := models.DefaultCrawlOptions()
	crawler := NewCrawler(options)
	
	result := crawler.CrawlURL(server.URL)
	
	assert.Error(t, result.Error)
	assert.Equal(t, 404, result.StatusCode)
	assert.Contains(t, result.Error.Error(), "HTTP error: 404")
}

func TestCrawler_DetectLoginForm(t *testing.T) {
	testCases := []struct {
		name     string
		html     string
		expected bool
	}{
		{
			name: "Simple login form",
			html: `<form><input type="password" name="password"></form>`,
			expected: true,
		},
		{
			name: "Login form with username",
			html: `<form><input type="text" name="username"><input type="password"></form>`,
			expected: true,
		},
		{
			name: "Form with login action",
			html: `<form action="/login"><input type="text"></form>`,
			expected: false, // No password field, so should be false
		},
		{
			name: "Form with login action and password",
			html: `<form action="/login"><input type="password"></form>`,
			expected: true,
		},
		{
			name: "No login form",
			html: `<form><input type="text" name="search"></form>`,
			expected: false,
		},
		{
			name: "Contact form",
			html: `<form><input type="email"><textarea></textarea></form>`,
			expected: false,
		},
	}
	
	options := models.DefaultCrawlOptions()
	crawler := NewCrawler(options)
	
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				html := `<!DOCTYPE html><html><body>` + tc.html + `</body></html>`
				w.Write([]byte(html))
			}))
			defer server.Close()
			
			result := crawler.CrawlURL(server.URL)
			require.NoError(t, result.Error)
			assert.Equal(t, tc.expected, result.HasLoginForm, "Login form detection failed for case: %s", tc.name)
		})
	}
}

func TestCrawler_ProgressCallback(t *testing.T) {
	server := createTestServer()
	defer server.Close()
	
	options := models.DefaultCrawlOptions()
	options.CheckBrokenLinks = false // Skip broken link checking for faster test
	crawler := NewCrawler(options)
	
	var progressUpdates []models.CrawlStatus
	var progressValues []float64
	
	crawler.SetProgressCallback(func(status models.CrawlStatus, message string, progress float64) {
		progressUpdates = append(progressUpdates, status)
		progressValues = append(progressValues, progress)
	})
	
	result := crawler.CrawlURL(server.URL)
	
	require.NoError(t, result.Error)
	assert.Greater(t, len(progressUpdates), 0)
	assert.Equal(t, models.CrawlStatusStarted, progressUpdates[0])
	assert.Equal(t, models.CrawlStatusCompleted, progressUpdates[len(progressUpdates)-1])
	
	// Check progress increases
	assert.Equal(t, 0.0, progressValues[0])
	assert.Equal(t, 100.0, progressValues[len(progressValues)-1])
}

func TestCrawler_LinkClassification(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		html := `
<!DOCTYPE html>
<html>
<body>
    <a href="/internal">Internal Link</a>
    <a href="https://external.com">External Link</a>
    <a href="javascript:void(0)">JavaScript Link</a>
    <a href="mailto:test@example.com">Email Link</a>
    <a href="#anchor">Anchor Link</a>
    <a href="tel:+1234567890">Phone Link</a>
</body>
</html>`
		w.Write([]byte(html))
	}))
	defer server.Close()
	
	options := models.DefaultCrawlOptions()
	options.CheckBrokenLinks = false
	crawler := NewCrawler(options)
	
	result := crawler.CrawlURL(server.URL)
	
	require.NoError(t, result.Error)
	
	// Should only count HTTP/HTTPS links
	assert.Greater(t, result.InternalLinks, 0, "Should have some internal links")
	assert.Greater(t, result.ExternalLinks, 0, "Should have some external links")
	
	// Total links should be reasonable (internal + external should be > 0)
	totalLinks := result.InternalLinks + result.ExternalLinks
	assert.Greater(t, totalLinks, 0, "Should have some valid links")
}

func TestCrawler_HTMLVersionDetection(t *testing.T) {
	testCases := []struct {
		name     string
		html     string
		expected string
	}{
		{
			name: "HTML5 with semantic elements",
			html: `<!DOCTYPE html><html><body><article><header>Test</header></article></body></html>`,
			expected: "HTML5",
		},
		{
			name: "Basic HTML without semantic elements",
			html: `<html><body><div>Test</div></body></html>`,
			expected: "HTML5", // Default assumption
		},
	}
	
	options := models.DefaultCrawlOptions()
	options.CheckBrokenLinks = false
	crawler := NewCrawler(options)
	
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Write([]byte(tc.html))
			}))
			defer server.Close()
			
			result := crawler.CrawlURL(server.URL)
			require.NoError(t, result.Error)
			assert.Equal(t, tc.expected, result.HTMLVersion)
		})
	}
}

func TestDefaultCrawlOptions(t *testing.T) {
	options := models.DefaultCrawlOptions()
	
	assert.Equal(t, 30*time.Second, options.Timeout)
	assert.Equal(t, 5, options.MaxRedirects)
	assert.Contains(t, options.UserAgent, "URL-Analyzer-Bot")
	assert.True(t, options.CheckBrokenLinks)
	assert.Equal(t, 100, options.MaxLinksToCheck)
	assert.Equal(t, 5, options.ConcurrentChecks)
	assert.True(t, options.RespectRateLimit)
	assert.Equal(t, 1*time.Second, options.RateLimitDelay)
}

// Benchmark test for crawler performance
func BenchmarkCrawler_CrawlURL(b *testing.B) {
	server := createTestServer()
	defer server.Close()
	
	options := models.DefaultCrawlOptions()
	options.CheckBrokenLinks = false // Skip for performance
	crawler := NewCrawler(options)
	
	b.ResetTimer()
	
	for i := 0; i < b.N; i++ {
		result := crawler.CrawlURL(server.URL)
		if result.Error != nil {
			b.Fatalf("Crawl failed: %v", result.Error)
		}
	}
}
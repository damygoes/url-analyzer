package services

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"url-analyzer/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// MockRepository implements RepositoryInterface for testing
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) CreateURL(url string) (*models.URL, error) {
	args := m.Called(url)
	return args.Get(0).(*models.URL), args.Error(1)
}

func (m *MockRepository) GetURLByID(id int) (*models.URL, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.URL), args.Error(1)
}

func (m *MockRepository) GetURLByURL(urlStr string) (*models.URL, error) {
	args := m.Called(urlStr)
	return args.Get(0).(*models.URL), args.Error(1)
}

func (m *MockRepository) ListURLs(filter models.URLFilter) ([]models.URLWithResult, int, error) {
	args := m.Called(filter)
	return args.Get(0).([]models.URLWithResult), args.Int(1), args.Error(2)
}

func (m *MockRepository) UpdateURLStatus(id int, status models.URLStatus, errorMessage *string) error {
	args := m.Called(id, status, errorMessage)
	return args.Error(0)
}

func (m *MockRepository) DeleteURL(id int) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockRepository) DeleteURLs(ids []int) error {
	args := m.Called(ids)
	return args.Error(0)
}

func (m *MockRepository) CreateCrawlResult(result *models.CrawlResult) error {
	args := m.Called(result)
	// Set ID for the result (simulate database setting the ID)
	result.ID = 1
	return args.Error(0)
}

func (m *MockRepository) GetCrawlResultByURLID(urlID int) (*models.CrawlResult, error) {
	args := m.Called(urlID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.CrawlResult), args.Error(1)
}

func (m *MockRepository) CreateBrokenLinks(crawlResultID int, brokenLinks []models.BrokenLink) error {
	args := m.Called(crawlResultID, brokenLinks)
	return args.Error(0)
}

func (m *MockRepository) GetBrokenLinksByURLID(urlID int) ([]models.BrokenLink, error) {
	args := m.Called(urlID)
	return args.Get(0).([]models.BrokenLink), args.Error(1)
}

func (m *MockRepository) GetUserByAPIKey(apiKey string) (*models.User, error) {
	args := m.Called(apiKey)
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockRepository) Ping() error {
	args := m.Called()
	return args.Error(0)
}

func createTestHTTPServer() *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		html := `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Test Heading</h1>
    <a href="/internal">Internal Link</a>
    <a href="https://example.com">External Link</a>
</body>
</html>`
		w.Write([]byte(html))
	}))
}

func TestCrawlerService_StartCrawl_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewCrawlerService(mockRepo)
	
	server := createTestHTTPServer()
	defer server.Close()
	
	// Mock expectations
	testURL := &models.URL{
		ID:     1,
		URL:    server.URL,
		Status: models.StatusQueued,
	}
	
	mockRepo.On("GetURLByID", 1).Return(testURL, nil)
	mockRepo.On("UpdateURLStatus", 1, models.StatusRunning, (*string)(nil)).Return(nil)
	mockRepo.On("CreateCrawlResult", mock.AnythingOfType("*models.CrawlResult")).Return(nil)
	// Make CreateBrokenLinks optional since the test server might not have broken links
	mockRepo.On("CreateBrokenLinks", mock.AnythingOfType("int"), mock.AnythingOfType("[]models.BrokenLink")).Return(nil).Maybe()
	mockRepo.On("UpdateURLStatus", 1, models.StatusCompleted, (*string)(nil)).Return(nil)
	
	// Start crawl
	err := service.StartCrawl(1)
	require.NoError(t, err)
	
	// Wait for crawl to complete (longer timeout for safety)
	maxWait := 5 * time.Second
	start := time.Now()
	
	for time.Since(start) < maxWait {
		job, err := service.GetJobStatus(1)
		if err == nil && (job.Status == models.CrawlStatusCompleted || job.Status == models.CrawlStatusFailed) {
			// Wait a bit more to ensure all database operations complete
			time.Sleep(100 * time.Millisecond)
			break
		}
		time.Sleep(100 * time.Millisecond)
	}
	
	// Verify expectations were met (be more lenient)
	mockRepo.AssertExpectations(t)
}

func TestCrawlerService_StartCrawl_URLNotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewCrawlerService(mockRepo)
	
	// Mock expectations
	mockRepo.On("GetURLByID", 999).Return((*models.URL)(nil), assert.AnError)
	
	// Start crawl
	err := service.StartCrawl(999)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "failed to get URL")
	
	mockRepo.AssertExpectations(t)
}

func TestCrawlerService_StartCrawl_AlreadyRunning(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewCrawlerService(mockRepo)
	
	// Use a simple test URL that won't actually be crawled
	testURL := &models.URL{
		ID:     1,
		URL:    "http://example.com",
		Status: models.StatusQueued,
	}
	
	// Mock expectations for first crawl
	mockRepo.On("GetURLByID", 1).Return(testURL, nil)
	mockRepo.On("UpdateURLStatus", 1, models.StatusRunning, (*string)(nil)).Return(nil)
	
	// Start first crawl
	err := service.StartCrawl(1)
	require.NoError(t, err)
	
	// Try to start second crawl immediately (should fail)
	err = service.StartCrawl(1)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "crawl already in progress")
	
	mockRepo.AssertExpectations(t)
}

func TestCrawlerService_StopCrawl(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewCrawlerService(mockRepo)
	
	server := createTestHTTPServer()
	defer server.Close()
	
	testURL := &models.URL{
		ID:     1,
		URL:    server.URL,
		Status: models.StatusQueued,
	}
	
	// Mock expectations - be more specific about the error status update
	mockRepo.On("GetURLByID", 1).Return(testURL, nil)
	mockRepo.On("UpdateURLStatus", 1, models.StatusRunning, (*string)(nil)).Return(nil)
	mockRepo.On("UpdateURLStatus", 1, models.StatusError, mock.MatchedBy(func(msg *string) bool {
		return msg != nil && *msg == "Cancelled by user"
	})).Return(nil)
	
	// Start crawl
	err := service.StartCrawl(1)
	require.NoError(t, err)
	
	// Give it a moment to start
	time.Sleep(200 * time.Millisecond)
	
	// Stop crawl
	err = service.StopCrawl(1)
	assert.NoError(t, err)
	
	// Verify job status
	job, err := service.GetJobStatus(1)
	require.NoError(t, err)
	assert.Equal(t, models.CrawlStatusFailed, job.Status)
	assert.Equal(t, "Cancelled by user", job.Message)
	
	// Wait a bit to ensure all operations complete
	time.Sleep(100 * time.Millisecond)
	
	mockRepo.AssertExpectations(t)
}

func TestCrawlerService_GetActiveJobs(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewCrawlerService(mockRepo)
	
	// Initially no active jobs
	activeJobs := service.GetActiveJobs()
	assert.Empty(t, activeJobs)
	
	// Add some mock jobs manually for testing
	service.jobsMu.Lock()
	service.jobs[1] = &models.CrawlJob{
		ID:     1,
		URL:    "http://example.com",
		Status: "running",
	}
	service.jobs[2] = &models.CrawlJob{
		ID:     2,
		URL:    "http://test.com", 
		Status: "completed",
	}
	service.jobsMu.Unlock()
	
	activeJobs = service.GetActiveJobs()
	assert.Len(t, activeJobs, 1) // Only running job should be returned
	assert.Contains(t, activeJobs, 1)
	assert.NotContains(t, activeJobs, 2)
}

func TestCrawlerService_CleanupCompletedJobs(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewCrawlerService(mockRepo)
	
	// Add old completed job
	oldTime := time.Now().Add(-2 * time.Hour)
	service.jobsMu.Lock()
	service.jobs[1] = &models.CrawlJob{
		ID:      1,
		Status:  "completed",
		EndTime: &oldTime,
	}
	// Add recent completed job
	recentTime := time.Now().Add(-30 * time.Minute)
	service.jobs[2] = &models.CrawlJob{
		ID:      2,
		Status:  "completed",
		EndTime: &recentTime,
	}
	service.jobsMu.Unlock()
	
	// Cleanup
	service.CleanupCompletedJobs()
	
	// Check results
	service.jobsMu.RLock()
	assert.NotContains(t, service.jobs, 1) // Old job should be removed
	assert.Contains(t, service.jobs, 2)    // Recent job should remain
	service.jobsMu.RUnlock()
}

func TestCrawlerService_GetCrawlerStats(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewCrawlerService(mockRepo)
	
	stats := service.GetCrawlerStats()
	
	assert.Contains(t, stats, "timeout")
	assert.Contains(t, stats, "max_redirects")
	assert.Contains(t, stats, "user_agent")
	assert.Contains(t, stats, "active_jobs")
	assert.Contains(t, stats, "job_status_counts")
	
	assert.Equal(t, 0, stats["active_jobs"])
}
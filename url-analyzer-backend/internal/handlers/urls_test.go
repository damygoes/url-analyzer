package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"url-analyzer/internal/models"
	"url-analyzer/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// MockRepository for testing (reuse from services test)
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) CreateURL(url string) (*models.URL, error) {
	args := m.Called(url)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.URL), args.Error(1)
}

func (m *MockRepository) GetURLByURL(urlStr string) (*models.URL, error) {
	args := m.Called(urlStr)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.URL), args.Error(1)
}

func (m *MockRepository) GetURLByID(id int) (*models.URL, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
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
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.BrokenLink), args.Error(1)
}

func (m *MockRepository) GetUserByAPIKey(apiKey string) (*models.User, error) {
	args := m.Called(apiKey)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockRepository) Ping() error {
	args := m.Called()
	return args.Error(0)
}

// MockCrawlerService for testing
type MockCrawlerService struct {
	mock.Mock
}

// Ensure MockCrawlerService implements CrawlerServiceInterface
var _ services.CrawlerServiceInterface = (*MockCrawlerService)(nil)

func (m *MockCrawlerService) StartCrawl(urlID int) error {
	args := m.Called(urlID)
	return args.Error(0)
}

func (m *MockCrawlerService) StopCrawl(urlID int) error {
	args := m.Called(urlID)
	return args.Error(0)
}

func (m *MockCrawlerService) GetJobStatus(urlID int) (*models.CrawlJob, error) {
	args := m.Called(urlID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.CrawlJob), args.Error(1)
}

func (m *MockCrawlerService) GetActiveJobs() map[int]*models.CrawlJob {
	args := m.Called()
	return args.Get(0).(map[int]*models.CrawlJob)
}

func (m *MockCrawlerService) GetCrawlerStats() map[string]interface{} {
	args := m.Called()
	return args.Get(0).(map[string]interface{})
}

func (m *MockCrawlerService) CleanupCompletedJobs() {
	m.Called()
}

func setupTestRouter(repo *MockRepository, crawlerService services.CrawlerServiceInterface) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	handler := NewURLHandler(repo, crawlerService)
	
	// Add routes without auth middleware for testing
	api := router.Group("/api")
	{
		api.POST("/urls", handler.CreateURL)
		api.GET("/urls", handler.ListURLs)
		api.GET("/urls/:id", handler.GetURL)
		api.DELETE("/urls/:id", handler.DeleteURL)
		api.DELETE("/urls", handler.DeleteURLs)
		api.PUT("/urls/:id/start", handler.StartCrawl)
		api.PUT("/urls/:id/stop", handler.StopCrawl)
		api.PUT("/urls/:id/restart", handler.RestartCrawl)
		api.GET("/urls/:id/status", handler.GetCrawlStatus)
	}
	
	return router
}

func TestCreateURL_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	mockCrawler := new(MockCrawlerService)
	router := setupTestRouter(mockRepo, mockCrawler)

	testURL := &models.URL{
		ID:     1,
		URL:    "https://example.com",
		Status: models.StatusQueued,
	}

	// Mock expectations
	mockRepo.On("GetURLByURL", "https://example.com").Return((*models.URL)(nil), sql.ErrNoRows)
	mockRepo.On("CreateURL", "https://example.com").Return(testURL, nil)

	// Create request
	reqBody := models.CreateURLRequest{URL: "https://example.com"}
	jsonBody, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/api/urls", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusCreated, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, "URL added successfully", response["message"])
	assert.NotNil(t, response["url"])

	mockRepo.AssertExpectations(t)
}

func TestCreateURL_AlreadyExists(t *testing.T) {
	mockRepo := new(MockRepository)
	mockCrawler := new(MockCrawlerService)
	router := setupTestRouter(mockRepo, mockCrawler)

	existingURL := &models.URL{
		ID:     1,
		URL:    "https://example.com",
		Status: models.StatusQueued,
	}

	// Mock expectations
	mockRepo.On("GetURLByURL", "https://example.com").Return(existingURL, nil)

	// Create request
	reqBody := models.CreateURLRequest{URL: "https://example.com"}
	jsonBody, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/api/urls", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusConflict, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, "URL already exists", response["error"])

	mockRepo.AssertExpectations(t)
}

func TestCreateURL_InvalidRequest(t *testing.T) {
	mockRepo := new(MockRepository)
	mockCrawler := new(MockCrawlerService)
	router := setupTestRouter(mockRepo, mockCrawler)

	// Create invalid request (missing URL)
	reqBody := map[string]string{"invalid": "request"}
	jsonBody, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", "/api/urls", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusBadRequest, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, "Invalid request format", response["error"])
}

func TestListURLs_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	mockCrawler := new(MockCrawlerService)
	router := setupTestRouter(mockRepo, mockCrawler)

	urls := []models.URLWithResult{
		{
			URL: models.URL{
				ID:     1,
				URL:    "https://example.com",
				Status: models.StatusCompleted,
			},
		},
	}

	// Mock expectations
	mockRepo.On("ListURLs", mock.AnythingOfType("models.URLFilter")).Return(urls, 1, nil)

	req, _ := http.NewRequest("GET", "/api/urls", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response models.PaginatedResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, 1, response.Total)
	assert.Equal(t, 1, response.Page)
	assert.Equal(t, 10, response.PageSize)

	mockRepo.AssertExpectations(t)
}

func TestGetURL_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	mockCrawler := new(MockCrawlerService)
	router := setupTestRouter(mockRepo, mockCrawler)

	testURL := &models.URL{
		ID:     1,
		URL:    "https://example.com",
		Status: models.StatusCompleted,
	}

	// Mock expectations
	mockRepo.On("GetURLByID", 1).Return(testURL, nil)
	mockRepo.On("GetCrawlResultByURLID", 1).Return((*models.CrawlResult)(nil), sql.ErrNoRows)
	mockCrawler.On("GetJobStatus", 1).Return((*models.CrawlJob)(nil), assert.AnError)

	req, _ := http.NewRequest("GET", "/api/urls/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.NotNil(t, response["url"])
	assert.Nil(t, response["crawl_result"])

	mockRepo.AssertExpectations(t)
	mockCrawler.AssertExpectations(t)
}

func TestStartCrawl_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	mockCrawler := new(MockCrawlerService)
	router := setupTestRouter(mockRepo, mockCrawler)

	testURL := &models.URL{
		ID:     1,
		URL:    "https://example.com",
		Status: models.StatusQueued,
	}

	// Mock expectations
	mockRepo.On("GetURLByID", 1).Return(testURL, nil)
	mockCrawler.On("StartCrawl", 1).Return(nil)

	req, _ := http.NewRequest("PUT", "/api/urls/1/start", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, "Crawl started successfully", response["message"])

	mockRepo.AssertExpectations(t)
	mockCrawler.AssertExpectations(t)
}

func TestDeleteURL_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	mockCrawler := new(MockCrawlerService)
	router := setupTestRouter(mockRepo, mockCrawler)

	// Mock expectations
	mockCrawler.On("StopCrawl", 1).Return(nil)
	mockRepo.On("DeleteURL", 1).Return(nil)

	req, _ := http.NewRequest("DELETE", "/api/urls/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	
	assert.Equal(t, "URL deleted successfully", response["message"])

	mockRepo.AssertExpectations(t)
	mockCrawler.AssertExpectations(t)
}
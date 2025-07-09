package database

import (
	"testing"
	"url-analyzer/internal/models"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// sets up a test database connection
func setupTestDB(t *testing.T) *Repository {
	
	if err := godotenv.Load("../../.env"); err != nil {
		t.Skip("No .env file found, skipping database tests")
	}
	
	if err := InitDB(); err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}
	
	repo := NewRepository(DB)
	
	// Clean up any existing test data
	DB.Exec("DELETE FROM urls WHERE url LIKE 'https://test-%'")
	
	return repo
}

func TestRepository_CreateURL(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping database tests in short mode")
	}
	
	repo := setupTestDB(t)
	
	testURL := "https://test-example.com"
	
	// Test creating a URL
	url, err := repo.CreateURL(testURL)
	require.NoError(t, err)
	assert.NotNil(t, url)
	assert.Equal(t, testURL, url.URL)
	assert.Equal(t, models.StatusQueued, url.Status)
	assert.Greater(t, url.ID, 0)
	
	// Test duplicate URL (should fail)
	_, err = repo.CreateURL(testURL)
	assert.Error(t, err)
	assert.True(t, IsUniqueConstraintError(err))
	
	// Clean up
	repo.DeleteURL(url.ID)
}

func TestRepository_GetURLByID(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping database tests in short mode")
	}
	
	repo := setupTestDB(t)
	
	testURL := "https://test-get-by-id.com"
	
	// Create a URL first
	createdURL, err := repo.CreateURL(testURL)
	require.NoError(t, err)
	
	// Test getting URL by ID
	url, err := repo.GetURLByID(createdURL.ID)
	require.NoError(t, err)
	assert.Equal(t, createdURL.ID, url.ID)
	assert.Equal(t, testURL, url.URL)
	
	// Test getting non-existent URL
	_, err = repo.GetURLByID(99999)
	assert.Error(t, err)
	assert.True(t, IsNotFoundError(err))
	
	// Clean up
	repo.DeleteURL(createdURL.ID)
}

func TestRepository_UpdateURLStatus(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping database tests in short mode")
	}
	
	repo := setupTestDB(t)
	
	testURL := "https://test-update-status.com"
	
	// Create a URL first
	createdURL, err := repo.CreateURL(testURL)
	require.NoError(t, err)
	
	// Update status to running
	err = repo.UpdateURLStatus(createdURL.ID, models.StatusRunning, nil)
	require.NoError(t, err)
	
	// Verify status was updated
	url, err := repo.GetURLByID(createdURL.ID)
	require.NoError(t, err)
	assert.Equal(t, models.StatusRunning, url.Status)
	
	// Update status to error with message
	errorMsg := "Test error message"
	err = repo.UpdateURLStatus(createdURL.ID, models.StatusError, &errorMsg)
	require.NoError(t, err)
	
	// Verify status and error message were updated
	url, err = repo.GetURLByID(createdURL.ID)
	require.NoError(t, err)
	assert.Equal(t, models.StatusError, url.Status)
	assert.NotNil(t, url.ErrorMessage)
	assert.Equal(t, errorMsg, *url.ErrorMessage)
	
	// Clean up
	repo.DeleteURL(createdURL.ID)
}

func TestRepository_ListURLs(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping database tests in short mode")
	}
	
	repo := setupTestDB(t)
	
	// Create test URLs
	testURLs := []string{
		"https://test-list-1.com",
		"https://test-list-2.com",
		"https://test-list-3.com",
	}
	
	var createdURLs []*models.URL
	for _, testURL := range testURLs {
		url, err := repo.CreateURL(testURL)
		require.NoError(t, err)
		createdURLs = append(createdURLs, url)
	}
	
	// Test basic listing
	filter := models.URLFilter{
		Page:     1,
		PageSize: 10,
	}
	
	urls, total, err := repo.ListURLs(filter)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, len(urls), len(testURLs))
	assert.GreaterOrEqual(t, total, len(testURLs))
	
	// Test filtering by status
	statusFilter := models.StatusQueued
	filter.Status = &statusFilter
	
	urls, total, err = repo.ListURLs(filter)
	require.NoError(t, err)
	for _, url := range urls {
		assert.Equal(t, models.StatusQueued, url.Status)
	}
	
	// Test search
	filter.Status = nil
	filter.Search = "test-list"
	
	urls, total, err = repo.ListURLs(filter)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, len(urls), len(testURLs))
	
	// Clean up
	for _, url := range createdURLs {
		repo.DeleteURL(url.ID)
	}
}

func TestRepository_CreateCrawlResult(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping database tests in short mode")
	}
	
	repo := setupTestDB(t)
	
	testURL := "https://test-crawl-result.com"
	
	// Create a URL first
	createdURL, err := repo.CreateURL(testURL)
	require.NoError(t, err)
	
	// Create crawl result
	title := "Test Page Title"
	htmlVersion := "HTML5"
	crawlResult := &models.CrawlResult{
		URLID:            createdURL.ID,
		Title:            &title,
		HTMLVersion:      &htmlVersion,
		H1Count:          2,
		H2Count:          5,
		H3Count:          3,
		InternalLinks:    10,
		ExternalLinks:    5,
		BrokenLinksCount: 2,
		HasLoginForm:     true,
	}
	
	err = repo.CreateCrawlResult(crawlResult)
	require.NoError(t, err)
	assert.Greater(t, crawlResult.ID, 0)
	
	// Verify crawl result was created
	retrievedResult, err := repo.GetCrawlResultByURLID(createdURL.ID)
	require.NoError(t, err)
	assert.Equal(t, crawlResult.URLID, retrievedResult.URLID)
	assert.Equal(t, *crawlResult.Title, *retrievedResult.Title)
	assert.Equal(t, *crawlResult.HTMLVersion, *retrievedResult.HTMLVersion)
	assert.Equal(t, crawlResult.H1Count, retrievedResult.H1Count)
	assert.Equal(t, crawlResult.InternalLinks, retrievedResult.InternalLinks)
	assert.Equal(t, crawlResult.HasLoginForm, retrievedResult.HasLoginForm)
	
	// Clean up
	repo.DeleteURL(createdURL.ID)
}
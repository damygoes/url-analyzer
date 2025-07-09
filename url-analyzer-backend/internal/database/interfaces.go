package database

import "url-analyzer/internal/models"

// defines the contract for database operations
type RepositoryInterface interface {
	// URL operations
	CreateURL(url string) (*models.URL, error)
	GetURLByID(id int) (*models.URL, error)
	GetURLByURL(urlStr string) (*models.URL, error)
	ListURLs(filter models.URLFilter) ([]models.URLWithResult, int, error)
	UpdateURLStatus(id int, status models.URLStatus, errorMessage *string) error
	DeleteURL(id int) error
	DeleteURLs(ids []int) error
	
	// Crawl Result operations
	CreateCrawlResult(result *models.CrawlResult) error
	GetCrawlResultByURLID(urlID int) (*models.CrawlResult, error)
	
	// Broken Links operations
	CreateBrokenLinks(crawlResultID int, brokenLinks []models.BrokenLink) error
	GetBrokenLinksByURLID(urlID int) ([]models.BrokenLink, error)
	
	// User/Auth operations
	GetUserByAPIKey(apiKey string) (*models.User, error)
	
	// Health check
	Ping() error
}

// Ensures Repository implement RepositoryInterface
var _ RepositoryInterface = (*Repository)(nil)
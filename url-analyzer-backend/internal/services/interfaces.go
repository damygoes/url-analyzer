package services

import "url-analyzer/internal/models"

// defines the contract for crawler service operations
type CrawlerServiceInterface interface {
	StartCrawl(urlID int) error
	StopCrawl(urlID int) error
	GetJobStatus(urlID int) (*models.CrawlJob, error)
	GetActiveJobs() map[int]*models.CrawlJob
	GetCrawlerStats() map[string]interface{}
	CleanupCompletedJobs()
}

// Ensure CrawlerService implements CrawlerServiceInterface
var _ CrawlerServiceInterface = (*CrawlerService)(nil)
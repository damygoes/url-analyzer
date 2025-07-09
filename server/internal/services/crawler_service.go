package services

import (
	"fmt"
	"log"
	"sync"
	"time"
	"url-analyzer/internal/database"
	"url-analyzer/internal/models"
	"url-analyzer/pkg/crawler"
)

// handles crawling operations and database interactions
type CrawlerService struct {
	repo     database.RepositoryInterface
	crawler  *crawler.Crawler
	jobs     map[int]*models.CrawlJob
	jobsMu   sync.RWMutex
}

// creates a new crawler service
func NewCrawlerService(repo database.RepositoryInterface) *CrawlerService {
	options := models.DefaultCrawlOptions()
	
	return &CrawlerService{
		repo:    repo,
		crawler: crawler.NewCrawler(options),
		jobs:    make(map[int]*models.CrawlJob),
	}
}

// starts crawling a URL asynchronously
func (cs *CrawlerService) StartCrawl(urlID int) error {
	// Get URL from database
	urlRecord, err := cs.repo.GetURLByID(urlID)
	if err != nil {
		return fmt.Errorf("failed to get URL: %w", err)
	}
	
	// Check if already running
	cs.jobsMu.RLock()
	if job, exists := cs.jobs[urlID]; exists && job.Status != models.CrawlStatusCompleted && job.Status != models.CrawlStatusFailed {
		cs.jobsMu.RUnlock()
		return fmt.Errorf("crawl already in progress for URL ID %d", urlID)
	}
	cs.jobsMu.RUnlock()
	
	// Update status to running
	err = cs.repo.UpdateURLStatus(urlID, models.StatusRunning, nil)
	if err != nil {
		return fmt.Errorf("failed to update URL status: %w", err)
	}
	
	// Create job
	job := &models.CrawlJob{
		ID:        urlID,
		URL:       urlRecord.URL,
		Status:    models.CrawlStatusStarted,
		Progress:  0.0,
		Message:   "Starting crawl",
		StartTime: time.Now(),
		Cancel:    make(chan struct{}),
	}
	
	cs.jobsMu.Lock()
	cs.jobs[urlID] = job
	cs.jobsMu.Unlock()
	
	// Start crawling in goroutine
	go cs.performCrawl(job)
	
	return nil
}

// performs the actual crawling
func (cs *CrawlerService) performCrawl(job *models.CrawlJob) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic in crawl job %d: %v", job.ID, r)
			cs.handleCrawlError(job, fmt.Errorf("internal error during crawl"))
		}
	}()
	
	// Set up progress callback
	cs.crawler.SetProgressCallback(func(status models.CrawlStatus, message string, progress float64) {
		cs.updateJobProgress(job.ID, status, message, progress)
	})
	
	// Perform crawl
	result := cs.crawler.CrawlURL(job.URL)
	
	// Update job with result
	cs.jobsMu.Lock()
	job.Result = result
	endTime := time.Now()
	job.EndTime = &endTime
	cs.jobsMu.Unlock()
	
	if result.Error != nil {
		cs.handleCrawlError(job, result.Error)
		return
	}
	
	// Save results to database
	err := cs.saveCrawlResults(job.ID, result)
	if err != nil {
		log.Printf("Failed to save crawl results for URL ID %d: %v", job.ID, err)
		cs.handleCrawlError(job, fmt.Errorf("failed to save results: %w", err))
		return
	}
	
	// Update status to completed
	err = cs.repo.UpdateURLStatus(job.ID, models.StatusCompleted, nil)
	if err != nil {
		log.Printf("Failed to update URL status for ID %d: %v", job.ID, err)
	}
	
	cs.updateJobProgress(job.ID, models.CrawlStatusCompleted, "Crawl completed successfully", 100.0)
}

// handles errors during crawling
func (cs *CrawlerService) handleCrawlError(job *models.CrawlJob, err error) {
	errorMessage := err.Error()
	
	// Update database status
	dbErr := cs.repo.UpdateURLStatus(job.ID, models.StatusError, &errorMessage)
	if dbErr != nil {
		log.Printf("Failed to update URL status for ID %d: %v", job.ID, dbErr)
	}
	
	// Update job status
	cs.updateJobProgress(job.ID, models.CrawlStatusFailed, errorMessage, 100.0)
}

// saves crawl results to the database
func (cs *CrawlerService) saveCrawlResults(urlID int, result *models.CrawlJobResult) error {
	// Convert to database model
	crawlResult := result.ToCrawlResult(urlID)
	
	// Save crawl result
	err := cs.repo.CreateCrawlResult(crawlResult)
	if err != nil {
		return fmt.Errorf("failed to create crawl result: %w", err)
	}
	
	// Save broken links if any
	if len(result.BrokenLinks) > 0 {
		brokenLinks := result.ToBrokenLinks(crawlResult.ID)
		
		err = cs.repo.CreateBrokenLinks(crawlResult.ID, brokenLinks)
		if err != nil {
			log.Printf("Failed to save broken links: %v", err)
		}
	}
	
	return nil
}

// updates the progress of a crawl job
func (cs *CrawlerService) updateJobProgress(jobID int, status models.CrawlStatus, message string, progress float64) {
	cs.jobsMu.Lock()
	defer cs.jobsMu.Unlock()
	
	if job, exists := cs.jobs[jobID]; exists {
		job.Status = status
		job.Message = message
		job.Progress = progress
	}
}

// returns the status of a crawl job
func (cs *CrawlerService) GetJobStatus(urlID int) (*models.CrawlJob, error) {
	cs.jobsMu.RLock()
	defer cs.jobsMu.RUnlock()
	
	job, exists := cs.jobs[urlID]
	if !exists {
		return nil, fmt.Errorf("no active job found for URL ID %d", urlID)
	}
	
	// Return a copy to avoid race conditions
	jobCopy := *job
	return &jobCopy, nil
}

// stops an active crawl job
func (cs *CrawlerService) StopCrawl(urlID int) error {
	cs.jobsMu.Lock()
	defer cs.jobsMu.Unlock()
	
	job, exists := cs.jobs[urlID]
	if !exists {
		return fmt.Errorf("no active job found for URL ID %d", urlID)
	}
	
	if job.Status == models.CrawlStatusCompleted || job.Status == models.CrawlStatusFailed {
		return fmt.Errorf("job already finished")
	}
	
	// Signal cancellation
	close(job.Cancel)
	
	// Update status
	job.Status = models.CrawlStatusFailed
	job.Message = "Cancelled by user"
	job.Progress = 100.0
	endTime := time.Now()
	job.EndTime = &endTime
	
	// Update database
	errorMessage := "Cancelled by user"
	err := cs.repo.UpdateURLStatus(urlID, models.StatusError, &errorMessage)
	if err != nil {
		log.Printf("Failed to update URL status for cancelled job %d: %v", urlID, err)
	}
	
	return nil
}

// removes completed jobs from memory
func (cs *CrawlerService) CleanupCompletedJobs() {
	cs.jobsMu.Lock()
	defer cs.jobsMu.Unlock()
	
	for id, job := range cs.jobs {
		if job.Status == models.CrawlStatusCompleted || job.Status == models.CrawlStatusFailed {
			if job.EndTime != nil && time.Since(*job.EndTime) > 1*time.Hour {
				delete(cs.jobs, id)
			}
		}
	}
}

// returns all active crawl jobs
func (cs *CrawlerService) GetActiveJobs() map[int]*models.CrawlJob {
	cs.jobsMu.RLock()
	defer cs.jobsMu.RUnlock()
	
	activeJobs := make(map[int]*models.CrawlJob)
	for id, job := range cs.jobs {
		if job.Status != models.CrawlStatusCompleted && job.Status != models.CrawlStatusFailed {
			jobCopy := *job
			activeJobs[id] = &jobCopy
		}
	}
	
	return activeJobs
}

// returns crawler statistics
func (cs *CrawlerService) GetCrawlerStats() map[string]interface{} {
	cs.jobsMu.RLock()
	defer cs.jobsMu.RUnlock()
	
	stats := cs.crawler.GetStats()
	stats["active_jobs"] = len(cs.jobs)
	
	statusCounts := make(map[string]int)
	for _, job := range cs.jobs {
		statusCounts[string(job.Status)]++
	}
	stats["job_status_counts"] = statusCounts
	
	return stats
}
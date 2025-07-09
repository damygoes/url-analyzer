package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"url-analyzer/internal/database"
	"url-analyzer/internal/models"
	"url-analyzer/internal/services"

	"github.com/gin-gonic/gin"
)

// handles URL-related HTTP requests
type URLHandler struct {
	repo           database.RepositoryInterface
	crawlerService services.CrawlerServiceInterface
}

// creates a new URL handler
func NewURLHandler(repo database.RepositoryInterface, crawlerService services.CrawlerServiceInterface) *URLHandler {
	return &URLHandler{
		repo:           repo,
		crawlerService: crawlerService,
	}
}

// handles POST /api/urls
func (h *URLHandler) CreateURL(c *gin.Context) {
	var req models.CreateURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Check if URL already exists
	existingURL, err := h.repo.GetURLByURL(req.URL)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "URL already exists",
			"url_id":  existingURL.ID,
			"message": "This URL has already been added for analysis",
		})
		return
	}

	// Create new URL
	url, err := h.repo.CreateURL(req.URL)
	if err != nil {
		if database.IsUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "URL already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create URL", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "URL added successfully",
		"url":     url,
	})
}

// handles GET /api/urls
func (h *URLHandler) ListURLs(c *gin.Context) {
	var filter models.URLFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters", "details": err.Error()})
		return
	}

	// Set defaults
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.PageSize <= 0 || filter.PageSize > 100 {
		filter.PageSize = 10
	}
	if filter.SortBy == "" {
		filter.SortBy = "created_at"
	}
	if filter.SortOrder == "" {
		filter.SortOrder = "desc"
	}

	urls, total, err := h.repo.ListURLs(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URLs", "details": err.Error()})
		return
	}

	totalPages := (total + filter.PageSize - 1) / filter.PageSize

	response := models.PaginatedResponse{
		Data:       urls,
		Page:       filter.Page,
		PageSize:   filter.PageSize,
		Total:      total,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// handles GET /api/urls/:id
func (h *URLHandler) GetURL(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	url, err := h.repo.GetURLByID(id)
	if err != nil {
		if database.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URL", "details": err.Error()})
		return
	}

	// Get crawl result if available
	crawlResult, err := h.repo.GetCrawlResultByURLID(id)
	if err != nil && !database.IsNotFoundError(err) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch crawl result", "details": err.Error()})
		return
	}

	// Get broken links if crawl result exists
	var brokenLinks []models.BrokenLink
	if crawlResult != nil {
		brokenLinks, err = h.repo.GetBrokenLinksByURLID(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch broken links", "details": err.Error()})
			return
		}
	}

	response := gin.H{
		"url":          url,
		"crawl_result": crawlResult,
		"broken_links": brokenLinks,
	}

	// Add job status if currently crawling
	if jobStatus, err := h.crawlerService.GetJobStatus(id); err == nil {
		response["job_status"] = jobStatus
	}

	c.JSON(http.StatusOK, response)
}

// handles PUT /api/urls/:id/start
func (h *URLHandler) StartCrawl(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	// Check if URL exists
	_, err = h.repo.GetURLByID(id)
	if err != nil {
		if database.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URL", "details": err.Error()})
		return
	}

	// Start crawling
	err = h.crawlerService.StartCrawl(id)
	if err != nil {
		if strings.Contains(err.Error(), "already in progress") {
			c.JSON(http.StatusConflict, gin.H{"error": "Crawl already in progress for this URL"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start crawl", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Crawl started successfully"})
}

// handles PUT /api/urls/:id/stop
func (h *URLHandler) StopCrawl(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	err = h.crawlerService.StopCrawl(id)
	if err != nil {
		if strings.Contains(err.Error(), "no active job") {
			c.JSON(http.StatusNotFound, gin.H{"error": "No active crawl job found for this URL"})
			return
		}
		if strings.Contains(err.Error(), "already finished") {
			c.JSON(http.StatusConflict, gin.H{"error": "Crawl job already finished"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stop crawl", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Crawl stopped successfully"})
}

// handles GET /api/urls/:id/status
func (h *URLHandler) GetCrawlStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	jobStatus, err := h.crawlerService.GetJobStatus(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active crawl job found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"job_status": jobStatus})
}

// handles DELETE /api/urls/:id
func (h *URLHandler) DeleteURL(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	// Stop any active crawl first
	h.crawlerService.StopCrawl(id) // Ignore error if no job exists

	err = h.repo.DeleteURL(id)
	if err != nil {
		if database.IsNotFoundError(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete URL", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "URL deleted successfully"})
}

// handles DELETE /api/urls (bulk delete)
func (h *URLHandler) DeleteURLs(c *gin.Context) {
	var req struct {
		IDs []int `json:"ids" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format", "details": err.Error()})
		return
	}

	// Stop any active crawls first
	for _, id := range req.IDs {
		h.crawlerService.StopCrawl(id) // Ignore errors
	}

	err := h.repo.DeleteURLs(req.IDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete URLs", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "URLs deleted successfully",
		"count":   len(req.IDs),
	})
}

// handles PUT /api/urls/:id/restart
func (h *URLHandler) RestartCrawl(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	// Stop existing crawl if running
	h.crawlerService.StopCrawl(id) // Ignore error

	// Reset URL status to queued
	err = h.repo.UpdateURLStatus(id, models.StatusQueued, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset URL status", "details": err.Error()})
		return
	}

	// Start new crawl
	err = h.crawlerService.StartCrawl(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restart crawl", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Crawl restarted successfully"})
}
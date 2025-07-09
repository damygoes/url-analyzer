package handlers

import (
	"net/http"
	"runtime"
	"time"
	"url-analyzer/internal/database"
	"url-analyzer/internal/services"

	"github.com/gin-gonic/gin"
)

// handles system-related HTTP requests
type SystemHandler struct {
	repo           database.RepositoryInterface
	crawlerService services.CrawlerServiceInterface
	startTime      time.Time
}

// creates a new system handler
func NewSystemHandler(repo database.RepositoryInterface, crawlerService services.CrawlerServiceInterface) *SystemHandler {
	return &SystemHandler{
		repo:           repo,
		crawlerService: crawlerService,
		startTime:      time.Now(),
	}
}

// handles GET /api/health
func (h *SystemHandler) Health(c *gin.Context) {
	health := gin.H{
		"status":    "ok",
		"timestamp": time.Now().UTC(),
		"uptime":    time.Since(h.startTime).String(),
		"version":   "1.0.0",
	}

	// Check database connection
	if err := h.repo.Ping(); err != nil {
		health["status"] = "degraded"
		health["database"] = "unhealthy"
		health["database_error"] = err.Error()
		c.JSON(http.StatusServiceUnavailable, health)
		return
	} else {
		health["database"] = "healthy"
	}

	// Add system metrics
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	health["memory_mb"] = m.Alloc / 1024 / 1024
	health["goroutines"] = runtime.NumGoroutine()

	c.JSON(http.StatusOK, health)
}

// handles GET /api/stats
func (h *SystemHandler) Stats(c *gin.Context) {
	// Get database statistics
	dbStats, err := database.GetDatabaseStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get database stats", "details": err.Error()})
		return
	}

	// Get crawler statistics
	crawlerStats := h.crawlerService.GetCrawlerStats()

	// Get active jobs
	activeJobs := h.crawlerService.GetActiveJobs()

	stats := gin.H{
		"database":     dbStats,
		"crawler":      crawlerStats,
		"active_jobs":  len(activeJobs),
		"jobs_detail":  activeJobs,
		"system": gin.H{
			"uptime":     time.Since(h.startTime).String(),
			"goroutines": runtime.NumGoroutine(),
		},
	}

	c.JSON(http.StatusOK, stats)
}

// handles GET /api/jobs
func (h *SystemHandler) GetActiveJobs(c *gin.Context) {
	activeJobs := h.crawlerService.GetActiveJobs()
	
	c.JSON(http.StatusOK, gin.H{
		"active_jobs": activeJobs,
		"count":       len(activeJobs),
	})
}

// handles POST /api/jobs/cleanup
func (h *SystemHandler) CleanupJobs(c *gin.Context) {
	h.crawlerService.CleanupCompletedJobs()
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Completed jobs cleaned up successfully",
	})
}
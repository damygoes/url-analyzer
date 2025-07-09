// @title URL Analyzer API
// @version 1.0
// @description A web application that accepts website URLs, crawls them and displays key information about the pages.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8000
// @BasePath /api

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
// @description Enter your API key in the format: test-api-key-12345

package main

import (
	"log"
	"os"
	"url-analyzer/docs"
	"url-analyzer/internal/database"
	"url-analyzer/internal/handlers"
	"url-analyzer/internal/middleware"
	"url-analyzer/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.CloseDB()

	if err := database.ValidateSchema(); err != nil {
		log.Fatalf("Database schema validation failed: %v", err)
	}

	if err := database.SeedDatabase(); err != nil {
		log.Printf("Warning: Failed to seed database: %v", err)
	}

	// Initialize repository and services
	repo := database.GetRepository()
	crawlerService := services.NewCrawlerService(repo)

	// Initialize handlers
	urlHandler := handlers.NewURLHandler(repo, crawlerService)
	systemHandler := handlers.NewSystemHandler(repo, crawlerService)

	// Setup Gin router
	router := setupRouter(repo, urlHandler, systemHandler)

	// Get server configuration
	port := getEnv("SERVER_PORT", "8000")
	host := getEnv("SERVER_HOST", "0.0.0.0")

	log.Printf("Starting server on %s:%s", host, port)
	log.Printf("API endpoints available at http://%s:%s/api", host, port)
	log.Printf("Swagger documentation: http://%s:%s/swagger/index.html", host, port)
	log.Printf("Health check: http://%s:%s/api/health", host, port)

	// Start server
	if err := router.Run(host + ":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRouter(repo database.RepositoryInterface, urlHandler *handlers.URLHandler, systemHandler *handlers.SystemHandler) *gin.Engine {
	// Set Gin mode based on environment
	if getEnv("GIN_MODE", "debug") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	router.Use(middleware.ErrorHandlingMiddleware())
	router.Use(middleware.LoggingMiddleware())
	router.Use(middleware.CORSMiddleware())

	// Swagger documentation
	docs.SwaggerInfo.Host = getEnv("SERVER_HOST", "localhost") + ":" + getEnv("SERVER_PORT", "8000")
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Public routes (no auth required)
	public := router.Group("/api")
	{
		public.GET("/health", systemHandler.Health)
	}

	// Protected routes (auth required)
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware(repo))
	{
		// URL management
		protected.POST("/urls", urlHandler.CreateURL)
		protected.GET("/urls", urlHandler.ListURLs)
		protected.GET("/urls/:id", urlHandler.GetURL)
		protected.DELETE("/urls/:id", urlHandler.DeleteURL)
		protected.DELETE("/urls", urlHandler.DeleteURLs) 

		// Crawl control
		protected.PUT("/urls/:id/start", urlHandler.StartCrawl)
		protected.PUT("/urls/:id/stop", urlHandler.StopCrawl)
		protected.PUT("/urls/:id/restart", urlHandler.RestartCrawl)
		protected.GET("/urls/:id/status", urlHandler.GetCrawlStatus)

		// System and monitoring
		protected.GET("/stats", systemHandler.Stats)
		protected.GET("/jobs", systemHandler.GetActiveJobs)
		protected.POST("/jobs/cleanup", systemHandler.CleanupJobs)
	}

	// catch-all for undefined endpoints
	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "Endpoint not found"})
	})

	return router
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
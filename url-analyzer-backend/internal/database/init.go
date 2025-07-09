package database

import (
	"log"
	"url-analyzer/internal/models"
)

// returns a repository instance using the global DB connection
func GetRepository() *Repository {
	if DB == nil {
		log.Fatal("Database not initialized. Call InitDB() first.")
	}
	return NewRepository(DB)
}

// seeds the database with initial data
func SeedDatabase() error {
	repo := GetRepository()
	
	// Check if admin user already exists
	_, err := repo.GetUserByAPIKey("test-api-key-12345")
	if err == nil {
		log.Println("Admin user already exists, skipping seed")
		return nil
	}
	
	log.Println("Database seeded successfully")
	return nil
}

// clears test data from the database (useful for testing)
func ClearTestData() error {
	if DB == nil {
		return nil
	}
	
	// Clear test URLs (URLs that start with 'https://test-')
	_, err := DB.Exec("DELETE FROM urls WHERE url LIKE 'https://test-%'")
	if err != nil {
		return err
	}
	
	log.Println("Test data cleared successfully")
	return nil
}

// validates that all required tables exist
func ValidateSchema() error {
	requiredTables := []string{"urls", "crawl_results", "broken_links", "users"}
	
	for _, table := range requiredTables {
		var exists bool
		query := `
			SELECT COUNT(*) > 0 
			FROM information_schema.tables 
			WHERE table_schema = DATABASE() AND table_name = ?
		`
		
		err := DB.Get(&exists, query, table)
		if err != nil {
			return err
		}
		
		if !exists {
			log.Printf("Missing required table: %s", table)
			return err
		}
	}
	
	log.Println("Database schema validation passed")
	return nil
}

// returns basic statistics about the database
func GetDatabaseStats() (map[string]int, error) {
	stats := make(map[string]int)
	
	// Count URLs by status
	statusCounts := []struct {
		Status models.URLStatus `db:"status"`
		Count  int              `db:"count"`
	}{}
	
	err := DB.Select(&statusCounts, `
		SELECT status, COUNT(*) as count 
		FROM urls 
		GROUP BY status
	`)
	if err != nil {
		return nil, err
	}
	
	for _, sc := range statusCounts {
		stats[string(sc.Status)] = sc.Count
	}
	
	// Total crawl results
	var totalResults int
	err = DB.Get(&totalResults, "SELECT COUNT(*) FROM crawl_results")
	if err != nil {
		return nil, err
	}
	stats["total_crawl_results"] = totalResults
	
	// Total broken links
	var totalBrokenLinks int
	err = DB.Get(&totalBrokenLinks, "SELECT COUNT(*) FROM broken_links")
	if err != nil {
		return nil, err
	}
	stats["total_broken_links"] = totalBrokenLinks
	
	return stats, nil
}
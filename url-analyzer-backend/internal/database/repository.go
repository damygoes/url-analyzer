package database

import (
	"database/sql"
	"fmt"
	"strings"
	"url-analyzer/internal/models"

	"github.com/jmoiron/sqlx"
)

// handles database operations
type Repository struct {
	db *sqlx.DB
}

// creates a new repository instance
func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

// URL operations

// creates a new URL record
func (r *Repository) CreateURL(url string) (*models.URL, error) {
	query := `
		INSERT INTO urls (url, status) 
		VALUES (?, ?)
	`
	
	result, err := r.db.Exec(query, url, models.StatusQueued)
	if err != nil {
		return nil, fmt.Errorf("failed to create URL: %w", err)
	}
	
	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert ID: %w", err)
	}
	
	return r.GetURLByID(int(id))
}

// retrieves a URL by its ID
func (r *Repository) GetURLByID(id int) (*models.URL, error) {
	var url models.URL
	query := `
		SELECT id, url, status, error_message, created_at, updated_at 
		FROM urls 
		WHERE id = ?
	`
	
	err := r.db.Get(&url, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("URL not found")
		}
		return nil, fmt.Errorf("failed to get URL: %w", err)
	}
	
	return &url, nil
}

// retrieves a URL by its URL string
func (r *Repository) GetURLByURL(urlStr string) (*models.URL, error) {
	var url models.URL
	query := `
		SELECT id, url, status, error_message, created_at, updated_at 
		FROM urls 
		WHERE url = ?
	`
	
	err := r.db.Get(&url, query, urlStr)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("URL not found")
		}
		return nil, fmt.Errorf("failed to get URL: %w", err)
	}
	
	return &url, nil
}

// retrieves URLs with pagination and filtering
func (r *Repository) ListURLs(filter models.URLFilter) ([]models.URLWithResult, int, error) {
	// Build WHERE clause
	var whereClauses []string
	var args []interface{}
	
	if filter.Status != nil {
		whereClauses = append(whereClauses, "u.status = ?")
		args = append(args, *filter.Status)
	}
	
	if filter.Search != "" {
		whereClauses = append(whereClauses, "(u.url LIKE ? OR COALESCE(cr.title, '') LIKE ?)")
		searchTerm := "%" + filter.Search + "%"
		args = append(args, searchTerm, searchTerm)
	}
	
	whereClause := ""
	if len(whereClauses) > 0 {
		whereClause = "WHERE " + strings.Join(whereClauses, " AND ")
	}
	
	// Build ORDER BY clause
	orderBy := "u.created_at DESC"
	if filter.SortBy != "" {
		direction := "ASC"
		if filter.SortOrder == "desc" {
			direction = "DESC"
		}
		
		switch filter.SortBy {
		case "url", "status", "created_at", "updated_at":
			orderBy = fmt.Sprintf("u.%s %s", filter.SortBy, direction)
		case "title":
			orderBy = fmt.Sprintf("COALESCE(cr.title, '') %s", direction)
		case "internal_links":
			orderBy = fmt.Sprintf("COALESCE(cr.internal_links, 0) %s", direction)
		case "external_links":
			orderBy = fmt.Sprintf("COALESCE(cr.external_links, 0) %s", direction)
		case "broken_links_count":
			orderBy = fmt.Sprintf("COALESCE(cr.broken_links_count, 0) %s", direction)
		}
	}
	
	// Count total records
	countQuery := fmt.Sprintf(`
		SELECT COUNT(DISTINCT u.id)
		FROM urls u
		LEFT JOIN crawl_results cr ON u.id = cr.url_id
		%s
	`, whereClause)
	
	var total int
	err := r.db.Get(&total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count URLs: %w", err)
	}
	
	// Get paginated results - Split into two queries for simplicity
	offset := (filter.Page - 1) * filter.PageSize
	
	// get the URLs
	urlQuery := fmt.Sprintf(`
		SELECT DISTINCT u.id, u.url, u.status, u.error_message, u.created_at, u.updated_at
		FROM urls u
		LEFT JOIN crawl_results cr ON u.id = cr.url_id
		%s
		ORDER BY %s
		LIMIT ? OFFSET ?
	`, whereClause, orderBy)
	
	args = append(args, filter.PageSize, offset)
	
	var urls []models.URL
	err = r.db.Select(&urls, urlQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list URLs: %w", err)
	}
	
	// get crawl results for these URLs
	var results []models.URLWithResult
	for _, url := range urls {
		result := models.URLWithResult{URL: url}
		
		// Get the latest crawl result for this URL
		crawlResult, err := r.GetCrawlResultByURLID(url.ID)
		if err == nil {
			result.CrawlResult = crawlResult
		}
		
		results = append(results, result)
	}
	
	return results, total, nil
}

// updates the status of a URL
func (r *Repository) UpdateURLStatus(id int, status models.URLStatus, errorMessage *string) error {
	query := `
		UPDATE urls 
		SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ?
	`
	
	_, err := r.db.Exec(query, status, errorMessage, id)
	if err != nil {
		return fmt.Errorf("failed to update URL status: %w", err)
	}
	
	return nil
}

// deletes a URL and its related data
func (r *Repository) DeleteURL(id int) error {
	query := `DELETE FROM urls WHERE id = ?`
	
	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete URL: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("URL not found")
	}
	
	return nil
}

// deletes multiple URLs
func (r *Repository) DeleteURLs(ids []int) error {
	if len(ids) == 0 {
		return nil
	}
	
	// Create placeholders for IN clause
	placeholders := strings.Repeat("?,", len(ids)-1) + "?"
	query := fmt.Sprintf(`DELETE FROM urls WHERE id IN (%s)`, placeholders)
	
	// Convert int slice to interface slice
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		args[i] = id
	}
	
	_, err := r.db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("failed to delete URLs: %w", err)
	}
	
	return nil
}

// Crawl Result operations

// creates a new crawl result
func (r *Repository) CreateCrawlResult(result *models.CrawlResult) error {
	query := `
		INSERT INTO crawl_results (
			url_id, title, html_version, h1_count, h2_count, h3_count, 
			h4_count, h5_count, h6_count, internal_links, external_links, 
			broken_links_count, has_login_form
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	
	execResult, err := r.db.Exec(query,
		result.URLID, result.Title, result.HTMLVersion, result.H1Count,
		result.H2Count, result.H3Count, result.H4Count, result.H5Count,
		result.H6Count, result.InternalLinks, result.ExternalLinks,
		result.BrokenLinksCount, result.HasLoginForm,
	)
	if err != nil {
		return fmt.Errorf("failed to create crawl result: %w", err)
	}
	
	id, err := execResult.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert ID: %w", err)
	}
	
	result.ID = int(id)
	return nil
}

// retrieves the crawl result for a URL
func (r *Repository) GetCrawlResultByURLID(urlID int) (*models.CrawlResult, error) {
	var result models.CrawlResult
	query := `
		SELECT id, url_id, title, html_version, h1_count, h2_count, h3_count, 
			   h4_count, h5_count, h6_count, internal_links, external_links, 
			   broken_links_count, has_login_form, crawled_at
		FROM crawl_results 
		WHERE url_id = ?
		ORDER BY crawled_at DESC
		LIMIT 1
	`
	
	err := r.db.Get(&result, query, urlID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("crawl result not found")
		}
		return nil, fmt.Errorf("failed to get crawl result: %w", err)
	}
	
	return &result, nil
}

// Broken Links operations

// creates multiple broken link records
func (r *Repository) CreateBrokenLinks(crawlResultID int, brokenLinks []models.BrokenLink) error {
	if len(brokenLinks) == 0 {
		return nil
	}
	
	query := `
		INSERT INTO broken_links (crawl_result_id, url, status_code, error_message) 
		VALUES (?, ?, ?, ?)
	`
	
	tx, err := r.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()
	
	for _, link := range brokenLinks {
		_, err := tx.Exec(query, crawlResultID, link.URL, link.StatusCode, link.ErrorMessage)
		if err != nil {
			return fmt.Errorf("failed to create broken link: %w", err)
		}
	}
	
	return tx.Commit()
}

// retrieves broken links for a URL
func (r *Repository) GetBrokenLinksByURLID(urlID int) ([]models.BrokenLink, error) {
	query := `
		SELECT bl.id, bl.crawl_result_id, bl.url, bl.status_code, bl.error_message
		FROM broken_links bl
		JOIN crawl_results cr ON bl.crawl_result_id = cr.id
		WHERE cr.url_id = ?
		ORDER BY bl.status_code, bl.url
	`
	
	var brokenLinks []models.BrokenLink
	err := r.db.Select(&brokenLinks, query, urlID)
	if err != nil {
		return nil, fmt.Errorf("failed to get broken links: %w", err)
	}
	
	return brokenLinks, nil
}

// User/Auth operations

// retrieves a user by API key
func (r *Repository) GetUserByAPIKey(apiKey string) (*models.User, error) {
	var user models.User
	query := `
		SELECT id, username, api_key, created_at 
		FROM users 
		WHERE api_key = ?
	`
	
	err := r.db.Get(&user, query, apiKey)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("invalid API key")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	return &user, nil
}

// Health check

// checks if the database is accessible
func (r *Repository) Ping() error {
	return r.db.Ping()
}
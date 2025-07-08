package models

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// URLStatus represents the status of a URL crawl
type URLStatus string

const (
	StatusQueued    URLStatus = "queued"
	StatusRunning   URLStatus = "running"
	StatusCompleted URLStatus = "completed"
	StatusError     URLStatus = "error"
)

// Scan implements the sql.Scanner interface
func (s *URLStatus) Scan(value interface{}) error {
	if value == nil {
		*s = StatusQueued
		return nil
	}
	switch v := value.(type) {
	case string:
		*s = URLStatus(v)
	case []byte:
		*s = URLStatus(v)
	default:
		return fmt.Errorf("cannot scan %T into URLStatus", value)
	}
	return nil
}

// Value implements the driver.Valuer interface
func (s URLStatus) Value() (driver.Value, error) {
	return string(s), nil
}

// URL represents a URL to be crawled
type URL struct {
	ID           int       `json:"id" db:"id"`
	URL          string    `json:"url" db:"url"`
	Status       URLStatus `json:"status" db:"status"`
	ErrorMessage *string   `json:"error_message,omitempty" db:"error_message"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// CrawlResult represents the result of crawling a URL
type CrawlResult struct {
	ID               int       `json:"id" db:"id"`
	URLID            int       `json:"url_id" db:"url_id"`
	Title            *string   `json:"title" db:"title"`
	HTMLVersion      *string   `json:"html_version" db:"html_version"`
	H1Count          int       `json:"h1_count" db:"h1_count"`
	H2Count          int       `json:"h2_count" db:"h2_count"`
	H3Count          int       `json:"h3_count" db:"h3_count"`
	H4Count          int       `json:"h4_count" db:"h4_count"`
	H5Count          int       `json:"h5_count" db:"h5_count"`
	H6Count          int       `json:"h6_count" db:"h6_count"`
	InternalLinks    int       `json:"internal_links" db:"internal_links"`
	ExternalLinks    int       `json:"external_links" db:"external_links"`
	BrokenLinksCount int       `json:"broken_links_count" db:"broken_links_count"`
	HasLoginForm     bool      `json:"has_login_form" db:"has_login_form"`
	CrawledAt        time.Time `json:"crawled_at" db:"crawled_at"`
}

// BrokenLink represents a broken link found during crawling
type BrokenLink struct {
	ID              int    `json:"id" db:"id"`
	CrawlResultID   int    `json:"crawl_result_id" db:"crawl_result_id"`
	URL             string `json:"url" db:"url"`
	StatusCode      int    `json:"status_code" db:"status_code"`
	ErrorMessage    string `json:"error_message" db:"error_message"`
}

// User represents an API user
type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	APIKey    string    `json:"api_key" db:"api_key"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// URLWithResult combines URL with its crawl result
type URLWithResult struct {
	URL
	CrawlResult *CrawlResult `json:"crawl_result,omitempty"`
}

// HeadingCounts returns a map of heading counts
func (cr *CrawlResult) HeadingCounts() map[string]int {
	return map[string]int{
		"h1": cr.H1Count,
		"h2": cr.H2Count,
		"h3": cr.H3Count,
		"h4": cr.H4Count,
		"h5": cr.H5Count,
		"h6": cr.H6Count,
	}
}

// CreateURLRequest represents the request to create a new URL
type CreateURLRequest struct {
	URL string `json:"url" binding:"required,url"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	Total      int         `json:"total"`
	TotalPages int         `json:"total_pages"`
}

// URLFilter represents filters for URL listing
type URLFilter struct {
	Status    *URLStatus `form:"status"`
	Search    string     `form:"search"`
	Page      int        `form:"page,default=1"`
	PageSize  int        `form:"page_size,default=10"`
	SortBy    string     `form:"sort_by,default=created_at"`
	SortOrder string     `form:"sort_order,default=desc"`
}
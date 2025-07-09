# URL Analyzer API Documentation

## Authentication

All API endpoints (except `/api/health`) require authentication using an API key.

Send the API key in the `Authorization` header:
```
Authorization: Bearer test-api-key-12345
```
or
```
Authorization: test-api-key-12345
```

## Base URL

```
http://localhost:8000/api
```

## Endpoints

### Health Check

#### GET /health
Returns the health status of the API.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-09T10:30:00Z",
  "uptime": "2h30m15s",
  "version": "1.0.0",
  "database": "healthy",
  "memory_mb": 45,
  "goroutines": 12
}
```

### URL Management

#### POST /urls
Add a new URL for analysis.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "message": "URL added successfully",
  "url": {
    "id": 1,
    "url": "https://example.com",
    "status": "queued",
    "created_at": "2025-07-09T10:30:00Z",
    "updated_at": "2025-07-09T10:30:00Z"
  }
}
```

#### GET /urls
List URLs with pagination and filtering.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 10, max: 100)
- `status` (string): Filter by status (queued, running, completed, error)
- `search` (string): Search in URL or title
- `sort_by` (string): Sort field (url, status, created_at, title, etc.)
- `sort_order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "url": "https://example.com",
      "status": "completed",
      "created_at": "2025-07-09T10:30:00Z",
      "updated_at": "2025-07-09T10:35:00Z",
      "crawl_result": {
        "title": "Example Domain",
        "html_version": "HTML5",
        "h1_count": 1,
        "h2_count": 0,
        "internal_links": 5,
        "external_links": 3,
        "broken_links_count": 1,
        "has_login_form": false
      }
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 25,
  "total_pages": 3
}
```

#### GET /urls/:id
Get detailed information about a specific URL.

**Response:**
```json
{
  "url": {
    "id": 1,
    "url": "https://example.com",
    "status": "completed"
  },
  "crawl_result": {
    "title": "Example Domain",
    "html_version": "HTML5",
    "h1_count": 1,
    "h2_count": 0,
    "h3_count": 0,
    "internal_links": 5,
    "external_links": 3,
    "broken_links_count": 1,
    "has_login_form": false,
    "crawled_at": "2025-07-09T10:35:00Z"
  },
  "broken_links": [
    {
      "url": "https://example.com/broken-page",
      "status_code": 404,
      "error_message": "Not Found",
      "link_text": "Broken Link",
      "is_internal": true
    }
  ]
}
```

#### DELETE /urls/:id
Delete a specific URL.

**Response:**
```json
{
  "message": "URL deleted successfully"
}
```

#### DELETE /urls
Delete multiple URLs (bulk delete).

**Request:**
```json
{
  "ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "message": "URLs deleted successfully",
  "count": 3
}
```

### Crawl Control

#### PUT /urls/:id/start
Start crawling a URL.

**Response:**
```json
{
  "message": "Crawl started successfully"
}
```

#### PUT /urls/:id/stop
Stop an active crawl.

**Response:**
```json
{
  "message": "Crawl stopped successfully"
}
```

#### PUT /urls/:id/restart
Restart crawling a URL (stops current if running, resets status, starts new crawl).

**Response:**
```json
{
  "message": "Crawl restarted successfully"
}
```

#### GET /urls/:id/status
Get real-time crawl status for a URL.

**Response:**
```json
{
  "job_status": {
    "id": 1,
    "url": "https://example.com",
    "status": "running",
    "progress": 45.5,
    "message": "Analyzing content",
    "start_time": "2025-07-09T10:30:00Z"
  }
}
```

### System & Monitoring

#### GET /stats
Get system and crawler statistics.

**Response:**
```json
{
  "database": {
    "queued": 5,
    "running": 2,
    "completed": 18,
    "error": 1,
    "total_crawl_results": 19,
    "total_broken_links": 45
  },
  "crawler": {
    "timeout": "30s",
    "max_redirects": 5,
    "user_agent": "URL-Analyzer-Bot/1.0",
    "active_jobs": 2
  },
  "active_jobs": 2,
  "system": {
    "uptime": "2h30m15s",
    "goroutines": 15
  }
}
```

#### GET /jobs
Get all active crawl jobs.

**Response:**
```json
{
  "active_jobs": {
    "1": {
      "id": 1,
      "url": "https://example.com",
      "status": "running",
      "progress": 45.5,
      "message": "Analyzing content"
    }
  },
  "count": 1
}
```

#### POST /jobs/cleanup
Clean up completed crawl jobs from memory.

**Response:**
```json
{
  "message": "Completed jobs cleaned up successfully"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error description",
  "details": "Detailed error message (optional)"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized  
- `404` - Not Found
- `409` - Conflict (e.g., URL already exists)
- `500` - Internal Server Error
- `503` - Service Unavailable

## Example Usage

### Using curl

```bash
# Add a URL
curl -X POST http://localhost:8000/api/urls \
  -H "Authorization: test-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Start crawling
curl -X PUT http://localhost:8000/api/urls/1/start \
  -H "Authorization: test-api-key-12345"

# Check status
curl -X GET http://localhost:8000/api/urls/1/status \
  -H "Authorization: test-api-key-12345"

# Get results
curl -X GET http://localhost:8000/api/urls/1 \
  -H "Authorization: test-api-key-12345"
```

### Using JavaScript/Fetch

```javascript
const apiKey = 'test-api-key-12345';
const baseURL = 'http://localhost:8000/api';

// Add URL
const response = await fetch(`${baseURL}/urls`, {
  method: 'POST',
  headers: {
    'Authorization': apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: 'https://example.com' })
});

const result = await response.json();
console.log(result);
```
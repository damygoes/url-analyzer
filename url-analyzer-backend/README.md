# URL Analyzer Backend

A Go-based REST API that crawls websites and analyzes their content, providing detailed information about HTML structure, links, and forms.

## 🚀 Features

- **URL Crawling**: Fetch and analyze website content
- **HTML Analysis**: Extract title, HTML version, heading counts
- **Link Analysis**: Count internal vs external links, detect broken links
- **Form Detection**: Identify login forms on pages
- **Real-time Progress**: Track crawling status with live updates
- **REST API**: Full CRUD operations with authentication
- **Interactive Documentation**: Swagger UI for API testing
- **Containerized**: Docker setup for easy deployment

## 🛠 Tech Stack

- **Language**: Go 1.24
- **Framework**: Gin (HTTP router)
- **Database**: MySQL 8.0
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Testing**: Built-in Go testing with testify

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Git](https://git-scm.com/downloads)

> **Note**: You don't need Go installed locally since we use Docker!

## 🔧 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/damygoes/url-analyzer.git
cd url-analyzer-backend
```

### 2. Start the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

This will start:
- **API Server**: `http://localhost:8000`
- **MySQL Database**: `localhost:3306`
- **Adminer** (DB Admin): `http://localhost:8080`

### 3. Verify Everything is Running

```bash
# Check health endpoint
curl http://localhost:8000/api/health

# Expected response:
# {
#   "status": "ok",
#   "database": "healthy",
#   "timestamp": "2025-07-09T10:30:00Z" (current date when you run it)
# }
```

## 📖 API Documentation

### Interactive Documentation
Visit **[http://localhost:8000/swagger/index.html](http://localhost:8000/swagger/index.html)** for interactive API documentation.

### Authentication
All endpoints (except `/health`) require an API key:

```bash
Authorization: test-api-key-12345
```

### Quick API Examples

```bash
# Add a URL for analysis
curl -X POST http://localhost:8000/api/urls \
  -H "Authorization: test-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Start crawling
curl -X PUT http://localhost:8000/api/urls/1/start \
  -H "Authorization: test-api-key-12345"

# Get crawl status
curl -H "Authorization: test-api-key-12345" \
  http://localhost:8000/api/urls/1/status

# List all URLs
curl -H "Authorization: test-api-key-12345" \
  http://localhost:8000/api/urls

# Get detailed results
curl -H "Authorization: test-api-key-12345" \
  http://localhost:8000/api/urls/1
```

## 🗄️ Database Access

Access the database through Adminer at **[http://localhost:8080](http://localhost:8080)**:

- **Server**: `mysql`
- **Username**: `analyzer_user`
- **Password**: `analyzer_password`
- **Database**: `url_analyzer`

## 📊 What the API Analyzes

For each URL, the crawler extracts:

- **Basic Info**: Page title, HTML version
- **Structure**: Count of H1-H6 headings
- **Links**: Number of internal vs external links
- **Quality**: Broken links with status codes
- **Features**: Presence of login forms
- **Performance**: Crawl duration and timestamps

### Example Response

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
    "internal_links": 5,
    "external_links": 3,
    "broken_links_count": 1,
    "has_login_form": false
  },
  "broken_links": [
    {
      "url": "https://example.com/broken",
      "status_code": 404,
      "error_message": "Not Found"
    }
  ]
}
```

## 🔄 Development Workflow

### View Logs
```bash
# All services
docker-compose logs -f

# Just the API
docker-compose logs -f api

# Just MySQL
docker-compose logs -f mysql
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Run Tests
```bash
# Run all tests
docker-compose exec api go test ./...

# Run with coverage
docker-compose exec api go test -cover ./...

# Run specific package
docker-compose exec api go test ./internal/handlers/
```

### Access Container Shell
```bash
# API container
docker-compose exec api sh

# MySQL container
docker-compose exec mysql bash
```

## 📁 Project Structure

```
url-analyzer-backend/
├── API.md
├── Dockerfile             # Container definition
├── README.md
├── cmd
│   └── server
│       └── main.go        # Application entry point
├── docker-compose.yml     # Docker orchestration
├── docs                   # Generated Swagger docs
│   ├── docs.go
│   ├── swagger.json
│   └── swagger.yaml
├── go.mod
├── go.sum
├── internal               # Private application code
│   ├── database           # Database layer
│   │   ├── connection.go
│   │   ├── init.go
│   │   ├── interfaces.go
│   │   ├── repository.go
│   │   ├── repository_test.go
│   │   └── utils.go
│   ├── handlers           # HTTP handlers
│   │   ├── system.go
│   │   ├── urls.go
│   │   └── urls_test.go
│   ├── middleware         # HTTP middleware
│   │   └── auth.go
│   ├── models             # Data models
│   │   └── models.go
│   └── services           # Business logic
│       ├── crawler_service.go
│       ├── crawler_service_test.go
│       └── interfaces.go
├── migrations             # Database schema
│   └── 001_initial_schema.sql
└── pkg
    └── crawler            # Crawler implementation
        ├── crawler.go
        ├── crawler_test.go
        └── debug_test.go
```

## 🔧 Configuration

### Environment Variables

The application uses these environment variables (set in `docker-compose.yml`):

```bash
# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=url_analyzer
DB_USER=analyzer_user
DB_PASSWORD=analyzer_password

# Server
SERVER_PORT=8000
SERVER_HOST=0.0.0.0

# Crawler
CRAWLER_TIMEOUT=30
CRAWLER_MAX_REDIRECTS=5
```

### Customizing Settings

To modify settings:

1. Edit `docker-compose.yml` environment variables
2. Restart: `docker-compose down && docker-compose up --build`

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Check what's using the port
lsof -i :8000

# Kill process or change port in docker-compose.yml
```

**2. Database connection failed**
```bash
# Wait for MySQL to fully start
docker-compose logs mysql

# Look for: "ready for connections"
```

**3. API returns 404 for all endpoints**
```bash
# Check if API container is running
docker-compose ps

# Check API logs
docker-compose logs api
```

**4. Permission denied errors**
```bash
# Ensure Docker daemon is running
docker ps

# On Linux, you might need sudo or add user to docker group
```

### Reset Everything

```bash
# Nuclear option - removes all data
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## 🧪 Testing

### Manual Testing with Swagger

1. Go to **[http://localhost:8000/swagger/index.html](http://localhost:8000/swagger/index.html)**
2. Click **"Authorize"** and enter: `test-api-key-12345`
3. Try the endpoints:
   - Start with `/health` (no auth needed)
   - Add a URL with `/urls` POST
   - Start crawling with `/urls/{id}/start` PUT
   - Check results with `/urls/{id}` GET

### Automated Tests

```bash
# Run all tests
docker-compose exec api go test ./...

# With verbose output
docker-compose exec api go test -v ./...

# Specific test
docker-compose exec api go test ./pkg/crawler/ -run TestCrawler
```

## 📝 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | ❌ |
| POST | `/api/urls` | Add URL | ✅ |
| GET | `/api/urls` | List URLs | ✅ |
| GET | `/api/urls/{id}` | Get URL details | ✅ |
| PUT | `/api/urls/{id}/start` | Start crawling | ✅ |
| PUT | `/api/urls/{id}/stop` | Stop crawling | ✅ |
| DELETE | `/api/urls/{id}` | Delete URL | ✅ |
| GET | `/api/stats` | System stats | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you encounter any issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the logs: `docker-compose logs`
3. Open an issue with detailed error messages

---

**🎉 Happy Crawling!** Your URL analyzer is ready to analyze websites and provide detailed insights about their structure and content.
# URL Analyzer

A full-stack web application for crawling and analyzing websites. It detects broken links, extracts HTML metadata, visualizes page structure, and provides real-time crawling status.

---

## 🚀 Features

- **URL Analysis**: Crawl and inspect any URL
- **Live Crawl Updates**: See real-time crawling progress
- **Metrics Extraction**:
  - HTML version
  - Heading structure (H1–H6)
  - Internal & external links
  - Broken links with status codes
  - Login form detection
- **Interactive Dashboard**:
  - Filterable & sortable URL list
  - Bulk actions: re-analyze, delete
  - Responsive UI
- **Data Visualization**: Recharts-powered graphs for links, headings, and more
- **Authentication**: API key-based access
- **Dockerized Dev Environment**

---

## 🛠 Tech Stack

### Frontend

- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router v6
- TanStack Query
- Zustand
- Recharts
- React Hook Form + Zod
- Axios

### Backend

- Go (Gin framework)
- MySQL 8.0
- Goroutines for concurrency
- JWT-style API key validation

### DevOps

- Docker & Docker Compose
- Volumes for persistent DB storage

---

## 📦 Project Structure


---

## 🐳 Run with Docker (Recommended)

1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/url-analyzer.git
cd url-analyzer
```

2. **Start all services**

```bash
docker-compose up --build
```

3. **Access the app**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Default API Key: your-secure-api-key-here (set in docker-compose.yml)

## 💻 Local Development (without Docker)

1. **Backend (Go)**

```bash
cd url-analyzer-backend
go mod download

# Create DB manually or use Docker MySQL
mysql -u root -p -e "CREATE DATABASE url_analyzer;"

# Load initial tables
mysql -u root -p url_analyzer < migrations/001_create_tables.sql

cp .env.example .env
go run main.go
```

2. **Frontend (Vite + React)**

```bash
cd url-analyzer-frontend
pnpm install

cp .env.example .env
pnpm run dev
```

## 🧪 Running Tests

1. **Frontend**

```bash
cd url-analyzer-frontend
pnpm run test           # Run tests
```

2. **Backend**

```bash
cd url-analyzer-backend
go test ./...
go test -cover ./...
```

## 🔐 Environment Variables
1. **Backend**
```bash
| Variable      | Description                 |
|---------------|-----------------------------|
| `DB_HOST`     | MySQL host (`mysql`)        |
| `DB_PORT`     | MySQL port (`3306`)         |
| `DB_USER`     | MySQL user (`root`)         |
| `DB_PASSWORD` | MySQL password              |
| `DB_NAME`     | Database name               |
| `API_KEY`     | API key for requests        |
| `PORT`        | Backend server port         |
```

2. **Frontend**
```bash
| Variable        | Description              |
|-----------------|--------------------------|
| `VITE_API_URL`  | Backend API base URL     |
```

## 🔧 API Overview
All requests must include:

```http
Authorization: your-secure-api-key-here
```

### API Endpoints

#### URLs
- `GET /api/urls` – List URLs  
- `POST /api/urls` – Create a new crawl job  
- `GET /api/urls/:id` – Get crawl details  
- `PUT /api/urls/:id/start` – Start crawling  
- `PUT /api/urls/:id/stop` – Stop crawl  
- `PUT /api/urls/:id/restart` – Restart crawl  
- `GET /api/urls/:id/status` – Poll job status  
- `DELETE /api/urls` – Bulk delete  

#### System
- `GET /api/health` – Health check  
- `GET /api/stats` – System usage stats  

## 📝 License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).


## 👤 Author
Damilola Bada <br/>
[Github](https://github.com/damygoes) | 
[LinkedIn](https://www.linkedin.com/in/damilolabada/)

## 🙏 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com) — beautiful and accessible UI components
- [TanStack Query](https://tanstack.com/query) — powerful data synchronization for React
- [Gin Web Framework](https://gin-gonic.com/) — fast, minimalistic Go backend framework

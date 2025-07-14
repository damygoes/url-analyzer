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

```bash
.
├── README.md
├── docker-compose.yml
├── url-analyzer-backend
│   ├── Dockerfile
│   ├── README.md
│   ├── cmd
│   │   └── server
│   │       └── main.go
│   ├── docs
│   │   ├── docs.go
│   │   ├── swagger.json
│   │   └── swagger.yaml
│   ├── go.mod
│   ├── go.sum
│   ├── internal
│   │   ├── database
│   │   │   ├── connection.go
│   │   │   ├── init.go
│   │   │   ├── interfaces.go
│   │   │   ├── repository.go
│   │   │   ├── repository_test.go
│   │   │   └── utils.go
│   │   ├── handlers
│   │   │   ├── system.go
│   │   │   ├── urls.go
│   │   │   └── urls_test.go
│   │   ├── middleware
│   │   │   └── auth.go
│   │   ├── models
│   │   │   └── models.go
│   │   └── services
│   │       ├── crawler_service.go
│   │       ├── crawler_service_test.go
│   │       └── interfaces.go
│   ├── migrations
│   │   └── 001_initial_schema.sql
│   └── pkg
│       └── crawler
│           ├── crawler.go
│           ├── crawler_test.go
│           └── debug_test.go
└── url-analyzer-frontend
    ├── Dockerfile.dev
    ├── components.json
    ├── eslint.config.js
    ├── global.d.ts
    ├── index.html
    ├── package.json
    ├── pnpm-lock.yaml
    ├── public
    ├── src
    │   ├── App.tsx
    │   ├── components
    │   │   ├── errors
    │   │   │   ├── AppErrorBoundary.tsx
    │   │   │   └── LoadingComponent.tsx
    │   │   ├── layout
    │   │   │   ├── AppName.tsx
    │   │   │   ├── Header.tsx
    │   │   │   ├── RootLayout.tsx
    │   │   │   └── sidebar
    │   │   │       ├── Sidebar.tsx
    │   │   │       ├── SidebarCollapseToggle.tsx
    │   │   │       ├── SidebarMobileHeader.tsx
    │   │   │       └── SidebarNavLinks.tsx
    │   │   ├── shared
    │   │   │   └── ConfirmDialog.tsx
    │   │   └── ui
    │   │       ├── alert.tsx
    │   │       ├── badge.tsx
    │   │       ├── button.tsx
    │   │       ├── card.tsx
    │   │       ├── chart.tsx
    │   │       ├── checkbox.tsx
    │   │       ├── dialog.tsx
    │   │       ├── form.tsx
    │   │       ├── icon
    │   │       │   ├── Icon.tsx
    │   │       │   └── iconMapping.ts
    │   │       ├── input.tsx
    │   │       ├── label.tsx
    │   │       ├── pagination.tsx
    │   │       ├── progress.tsx
    │   │       ├── scroll-area.tsx
    │   │       ├── select.tsx
    │   │       ├── skeleton.tsx
    │   │       ├── sonner.tsx
    │   │       ├── table.tsx
    │   │       └── tooltip.tsx
    │   ├── features
    │   │   ├── auth
    │   │   │   ├── components
    │   │   │   │   ├── AuthForm.tsx
    │   │   │   │   ├── LogoutButton.tsx
    │   │   │   │   └── ProtectedRoute.tsx
    │   │   │   ├── hooks
    │   │   │   │   └── useAuthSubmit.ts
    │   │   │   ├── pages
    │   │   │   │   └── AuthPage.tsx
    │   │   │   └── store
    │   │   │       └── authStore.ts
    │   │   ├── dashboard
    │   │   │   ├── __tests__
    │   │   │   │   └── DashboardPage.test.tsx
    │   │   │   ├── components
    │   │   │   │   ├── BulkActionsCard.tsx
    │   │   │   │   ├── DashboardHeader.tsx
    │   │   │   │   └── URLTableSection.tsx
    │   │   │   └── pages
    │   │   │       └── DashboardPage.tsx
    │   │   ├── system
    │   │   │   ├── components
    │   │   │   │   ├── ActiveJobsCard.tsx
    │   │   │   │   ├── CrawlerConfigCard.tsx
    │   │   │   │   ├── DatabaseErrorAlert.tsx
    │   │   │   │   ├── DatabaseStatsCard.tsx
    │   │   │   │   ├── HealthPageSkeleton.tsx
    │   │   │   │   └── SystemStatusCard.tsx
    │   │   │   ├── hooks
    │   │   │   │   └── useSystem.ts
    │   │   │   ├── pages
    │   │   │   │   └── HealthPage.tsx
    │   │   │   └── utils
    │   │   │       └── systemUtils.ts
    │   │   ├── url-analysis
    │   │   │   ├── components
    │   │   │   │   ├── CrawlProgress.tsx
    │   │   │   │   ├── CrawlStatusLabel.tsx
    │   │   │   │   └── URLCrawlStatusCell.tsx
    │   │   │   ├── store
    │   │   │   │   └── urlAnalysisStore.ts
    │   │   │   └── utils
    │   │   │       ├── crawlStatusConfig.ts
    │   │   │       ├── isCrawlResultEmpty.ts
    │   │   │       └── mapCrawlToURLStatus.ts
    │   │   ├── url-details
    │   │   │   ├── components
    │   │   │   │   ├── ActionButtons.tsx
    │   │   │   │   ├── EmptyChartsSection.tsx
    │   │   │   │   ├── StatsGrid.tsx
    │   │   │   │   ├── URLDetailsPageSkeleton.tsx
    │   │   │   │   ├── URLInfoCard.tsx
    │   │   │   │   ├── broken-links
    │   │   │   │   │   ├── BrokenLinksTable.tsx
    │   │   │   │   │   ├── BrokenLinksTableHeader.tsx
    │   │   │   │   │   ├── BrokenLinksTableRow.tsx
    │   │   │   │   │   └── getStatusUtils.ts
    │   │   │   │   └── charts
    │   │   │   │       ├── HeadingDistributionChart.tsx
    │   │   │   │       └── LinkDistributionChart.tsx
    │   │   │   ├── pages
    │   │   │   │   └── URLDetailsPage.tsx
    │   │   │   ├── sections
    │   │   │   │   ├── BrokenLinksSection.tsx
    │   │   │   │   └── ChartsSection.tsx
    │   │   │   └── utils
    │   │   │       └── urlDetailsUtils.ts
    │   │   └── urls
    │   │       ├── components
    │   │       │   ├── AddURLDialog.tsx
    │   │       │   ├── URLFilters.tsx
    │   │       │   ├── url-badge
    │   │       │   │   ├── StatusBadge.tsx
    │   │       │   │   └── URLStatusBadge.tsx
    │   │       │   └── url-table
    │   │       │       ├── PaginationControls.tsx
    │   │       │       ├── SortableHeader.tsx
    │   │       │       ├── URLTable.tsx
    │   │       │       ├── URLTableEmptyState.tsx
    │   │       │       ├── URLTableHeader.tsx
    │   │       │       ├── URLTableRow.tsx
    │   │       │       └── URLTableSkeleton.tsx
    │   │       ├── hooks
    │   │       │   └── useURLs.ts
    │   │       ├── store
    │   │       │   └── urlStore.ts
    │   │       ├── types.ts
    │   │       └── utils
    │   │           └── urlStatusConfig.ts
    │   ├── hooks
    │   │   └── useDebounce.ts
    │   ├── index.css
    │   ├── lib
    │   │   └── utils.ts
    │   ├── main.tsx
    │   ├── mocks
    │   │   ├── handlers.ts
    │   │   └── node.ts
    │   ├── router
    │   │   ├── Router.tsx
    │   │   └── routerConfig.tsx
    │   ├── shared
    │   │   ├── api
    │   │   │   └── client.ts
    │   │   ├── types
    │   │   │   └── api.ts
    │   │   └── utils
    │   │       ├── getErrorMessage.ts
    │   │       └── pluralize.ts
    │   ├── test
    │   │   └── test-utils.tsx
    │   └── vite-env.d.ts
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── vitest.config.ts
    └── vitest.setup.ts
```

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
- Default API Key: `test-api-key-12345` (already set in `docker-compose.yml`)

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
Authorization: test-api-key-12345
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

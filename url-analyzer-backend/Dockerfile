# Build stage - use latest Go version available
FROM golang:1.23-alpine AS builder

# Install git for go mod download
RUN apk add --no-cache git

WORKDIR /app

# Set Go toolchain to auto to handle version compatibility
ENV GOTOOLCHAIN=auto

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Generate Swagger docs
RUN go install github.com/swaggo/swag/cmd/swag@latest
RUN swag init -g cmd/server/main.go --parseDependency --parseInternal

# Build the application with static linking
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server cmd/server/main.go

# Final stage - use distroless for security
FROM gcr.io/distroless/static-debian11:nonroot

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/server .
COPY --from=builder /app/.env.example .env

# Use non-root user
USER nonroot:nonroot

EXPOSE 8000

CMD ["./server"]
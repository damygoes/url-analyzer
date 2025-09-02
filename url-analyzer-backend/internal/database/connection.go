package database

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

// DB holds the database connection
var DB *sqlx.DB

func InitDB() error {
	// Required env vars
	dbHost := mustGetEnv("DB_HOST")
	dbPortStr := mustGetEnv("DB_PORT")
	dbName := mustGetEnv("DB_NAME")
	dbUser := mustGetEnv("DB_USER")
	dbPassword := mustGetEnv("DB_PASSWORD")

	// Convert port to integer (MySQL driver uses string, but validating numeric)
	if _, err := strconv.Atoi(dbPortStr); err != nil {
		return fmt.Errorf("invalid DB_PORT: %s", dbPortStr)
	}

	// Build DSN
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&loc=Local",
		dbUser, dbPassword, dbHost, dbPortStr, dbName)

	var err error
	DB, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(25)
	DB.SetConnMaxLifetime(5 * time.Minute)

	// Test the connection
	if err := DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to MySQL database")
	return nil
}

func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

// mustGetEnv reads an env var and fails if missing
func mustGetEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("Environment variable %s is required but not set", key)
	}
	return val
}
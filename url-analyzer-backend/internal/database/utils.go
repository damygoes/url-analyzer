package database

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

func IsUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}
	
	errStr := err.Error()
	return strings.Contains(errStr, "Error 1062") || 
		strings.Contains(errStr, "Duplicate entry")
}

func IsNotFoundError(err error) bool {
	return errors.Is(err, sql.ErrNoRows) ||
		strings.Contains(err.Error(), "not found")
}

// wraps a function in a database transaction
func TransactionWrapper(db *sql.DB, fn func(*sql.Tx) error) error {
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		} else {
			err = tx.Commit()
		}
	}()
	
	err = fn(tx)
	return err
}

// builds an IN clause for SQL queries
func BuildInClause(count int) string {
	if count == 0 {
		return ""
	}
	return "(" + strings.Repeat("?,", count-1) + "?)"
}

// converts []int to []interface{}
func IntSliceToInterfaceSlice(ints []int) []interface{} {
	interfaces := make([]interface{}, len(ints))
	for i, v := range ints {
		interfaces[i] = v
	}
	return interfaces
}

// converts []string to []interface{}
func StringSliceToInterfaceSlice(strings []string) []interface{} {
	interfaces := make([]interface{}, len(strings))
	for i, v := range strings {
		interfaces[i] = v
	}
	return interfaces
}

func NullString(s string) sql.NullString {
	return sql.NullString{String: s, Valid: s != ""}
}

func NullInt64(i int64) sql.NullInt64 {
	return sql.NullInt64{Int64: i, Valid: true}
}

func NullStringValue(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

func NullInt64Value(ni sql.NullInt64) int64 {
	if ni.Valid {
		return ni.Int64
	}
	return 0
}
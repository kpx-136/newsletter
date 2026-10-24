
package db

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func NewPool(ctx context.Context) (*pgxpool.Pool, error) {
	if err := godotenv.Load(); err != nil {
		return nil, fmt.Errorf("load .env: %w", err)
	}

	host := os.Getenv("DB_HOST")
	portValue := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	if host == "" || portValue == "" || user == "" ||
		password == "" || name == "" || sslmode == "" {
		return nil, fmt.Errorf("one or more database settings are missing")
	}

	port, err := strconv.ParseUint(portValue, 10, 16)
	if err != nil || port == 0 {
		return nil, fmt.Errorf("invalid DB_PORT %q", portValue)
	}

	if sslmode != "disable" {
		return nil, fmt.Errorf("local development currently expects DB_SSLMODE=disable")
	}

	config, err := pgxpool.ParseConfig("")
	if err != nil {
		return nil, fmt.Errorf("parse database config: %w", err)
	}

	config.ConnConfig.Host = host
	config.ConnConfig.Port = uint16(port)
	config.ConnConfig.User = user
	config.ConnConfig.Password = password
	config.ConnConfig.Database = name
	config.ConnConfig.TLSConfig = nil
	config.MaxConnLifetime = time.Hour
	config.MaxConns = 10

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("create database pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return pool, nil
}

package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"newsletter-backend/internal/db"
)

func main() {
	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	pool, err := db.NewPool(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	fmt.Println("Successfully connected to PostgreSQL!")
}
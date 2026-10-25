
package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"newsletter-backend/internal/db"
	apphttp "newsletter-backend/internal/http"
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

	mux := http.NewServeMux()
	queries := db.New(pool)
	articles := apphttp.NewArticleHandler(queries)
	categories := apphttp.NewCategoryHandler(queries)
	subscribers := apphttp.NewSubscriberHandler(queries)
	comments := apphttp.NewCommentHandler(queries)

	//ARTICLE ROUTES
	mux.HandleFunc("GET /health", apphttp.HealthHandler)
	mux.HandleFunc("GET /articles", articles.ListPublished)
	mux.HandleFunc("GET /articles/all", articles.ListAll)
	mux.HandleFunc("GET /articles/{slug}", articles.GetBySlug)
	mux.HandleFunc("POST /articles", articles.Create)
	mux.HandleFunc("PUT /articles/{id}", articles.Update)
	mux.HandleFunc("DELETE /articles/{id}", articles.Delete)

	//CATEGORY ROUTES
	mux.HandleFunc("GET /categories", categories.List)
	mux.HandleFunc("POST /categories", categories.Create)

	//SUBSCRIBER ROUTES
	mux.HandleFunc("GET /subscribers", subscribers.List)
	mux.HandleFunc("POST /subscribe", subscribers.Subscribe)

	//SUBSCRIBER ROUTES
	mux.HandleFunc("GET /articles/{id}/comments", comments.List)
	mux.HandleFunc("POST /articles/{id}/comments", comments.Create)

	server := &http.Server{
		Addr:              ":8080",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Println("Server listening on http://localhost:8080")

	if err := server.ListenAndServe(); err != nil &&
		err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
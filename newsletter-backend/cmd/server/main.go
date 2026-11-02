package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"newsletter-backend/internal/db"
	apphttp "newsletter-backend/internal/http"

	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Fatal("Could not load .env:", err)
	}

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
	adminAuth := apphttp.NewAdminAuthHandler()

	//ADMIN AUTH ROUTES
	mux.HandleFunc("POST /admin/login", adminAuth.Login)
	mux.HandleFunc("POST /admin/logout", adminAuth.Logout)
	mux.Handle("GET /admin/me",
		adminAuth.RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"authenticated":true}`))
		})),
	)

	//ARTICLE ROUTES
	mux.HandleFunc("GET /health", apphttp.HealthHandler)
	mux.HandleFunc("GET /articles", articles.ListPublished)
	mux.Handle("GET /articles/all",
		adminAuth.RequireAuth(http.HandlerFunc(articles.ListAll)),
	)
	mux.HandleFunc("GET /articles/{slug}", articles.GetBySlug)
	mux.Handle("POST /articles",
		adminAuth.RequireAuth(http.HandlerFunc(articles.Create)),
	)
	mux.Handle("PUT /articles/{id}",
		adminAuth.RequireAuth(http.HandlerFunc(articles.Update)),
	)
	mux.Handle("DELETE /articles/{id}",
		adminAuth.RequireAuth(http.HandlerFunc(articles.Delete)),
	)

	//CATEGORY ROUTES
	mux.HandleFunc("GET /categories", categories.List)
	mux.Handle("POST /categories",
		adminAuth.RequireAuth(http.HandlerFunc(categories.Create)),
	)

	//SUBSCRIBER ROUTES
	mux.Handle("GET /subscribers",
		adminAuth.RequireAuth(http.HandlerFunc(subscribers.List)),
	)
	mux.HandleFunc("POST /subscribe", subscribers.Subscribe)

	//COMMENT ROUTES
	mux.HandleFunc("GET /articles/{id}/comments", comments.List)
	mux.HandleFunc("POST /articles/{id}/comments", comments.Create)

	handler := apphttp.EnableCORS(mux)

	server := &http.Server{
		Addr:              ":8080",
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Println("Server listening on http://localhost:8080")

	if err := server.ListenAndServe(); err != nil &&
		err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

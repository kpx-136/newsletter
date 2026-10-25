
package http

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"newsletter-backend/internal/db"
)

type ArticleHandler struct {
	queries *db.Queries
}

func NewArticleHandler(queries *db.Queries) *ArticleHandler {
	return &ArticleHandler{
		queries: queries,
	}
}

func (h *ArticleHandler) ListPublished(w http.ResponseWriter, r *http.Request) {
	articles, err := h.queries.ListPublishedArticles(r.Context())
	if err != nil {
		log.Printf("list published articles: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(articles); err != nil {
		log.Printf("encode published articles: %v", err)
	}
}

func (h *ArticleHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	articles, err := h.queries.ListAllArticles(r.Context())
	if err != nil {
		log.Printf("list all articles: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(articles); err != nil {
		log.Printf("encode all articles: %v", err)
	}
}

func (h *ArticleHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")

	article, err := h.queries.GetArticleBySlug(r.Context(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Article not found", http.StatusNotFound)
			return
		}

		log.Printf("get article by slug: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(article); err != nil {
		log.Printf("encode article: %v", err)
	}
}


type CreateArticleRequest struct {
	Slug              string          `json:"slug"`
	Title             string          `json:"title"`
	Description       string          `json:"description"`
	Contents          json.RawMessage `json:"contents"`
	CoverImage        *string         `json:"cover_image"`
	Tags              []string        `json:"tags"`
	CategoryID        *string         `json:"category_id"`
	Status            string          `json:"status"`
	Type              string          `json:"type"`
	EstimatedReadTime int32           `json:"estimated_read_time"`
}

func (h *ArticleHandler) Create(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	var req CreateArticleRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request body", http.StatusBadRequest)
		return
	}

	var extra json.RawMessage
	if err := decoder.Decode(&extra); err != io.EOF {
		http.Error(w, "Request body must contain one JSON object", http.StatusBadRequest)
		return
	}

	if !json.Valid(req.Contents) ||
		len(req.Contents) == 0 ||
		bytes.Equal(bytes.TrimSpace(req.Contents), []byte("null")) {
		http.Error(w, "contents must contain valid JSON", http.StatusBadRequest)
		return
	}

	if req.Slug == "" ||
		req.Title == "" ||
		req.Description == "" ||
		req.Type == "" ||
		req.EstimatedReadTime < 1 {
		http.Error(w, "Missing required fields or invalid estimated_read_time", http.StatusBadRequest)
		return
	}

	if req.Status != "draft" &&
		req.Status != "published" &&
		req.Status != "archived" {
		http.Error(w, "status must be draft, published, or archived", http.StatusBadRequest)
		return
	}

	var coverImage pgtype.Text
	if req.CoverImage != nil {
		coverImage = pgtype.Text{
			String: *req.CoverImage,
			Valid:  true,
		}
	}

	var categoryID pgtype.UUID
	if req.CategoryID != nil && *req.CategoryID != "" {
		if err := categoryID.Scan(*req.CategoryID); err != nil {
			http.Error(w, "category_id must be a valid UUID", http.StatusBadRequest)
			return
		}
	}

	article, err := h.queries.CreateArticle(r.Context(), db.CreateArticleParams{
		Slug:              req.Slug,
		Title:             req.Title,
		Description:       req.Description,
		Contents:          []byte(req.Contents),
		CoverImage:        coverImage,
		Tags:              req.Tags,
		CategoryID:        categoryID,
		Status:            req.Status,
		Type:              req.Type,
		EstimatedReadTime: req.EstimatedReadTime,
	})
	if err != nil {
		log.Printf("create article: %v", err)
		http.Error(w, "Could not create article", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(article); err != nil {
		log.Printf("encode created article: %v", err)
	}
}


func (h *ArticleHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var articleID pgtype.UUID
	if err := articleID.Scan(id); err != nil {
		http.Error(w, "Invalid article ID", http.StatusBadRequest)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	var req CreateArticleRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request body", http.StatusBadRequest)
		return
	}

	var extra json.RawMessage
	if err := decoder.Decode(&extra); err != io.EOF {
		http.Error(w, "Request body must contain one JSON object", http.StatusBadRequest)
		return
	}

	if !json.Valid(req.Contents) ||
		len(req.Contents) == 0 ||
		bytes.Equal(bytes.TrimSpace(req.Contents), []byte("null")) {
		http.Error(w, "contents must contain valid JSON", http.StatusBadRequest)
		return
	}

	if req.Slug == "" ||
		req.Title == "" ||
		req.Description == "" ||
		req.Type == "" ||
		req.EstimatedReadTime < 1 {
		http.Error(w, "Missing required fields or invalid estimated_read_time", http.StatusBadRequest)
		return
	}

	if req.Status != "draft" &&
		req.Status != "published" &&
		req.Status != "archived" {
		http.Error(w, "status must be draft, published, or archived", http.StatusBadRequest)
		return
	}

	var coverImage pgtype.Text
	if req.CoverImage != nil {
		coverImage = pgtype.Text{
			String: *req.CoverImage,
			Valid:  true,
		}
	}

	var categoryID pgtype.UUID
	if req.CategoryID != nil && *req.CategoryID != "" {
		if err := categoryID.Scan(*req.CategoryID); err != nil {
			http.Error(w, "category_id must be a valid UUID", http.StatusBadRequest)
			return
		}
	}

	article, err := h.queries.UpdateArticle(r.Context(), db.UpdateArticleParams{
		ID:                articleID,
		Slug:              req.Slug,
		Title:             req.Title,
		Description:       req.Description,
		Contents:          []byte(req.Contents),
		CoverImage:        coverImage,
		Tags:              req.Tags,
		CategoryID:        categoryID,
		Status:            req.Status,
		Type:              req.Type,
		EstimatedReadTime: req.EstimatedReadTime,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Article not found", http.StatusNotFound)
			return
		}

		log.Printf("update article: %v", err)
		http.Error(w, "Could not update article", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(article); err != nil {
		log.Printf("encode updated article: %v", err)
	}
}

func (h *ArticleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var articleID pgtype.UUID
	if err := articleID.Scan(id); err != nil {
		http.Error(w, "Invalid article ID", http.StatusBadRequest)
		return
	}

	rowsAffected, err := h.queries.DeleteArticle(r.Context(), articleID)
	if err != nil {
		log.Printf("delete article: %v", err)
		http.Error(w, "Could not delete article", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Article not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
package http

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"

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

type CreateArticleRequest struct {
	Slug              string          `json:"slug"`
	Title             string          `json:"title"`
	Description       string          `json:"description"`
	Contents          json.RawMessage `json:"contents"`
	CoverImage        string          `json:"cover_image"`
	Tags              []string        `json:"tags"`
	CategoryID        string          `json:"category_id"`
	Status            string          `json:"status"`
	Type              string          `json:"type"`
	EstimatedReadTime int32           `json:"estimated_read_time"`
}

func decodeArticleRequest(
	w http.ResponseWriter,
	r *http.Request,
) (*CreateArticleRequest, bool) {

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	var req CreateArticleRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		var maxBytesErr *http.MaxBytesError

		if errors.As(err, &maxBytesErr) {
			writeAPIError(
				w,
				http.StatusRequestEntityTooLarge,
				"REQUEST_BODY_TOO_LARGE",
				"Request body is too large.",
				"The maximum allowed request size is 1 MB.",
			)
			return nil, false
		}

		writeAPIError(
			w,
			http.StatusBadRequest,
			"INVALID_JSON",
			"Invalid request body.",
			"Check that your JSON is correctly formatted and that all field names are supported.",
		)
		return nil, false
	}

	var extra json.RawMessage

	if err := decoder.Decode(&extra); err != io.EOF {
		writeAPIError(
			w,
			http.StatusBadRequest,
			"INVALID_JSON",
			"Invalid request body.",
			"Your request must contain exactly one JSON object.",
		)
		return nil, false
	}

	return &req, true
}

func validateArticleRequest(req *CreateArticleRequest) *APIError {
	if req.Slug == "" || strings.TrimSpace(req.Slug) == "" {
		return &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Article slug is required.",
			Details: "Provide a non-empty slug.",
		}
	}

	if req.Title == "" || strings.TrimSpace(req.Title) == "" {
		return &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Article title is required.",
			Details: "Provide a non-empty title.",
		}
	}

	if req.Description == "" || strings.TrimSpace(req.Description) == "" {
		return &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Article description is required.",
			Details: "Provide a non-empty description.",
		}
	}

	if req.Type == "" || strings.TrimSpace(req.Type) == "" {
		return &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Article type is required.",
			Details: "Provide a valid article type.",
		}
	}

	if req.EstimatedReadTime < 1 || req.EstimatedReadTime < 1 {
		return &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Invalid estimated reading time.",
			Details: "Estimated reading time must be at least one minute.",
		}
	}

	if len(req.Contents) == 0 ||
		!json.Valid(req.Contents) ||
		bytes.Equal(bytes.TrimSpace(req.Contents), []byte("null")) {

		return &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Invalid article contents.",
			Details: "Contents must contain a valid, non-null JSON value.",
		}
	}

	if req.Status == "" {
		return &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Article status is required.",
			Details: "Choose draft, published, or archived.",
		}
	}

	if req.Status != "draft" &&
		req.Status != "published" &&
		req.Status != "archived" {

		return &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Invalid article status.",
			Details: "Status must be draft, published, or archived.",
		}
	}

	return nil
}

func (h *ArticleHandler) ListPublished(
	w http.ResponseWriter,
	r *http.Request,
) {
	articles, err := h.queries.ListPublishedArticles(r.Context())

	if err != nil {
		log.Printf("list published articles: %v", err)

		writeAPIError(
			w,
			http.StatusInternalServerError,
			"ARTICLE_LIST_FAILED",
			"Could not retrieve published articles.",
			"Please try again later.",
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(articles); err != nil {
		log.Printf("encode published articles: %v", err)
	}
}

func (h *ArticleHandler) ListAll(
	w http.ResponseWriter,
	r *http.Request,
) {
	articles, err := h.queries.ListAllArticles(r.Context())

	if err != nil {
		log.Printf("list all articles: %v", err)

		writeAPIError(
			w,
			http.StatusInternalServerError,
			"ARTICLE_LIST_FAILED",
			"Could not retrieve articles.",
			"Please try again later.",
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(articles); err != nil {
		log.Printf("encode all articles: %v", err)
	}
}

func (h *ArticleHandler) GetBySlug(
	w http.ResponseWriter,
	r *http.Request,
) {
	slug := r.PathValue("slug")

	article, err := h.queries.GetArticleBySlug(r.Context(), slug)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeAPIError(
				w,
				http.StatusNotFound,
				"ARTICLE_NOT_FOUND",
				"Article not found.",
				"No article exists with the requested slug.",
			)
			return
		}

		log.Printf("get article by slug: %v", err)

		writeAPIError(
			w,
			http.StatusInternalServerError,
			"ARTICLE_FETCH_FAILED",
			"Could not retrieve the article.",
			"Please try again later.",
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(article); err != nil {
		log.Printf("encode article: %v", err)
	}
}

func (h *ArticleHandler) Create(
	w http.ResponseWriter,
	r *http.Request,
) {
	req, ok := decodeArticleRequest(w, r)
	if !ok {
		return
	}

	if validationErr := validateArticleRequest(req); validationErr != nil {
		writeAPIError(
			w,
			http.StatusBadRequest,
			validationErr.Code,
			validationErr.Message,
			validationErr.Details,
		)
		return
	}

	var coverImage pgtype.Text

	if req.CoverImage != "" {
		coverImage = pgtype.Text{
			String: req.CoverImage,
			Valid:  true,
		}
	}

	var categoryID pgtype.UUID

	if req.CategoryID != "" && req.CategoryID != "" {
		if err := categoryID.Scan(req.CategoryID); err != nil {
			writeAPIError(
				w,
				http.StatusBadRequest,
				"INVALID_CATEGORY_ID",
				"Invalid category ID.",
				"Category ID must be a valid UUID.",
			)
			return
		}
	}

	article, err := h.queries.CreateArticle(
		r.Context(),
		db.CreateArticleParams{
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
		},
	)

	if err != nil {
		log.Printf("create article: %v", err)

		if isUniqueViolation(err) {
			writeAPIError(
				w,
				http.StatusConflict,
				"DUPLICATE_ARTICLE_SLUG",
				"Article slug already exists.",
				"Choose a different slug. Each article must have a unique slug.",
			)
			return
		}

		writeAPIError(
			w,
			http.StatusInternalServerError,
			"ARTICLE_CREATE_FAILED",
			"Could not create the article.",
			"Please try again later.",
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(article); err != nil {
		log.Printf("encode created article: %v", err)
	}
}

func (h *ArticleHandler) Update(
	w http.ResponseWriter,
	r *http.Request,
) {
	id := r.PathValue("id")

	var articleID pgtype.UUID

	if err := articleID.Scan(id); err != nil {
		writeAPIError(
			w,
			http.StatusBadRequest,
			"INVALID_ARTICLE_ID",
			"Invalid article ID.",
			"The supplied ID must be a valid UUID.",
		)
		return
	}

	req, ok := decodeArticleRequest(w, r)
	if !ok {
		return
	}

	if validationErr := validateArticleRequest(req); validationErr != nil {
		writeAPIError(
			w,
			http.StatusBadRequest,
			validationErr.Code,
			validationErr.Message,
			validationErr.Details,
		)
		return
	}

	var coverImage pgtype.Text

	if req.CoverImage != "" {
		coverImage = pgtype.Text{
			String: req.CoverImage,
			Valid:  true,
		}
	}

	var categoryID pgtype.UUID

	if req.CategoryID != "" && req.CategoryID != "" {
		if err := categoryID.Scan(req.CategoryID); err != nil {
			writeAPIError(
				w,
				http.StatusBadRequest,
				"INVALID_CATEGORY_ID",
				"Invalid category ID.",
				"Category ID must be a valid UUID.",
			)
			return
		}
	}

	article, err := h.queries.UpdateArticle(
		r.Context(),
		db.UpdateArticleParams{
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
		},
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeAPIError(
				w,
				http.StatusNotFound,
				"ARTICLE_NOT_FOUND",
				"Article not found.",
				"No article exists with the supplied ID.",
			)
			return
		}

		log.Printf("update article: %v", err)

		if isUniqueViolation(err) {
			writeAPIError(
				w,
				http.StatusConflict,
				"DUPLICATE_ARTICLE_SLUG",
				"Article slug already exists.",
				"Choose a different slug. Each article must have a unique slug.",
			)
			return
		}

		writeAPIError(
			w,
			http.StatusInternalServerError,
			"ARTICLE_UPDATE_FAILED",
			"Could not update the article.",
			"Please try again later.",
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(article); err != nil {
		log.Printf("encode updated article: %v", err)
	}
}

func (h *ArticleHandler) Delete(
	w http.ResponseWriter,
	r *http.Request,
) {
	id := r.PathValue("id")

	var articleID pgtype.UUID

	if err := articleID.Scan(id); err != nil {
		writeAPIError(
			w,
			http.StatusBadRequest,
			"INVALID_ARTICLE_ID",
			"Invalid article ID.",
			"The supplied ID must be a valid UUID.",
		)
		return
	}

	rowsAffected, err := h.queries.DeleteArticle(
		r.Context(),
		articleID,
	)

	if err != nil {
		log.Printf("delete article: %v", err)

		writeAPIError(
			w,
			http.StatusInternalServerError,
			"ARTICLE_DELETE_FAILED",
			"Could not delete the article.",
			"Please try again later.",
		)
		return
	}

	if rowsAffected == 0 {
		writeAPIError(
			w,
			http.StatusNotFound,
			"ARTICLE_NOT_FOUND",
			"Article not found.",
			"No article exists with the supplied ID.",
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

package http

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"newsletter-backend/internal/db"
)

type CategoryHandler struct {
	queries *db.Queries
}

func NewCategoryHandler(queries *db.Queries) *CategoryHandler {
	return &CategoryHandler{
		queries: queries,
	}
}

func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	categories, err := h.queries.ListCategories(r.Context())
	if err != nil {
		log.Printf("list categories: %v", err)
		http.Error(w, "Could not retrieve categories", http.StatusInternalServerError)
		return
	}

	if categories == nil {
		categories = []db.Category{}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(categories); err != nil {
		log.Printf("encode categories: %v", err)
	}
}

type CreateCategoryRequest struct {
	Name string `json: "name"`
	Slug string `json: "slug"`
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	var req CreateCategoryRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "Invalid JSON request body", http.StatusBadRequest)
		return
	}

	var extra json.RawMessage

	if err := decoder.Decode(&extra); err != io.EOF {
		http.Error(
			w,
			"Request body must contain one JSON object",
			http.StatusBadRequest,
		)
		return
	}

	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	category, err := h.queries.CreateCategory(r.Context(), db.CreateCategoryParams{
		Name: req.Name,
		Slug: req.Slug,
	})

	if err != nil {
		log.Printf("create category: %v", err)

		if isUniqueViolation(err) {
			writeAPIError(
				w,
				http.StatusConflict,
				"DUPLICATE_CATEGORY",
				"Category already exists.",
				"A category with this name or slug already exists. Try a different one.",
			)
			return
		}

		writeAPIError(
			w,
			http.StatusInternalServerError,
			"CATEGORY_CREATE_FAILED",
			"Could not create the category.",
			"Please try again later.",
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(category); err != nil {
		log.Printf("encode created category: %v", err)
	}
}

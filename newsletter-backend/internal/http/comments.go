package http

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"

	"newsletter-backend/internal/db"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type CommentHandler struct {
	queries *db.Queries
}

func NewCommentHandler(queries *db.Queries) *CommentHandler {
	return &CommentHandler{
		queries: queries,
	}
}

func (h *CommentHandler) List(w http.ResponseWriter, r *http.Request) {
	articleID, err := parseArticleID(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid article ID", http.StatusBadRequest)
		return
	}

	exists, err := h.articleExists(r.Context(), articleID)
	if err != nil {
		log.Printf("check article before listing comments: %v", err)
		http.Error(w, "Could not retrieve comments", http.StatusInternalServerError)
		return
	}

	if !exists {
		http.Error(w, "Article not found", http.StatusNotFound)
		return
	}

	comments, err := h.queries.ListCommentsByArticle(r.Context(), articleID)
	if err != nil {
		log.Printf("list comments: %v", err)
		http.Error(w, "Could not retrieve comments", http.StatusInternalServerError)
		return
	}

	if comments == nil {
		comments = []db.Comment{}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(comments); err != nil {
		log.Printf("encode comments: %v", err)
	}
}

type CreateCommentRequest struct {
	AuthorName *string `json:"author_name"`
	Content    string  `json:"content"`
}

func (h *CommentHandler) Create(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	articleID, err := parseArticleID(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid article ID", http.StatusBadRequest)
		return
	}

	var req CreateCommentRequest

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

	req.Content = strings.TrimSpace(req.Content)
	if req.Content == "" {
		http.Error(w, "Comment content is required", http.StatusBadRequest)
		return
	}

	if req.AuthorName != nil {
		name := strings.TrimSpace(*req.AuthorName)
		if name == "" {
			req.AuthorName = nil
		} else {
			req.AuthorName = &name
		}
	}

	var authorName pgtype.Text

	if req.AuthorName != nil {
		authorName = pgtype.Text{
			String: *req.AuthorName,
			Valid:  true,
		}
	}

	comment, err := h.queries.CreateComment(r.Context(), db.CreateCommentParams{
		ArticleID:  articleID,
		AuthorName: authorName,
		Content:    req.Content,
	})
	if err != nil {
		log.Printf("create comment: %v", err)
		http.Error(w, "Could not create comment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(comment); err != nil {
		log.Printf("encode created comment: %v", err)
	}
}

func parseArticleID(value string) (pgtype.UUID, error) {
	var id pgtype.UUID
	err := id.Scan(value)
	return id, err
}


func (h *CommentHandler) articleExists(
	ctx context.Context,
	articleID pgtype.UUID,
) (bool, error) {
	_, err := h.queries.GetArticle(ctx, articleID)

	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}
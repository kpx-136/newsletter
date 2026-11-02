package http

import (
	"encoding/json"
	"errors"
	"time"

	"newsletter-backend/internal/db"
)

type ArticleResponse struct {
	ID                string          `json:"ID"`
	Slug              string          `json:"Slug"`
	Title             string          `json:"Title"`
	Description       string          `json:"Description"`
	Contents          json.RawMessage `json:"Contents"`
	CoverImage        *string         `json:"CoverImage"`
	PublishedAt       *time.Time      `json:"PublishedAt"`
	Tags              []string        `json:"Tags"`
	CategoryID        *string         `json:"CategoryID"`
	Status            string          `json:"Status"`
	Type              string          `json:"Type"`
	EstimatedReadTime int32           `json:"EstimatedReadTime"`
	CreatedAt         *time.Time      `json:"CreatedAt"`
}

func toArticleResponse(a db.Article) (ArticleResponse, error) {
	var contents json.RawMessage

	if len(a.Contents) > 0 {
		if !json.Valid(a.Contents) {
			return ArticleResponse{}, errors.New("invalid article contents")
		}

		contents = json.RawMessage(a.Contents)
	}

	var coverImage *string
	if a.CoverImage.Valid {
		coverImage = &a.CoverImage.String
	}

	var publishedAt *time.Time
	if a.PublishedAt.Valid {
		publishedAt = &a.PublishedAt.Time
	}

	var categoryID *string
	if a.CategoryID.Valid {
		id := a.CategoryID.String()
		categoryID = &id
	}

	var createdAt *time.Time
	if a.CreatedAt.Valid {
		createdAt = &a.CreatedAt.Time
	}

	return ArticleResponse{
		ID:                a.ID.String(),
		Slug:              a.Slug,
		Title:             a.Title,
		Description:       a.Description,
		Contents:          contents,
		CoverImage:        coverImage,
		PublishedAt:       publishedAt,
		Tags:              a.Tags,
		CategoryID:        categoryID,
		Status:            a.Status,
		Type:              a.Type,
		EstimatedReadTime: a.EstimatedReadTime,
		CreatedAt:         createdAt,
	}, nil
}

-- name: CreateArticle :one
INSERT INTO articles (
    slug, title, description, contents, cover_image, tags, category_id, status, type, estimated_read_time
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *; 

-- name: GetArticle :one
SELECT * FROM articles WHERE id = $1 LIMIT 1; 

-- name: ListPublishedArticles :many
SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC;

-- name: DeleteArticle :execrows
DELETE FROM articles WHERE id = $1; 
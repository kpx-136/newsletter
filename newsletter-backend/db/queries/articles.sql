-- name: CreateArticle :one
INSERT INTO articles (
    slug, title, description, contents, cover_image, tags, category_id, status, type, estimated_read_time, published_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
    CASE 
        WHEN $8 = 'published' THEN NOW()
        ELSE NULL
    END
) RETURNING *; 

-- name: GetArticle :one
SELECT * FROM articles WHERE id = $1 LIMIT 1; 

-- name: ListPublishedArticles :many
SELECT 
    id, slug, title, description, cover_image, tags, category_id, status, type, estimated_read_time, published_at
FROM articles WHERE status = 'published' ORDER BY published_at DESC;

-- name: DeleteArticle :execrows
DELETE FROM articles WHERE id = $1; 

-- name: ListAllArticles :many
SELECT
    id, slug, title, description, cover_image, tags, category_id, status, type, estimated_read_time, published_at, created_at
FROM articles ORDER BY created_at DESC; 

-- name: GetArticleBySlug :one
SELECT * FROM articles WHERE slug = $1 LIMIT 1; 

-- name: UpdateArticle :one
UPDATE articles SET
    slug = $2, 
    title = $3,
    description = $4,
    contents = $5,
    cover_image = $6,
    tags = $7,
    category_id = $8,
    status = $9,
    type = $10,
    estimated_read_time = $11, 
    published_at = CASE
        WHEN $9 = 'published' AND published_at IS NULL
            THEN NOW()
        WHEN $9 <> 'published'
            THEN NULL
        ELSE published_at
    END
WHERE id = $1 RETURNING *; 
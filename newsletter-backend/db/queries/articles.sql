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
    title = $2,
    description = $3,
    contents = $4,
    cover_image = $5,
    tags = $6,
    category_id = $7,
    status = $8,
    type = $9,
    estimated_read_time = $10,
    published_at = CASE
        WHEN $8 = 'published' AND published_at IS NULL
            THEN NOW()
        WHEN $8 <> 'published'
            THEN NULL
        ELSE published_at
    END
WHERE id = $1
RETURNING id, slug, title, description, contents, cover_image,
    published_at, tags, category_id, status, type,
    estimated_read_time, created_at;
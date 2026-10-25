-- name: CreateComment :one
INSERT INTO comments (
    article_id, author_name, content
) VALUES (
    $1, $2, $3
) RETURNING *; 

-- name: ListCommentsByArticle :many
SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC; 
-- name: ListCategories :many
SELECT * FROM categories ORDER BY name; 

-- name: CreateCategory :one
INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *; 
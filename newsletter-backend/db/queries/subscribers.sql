-- name: CreateSubscriber :one
INSERT INTO subscribers (email) VALUES ($1) RETURNING *; 

-- name: ListSubscribers :many
SELECT * FROM subscribers ORDER BY subscribed_at DESC; 
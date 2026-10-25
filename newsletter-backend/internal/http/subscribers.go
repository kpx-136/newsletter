
package http

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"

	"newsletter-backend/internal/db"
)

type SubscriberHandler struct {
	queries *db.Queries
}

func NewSubscriberHandler(queries *db.Queries) *SubscriberHandler {
	return &SubscriberHandler{
		queries: queries,
	}
}

func (h *SubscriberHandler) List(w http.ResponseWriter, r *http.Request) {
	subscribers, err := h.queries.ListSubscribers(r.Context())
	if err != nil {
		log.Printf("list subscribers: %v", err)
		http.Error(w, "Could not retrieve subscribers", http.StatusInternalServerError)
		return
	}

	if subscribers == nil {
		subscribers = []db.Subscriber{}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(subscribers); err != nil {
		log.Printf("encode subscribers: %v", err)
	}
}

type SubscribeRequest struct {
	Email string `json:"email"`
}

func (h *SubscriberHandler) Subscribe(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	var req SubscribeRequest

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

	req.Email = strings.TrimSpace(req.Email)

	at := strings.LastIndex(req.Email, "@")

	if at <= 0 || at == len(req.Email)-1 {
		http.Error(w, "A valid email address is required", http.StatusBadRequest)
		return
	}

	domain := req.Email[at+1:]

	if !strings.Contains(domain, ".") ||
		strings.HasPrefix(domain, ".") ||
		strings.HasSuffix(domain, ".") {
		http.Error(w, "A valid email address is required", http.StatusBadRequest)
		return
	}

	subscriber, err := h.queries.CreateSubscriber(r.Context(), req.Email)
	if err != nil {
		log.Printf("create subscriber: %v", err)
		http.Error(w, "Could not create subscriber", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(subscriber); err != nil {
		log.Printf("encode created subscriber: %v", err)
	}
}
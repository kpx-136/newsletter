package http

import (
	"encoding/json"
	"log"
	"net/http"
)

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

type ErrorResponse struct {
	Success bool     `json:"success"`
	Error   APIError `json:"error"`
}

func writeAPIError(
	w http.ResponseWriter,
	status int,
	code string,
	message string,
	details string,
) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(ErrorResponse{
		Success: false,
		Error: APIError{
			Code:    code,
			Message: message,
			Details: details,
		},
	}); err != nil {
		log.Printf("encode API error response: %v", err)
	}
}

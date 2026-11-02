package http

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AdminAuthHandler struct{}

func NewAdminAuthHandler() *AdminAuthHandler {
	return &AdminAuthHandler{}
}

var sessions = struct {
	sync.Mutex
	tokens map[string]time.Time
}{
	tokens: make(map[string]time.Time),
}

// LOGIN

func (h *AdminAuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	adminEmail := strings.TrimSpace(os.Getenv("ADMIN_EMAIL"))
	passwordHash := strings.TrimSpace(os.Getenv("ADMIN_PASSWORD_HASH"))

	email := strings.TrimSpace(req.Email)
	password := req.Password

	if adminEmail == "" || passwordHash == "" {
		log.Println("Admin credentials are not configured")
		http.Error(w, "Admin credentials not configured", http.StatusInternalServerError)
		return
	}

	if email == "" || password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	if !strings.EqualFold(email, adminEmail) {
		log.Println("LOGIN DEBUG: email mismatch")
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	err := bcrypt.CompareHashAndPassword(
		[]byte(passwordHash),
		[]byte(password),
	)

	if err != nil {
		log.Println("LOGIN DEBUG: bcrypt mismatch:", err)
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	log.Println("LOGIN DEBUG: credentials accepted")

	// Generate session token.
	token := make([]byte, 32)

	if _, err := rand.Read(token); err != nil {
		http.Error(w, "Could not create session", http.StatusInternalServerError)
		return
	}

	sessionToken := hex.EncodeToString(token)
	expires := time.Now().Add(24 * time.Hour)

	sessions.Lock()
	sessions.tokens[sessionToken] = expires
	sessions.Unlock()

	http.SetCookie(w, &http.Cookie{
		Name:     "admin_session",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("COOKIE_SECURE") == "true",
		SameSite: http.SameSiteLaxMode,
		Expires:  expires,
		MaxAge:   86400,
	})

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
	})
}

// LOGOUT

func (h *AdminAuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("admin_session")

	if err == nil {
		sessions.Lock()
		delete(sessions.tokens, cookie.Value)
		sessions.Unlock()
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "admin_session",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("COOKIE_SECURE") == "true",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})

	w.WriteHeader(http.StatusNoContent)
}

// AUTHENTICATION MIDDLEWARE

func (h *AdminAuthHandler) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("admin_session")

		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		sessions.Lock()

		expires, exists := sessions.tokens[cookie.Value]

		if exists && time.Now().After(expires) {
			delete(sessions.tokens, cookie.Value)
			exists = false
		}

		sessions.Unlock()

		if !exists {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

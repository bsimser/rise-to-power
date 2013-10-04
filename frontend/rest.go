package main

import (
	"encoding/json"
	"net/http"
)

// For now we define this type right in the main package.
// TODO(jwall): At some point we will want to move into it's own package.

// AuthRequest defines a user authorization request
type AuthRequest struct {
	// Username
	Username string
	// Password
	Password string
}

var authCookieName = "rtp-auth"

func AuthHandler(w http.ResponseWriter, r *http.Request) {
	// Always close the body
	defer r.Body.Close()
	ar := AuthRequest{}
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&ar)
	status := 200
	c := http.Cookie{}
	c.Name = authCookieName
	// TODO(jwall): Replace this with an actual session id that is stored
	// somewhere when we have session storage.
	c.Value = "rtp-debug:rtp rules!"
	// TODO(jwall): Check for the presence of a cookie and auth using a
	// session token if one is present.
	if ar.Username == "rtp-debug" && ar.Password == "rtp rules!" {
		// TODO(jwall): persist the session id in session storage
		// somewhere
		w.Header().Add("Set-Cookie", c.String())
	} else {
		status = 403
	}
	w.WriteHeader(status)
}

// Copyright 2013 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"crypto/rand"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"code.google.com/p/rise-to-power/web/rest"
	"code.google.com/p/rise-to-power/web/session"
)

const (
	usernameKey = "username"
	passwordKey = "password"
)

// AuthRequest defines a user authorization request
type AuthRequest struct {
	// Username
	Username string
	// Password
	Password string
}

var authCookieName = "rtp-auth"

type LoginHandler struct {
	rest.NotFoundHandler
	ss session.Store
}

func simpleUUID4() string {
	b := make([]byte, 16)
	// We ignore the error and count for now.
	_, err := io.ReadFull(rand.Reader, b)
	if err != nil {
		// This is probably panic worthy since it means something is
		// very wrong with our operation environment.
		panic("Failed to read from crypto/rand!!!!")
	}
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

func getSessionCookie(ctx rest.Context) *http.Cookie {
	var cookie *http.Cookie
	for _, c := range ctx.Cookies {
		if c.Name == authCookieName {
			cookie = c
			break
		}
	}
	return cookie
}

func (h *LoginHandler) Post(ctx rest.Context) (int, interface{}) {
	log.Printf("Handling login request %q")
	ar := AuthRequest{}
	ctx.Deserialize(&ar)
	status := 200
	// Check for a cookie already present.
	c := getSessionCookie(ctx)
	if c == nil {
		c = &http.Cookie{}
		c.Name = authCookieName
		c.Value = simpleUUID4()
		// TODO(jwall): Session expiration?
		sess, err := h.ss.StartSession(c.Value)
		if err != nil {
			panic("Can't create user session. Something is very wrong!!!" + err.Error())
		}
		err = h.ss.Save(sess)
		if err != nil {
			panic("Can't save user session. Something is very wrong!!!" + err.Error())
		}
	} else {
		sess, err := h.ss.Get(c.Value)
		if err != nil || sess == nil {
			panic("Error Getting session " + err.Error())
		}
		if ar.Username != sess.Values[usernameKey].(string) {
			// Status 409 Conflict.
			// There is a conflict with the current session username
			// and the requested login username.
			return 409, nil
		}
	}
	if ok, err := ctx.Auth.Authenticate(ar.Username, ar.Password); ok {
		ctx.Header().Add("Set-Cookie", c.String())
	} else {
		log.Printf("Unable to authenticate %q err %q", ar.Username, err)
		status = 403
	}
	return status, nil
}

type LogoutHandler struct {
	rest.NotFoundHandler
	ss session.Store
}

func (h *LogoutHandler) Post(c rest.Context) (int, interface{}) {
	// Post requests just delegate to the Get handler for now.
	return h.Get(c)
}

func (h *LogoutHandler) Get(ctx rest.Context) (int, interface{}) {
	// Always close the body
	var cookie *http.Cookie
	for _, c := range ctx.Cookies {
		if c.Name == authCookieName {
			cookie = c
			break
		}
	}
	// If we saw a cookie then modify it's expiration.
	if cookie != nil {
		cookie.Expires = time.Now()
		ctx.Header().Add("Set-Cookie", cookie.String())
	}
	err := h.ss.EndSession(cookie.Value)
	if err != nil {
		panic("Can't delete user session. Something is very wrong!!!" + err.Error())
	}
	// For now logouts always succeed. In future we may need to report
	// failures.
	return 200, nil
}

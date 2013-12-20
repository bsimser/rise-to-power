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

// Package rest defines the framework for handling rest api request in
// rise-to-power.
//
// We define our own framework because none of the current frameworks are
// quite suitable for our purposes. We have a few requirements which are at the
// moment only present all in one place here.
//
// 1. We need to be able to set status codes.
// 2. We need to be able to set headers.
// 3. We need to be able Dispatch for the http Methods we support.
// 4. We need the framework to take care of serialization based on the
//    accept header.
package rest

import (
	"encoding/json"
	"net/http"

	"bitbucket.org/ww/goautoneg"
	log "github.com/swsnider/glog"

	"code.google.com/p/rise-to-power/web/auth"
)

// NotFoundHandler is a simple Handler for not found resources.
type NotFoundHandler struct{}

func (h NotFoundHandler) NotFound(_ HeaderWriter, _ *http.Request) interface{} {
	return nil
}

// Handler coordinates the dispatching and serialization for an EndPoint.
type Handler struct {
	codecs map[string]Codec
	EndPoint
	handles map[string]bool
	Auth    *auth.Authenticator
	// TODO(jwall): Support other http methods here.
}

// TODO(jwall): Unittests
func (h *Handler) dispatch(hw HeaderWriter, r *http.Request, c Codec) (status int, result interface{}) {
	defer r.Body.Close()
	if !h.handles[r.Method] {
		// TODO(jwall): What to do about wrong methods.
		return 404, h.NotFound(hw, r)
	}
	ctx := Context{CodecReader: CodecReader{r: r, c: c}, HeaderWriter: hw, Cookies: r.Cookies(), Auth: h.Auth}
	switch {
	case r.Method == "POST":
		return h.EndPoint.(Post).Post(ctx)
	case r.Method == "GET":
		return h.EndPoint.(Get).Get(ctx)
	}
	panic("Unreachable")
}

// TODO(jwall): Unittests
// ServeHTTP implements the http.Handler interface for a Handler.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	alts := make([]string, 0, len(h.codecs))
	for k := range h.codecs {
		alts = append(alts, k)
	}
	selected := goautoneg.Negotiate(r.Header.Get("Accept"), alts)

	c, ok := h.codecs[selected]
	if !ok {
		log.Errorf("Unable to look up codec for %v. Available codecs are: %v", selected, alts)
		w.WriteHeader(406)
		return
	}
	status, result := h.dispatch(w, r, c)
	w.WriteHeader(status)
	c.Serialize(w, result)
}

// New sets up an EndPoint as an http.Handler.
func New(ep EndPoint, auth *auth.Authenticator) http.Handler {
	h := &Handler{EndPoint: ep, handles: make(map[string]bool), codecs: map[string]Codec{"application/json": jsonCodec{}}, Auth: auth}
	_, ok := ep.(Post)
	h.handles["POST"] = ok
	_, ok = ep.(Get)
	h.handles["GET"] = ok
	return h
}

// Context defines the context for a rest api request.
type Context struct {
	HeaderWriter
	CodecReader
	Cookies []*http.Cookie
	Auth    *auth.Authenticator
}

// Codec defines an interface for serializing and deserializing a rest payload.
// A Codec for serializing json data is already provided.
type Codec interface {
	Serialize(http.ResponseWriter, interface{}) error
	Deserialize(*http.Request, interface{}) error
}

type jsonCodec struct{}

func (c jsonCodec) Serialize(w http.ResponseWriter, i interface{}) error {
	w.Header().Add("Content-Type", "aplication/json")
	e := json.NewEncoder(w)
	return e.Encode(i)
}

func (c jsonCodec) Deserialize(r *http.Request, i interface{}) error {
	d := json.NewDecoder(r.Body)
	return d.Decode(i)
}

// CodecReader Deserializes a Value from an *http.Request.
type CodecReader struct {
	r *http.Request
	c Codec
}

// Deserialize a val from the *http.Request.
func (r CodecReader) Deserialize(val interface{}) error {
	return r.c.Deserialize(r.r, val)
}

// HeaderWriter defines the interface for modifying the Headers for a rest api
// request.
type HeaderWriter interface {
	Header() http.Header
}

// EndPoint defines the minimal interface for a rest endpoint.
type EndPoint interface {
	NotFound(HeaderWriter, *http.Request) (result interface{})
}

// Get defines the interface that an EndPoint must provide to handle
// GET REST requests.
type Get interface {
	EndPoint
	Get(Context) (status int, result interface{})
}

// Post defines the interface that an EndPoint must provide to handle
// POST REST requests
type Post interface {
	EndPoint
	Post(Context) (status int, result interface{})
}

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
	"flag"
	"net/http"

	"github.com/gorilla/mux"
	log "github.com/swsnider/glog"

	"code.google.com/p/rise-to-power/web/auth"
	"code.google.com/p/rise-to-power/web/rest"
	"code.google.com/p/rise-to-power/web/session"
)

var (
	addr      = flag.String("address", ":8080", "Address to bind to.")
	staticDir = flag.String("static_dir", "client", "Root directory for static files.")
	etcdAddr  = flag.String("etcd_addr", "http://127.0.0.1:4001", "Address of one of the etcd servers.")
	useEtcd   = flag.Bool("use_etcd", false, "If set, etcd is used.")
	muxer     = mux.NewRouter()
)

type DefaultIndex struct {
	dir http.Dir
}

func (d DefaultIndex) Open(name string) (http.File, error) {
	log.Infof("Request: %v", name)
	f, err := d.dir.Open(name)
	if err != nil {
		f, err = d.dir.Open("/index.html")
	}
	return f, err
}

func quitQuitQuitHandler(w http.ResponseWriter, r *http.Request) {
	log.Fatalf("%v requested we quit.", r.RemoteAddr)
}

func main() {
	defer log.Flush()
	flag.Parse()
	log.StartLogging()
	var sessionStore session.Store
	if *useEtcd {
		sessionStore = session.NewEtcdStore(*etcdAddr)
	} else {
		sessionStore = session.NewInMemoryStore()
	}
	auth := auth.New(auth.NewInMemoryStore())
	// TODO(jwall): This is totally cheating and should be removed once
	// we have real storage backends.
	if err := auth.NewUser("rtp-debug", "rtp rules!"); err != nil {
		log.Fatal(err)
	}
	muxer.HandleFunc("/quitquitquit", quitQuitQuitHandler)
	// TODO(jwall): handle codecs.
	muxer.Handle("/_api/login", rest.New(&LoginHandler{ss: sessionStore}, auth))
	muxer.Handle("/_api/logout", rest.New(&LogoutHandler{ss: sessionStore}, auth))
	muxer.Handle("/_api/backendAddress", rest.New(&BackendAddressHandler{}, auth))
	muxer.Handle("/{path:.*}", http.FileServer(DefaultIndex{dir: http.Dir(*staticDir)}))
	// Note(jwall): to test this for now:
	// curl -v -H 'Content-Type: application/json' --data '{"Username":"rtp-debug","Password":"rtp rules!"}' http://localhost:8080/_api/login
	http.Handle("/", muxer)
	log.Infof("Server now listening on %v", *addr)
	log.Fatal(http.ListenAndServe(*addr, nil))
}

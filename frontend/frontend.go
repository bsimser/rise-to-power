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
  "log"
  "net/http"

  "github.com/gorilla/mux"
)

var (
  addr      = flag.String("address", ":8080", "Address to bind to.")
  staticDir = flag.String("static_dir", "client", "Root directory for static files.")
  muxer     = mux.NewRouter()
)

type DefaultIndex struct {
  dir http.Dir
}

func (d DefaultIndex) Open(name string) (http.File, error) {
  log.Printf("Request: %v", name)
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
  flag.Parse()
  muxer.HandleFunc("/quitquitquit", quitQuitQuitHandler)
  muxer.Handle("/{path:.*}", http.FileServer(DefaultIndex{dir: http.Dir(*staticDir)}))
  http.Handle("/", muxer)
  log.Printf("Server now listening on %v", *addr)
  log.Fatal(http.ListenAndServe(*addr, nil))
}

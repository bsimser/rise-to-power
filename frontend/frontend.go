package main

import (
  "flag"
  "github.com/gorilla/mux"
  "log"
  "net/http"
)

var (
  addr      = flag.String("address", ":8080", "Address to bind to.")
  staticDir = flag.String("static_dir", "client", "Root directory for static files.")
  muxer     = mux.NewRouter()
)

func quitQuitQuitHandler(w http.ResponseWriter, r *http.Request) {
  log.Fatalf("%v requested we quit.", r.RemoteAddr)
}

func main() {
  flag.Parse()
  muxer.HandleFunc("/quitquitquit", quitQuitQuitHandler)
  muxer.Handle("/", http.FileServer(http.Dir(*staticDir)))
  http.Handle("/", muxer)
  log.Printf("Server now listening on %v", *addr)
  log.Fatal(http.ListenAndServe(*addr, nil))
}

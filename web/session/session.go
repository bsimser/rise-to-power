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

package session

import (
	"fmt"

	"sync"
)

var (
	NoSuchSession = fmt.Errorf("No such session")
	// FIXME(jwall): Use this when have session expiration
	SessionExpired = fmt.Errorf("Session Expired")
)

type Session struct {
	ID     string
	Values map[string]interface{}
}

type Store interface {
	Get(name string) (*Session, error)
	Save(*Session) error
	StartSession(name string) (*Session, error)
	EndSession(name string) error
}

type inMemorySessionStore struct {
	sync.RWMutex
	store map[string]*Session
}

// NewInMemoryStore returns a thread safe in memory implementation of a
// sessions.Store.
func NewInMemoryStore() Store {
	return &inMemorySessionStore{store: make(map[string]*Session)}
}

func (s *inMemorySessionStore) Get(name string) (*Session, error) {
	s.RLock()
	defer s.RUnlock()
	if s, ok := s.store[name]; ok {
		return s, nil
	}
	// TODO(jwall): Session expiration
	return nil, NoSuchSession
}

func (s *inMemorySessionStore) Save(sess *Session) error {
	s.Lock()
	defer s.Unlock()
	s.store[string(sess.ID)] = sess
	// in memory stores never fail to store.
	return nil
}

func (s *inMemorySessionStore) StartSession(name string) (*Session, error) {
	s.Lock()
	defer s.Unlock()
	s.store[name] = New(name)
	// in memory stores never fail to store.
	return s.store[name], nil
}

func (s *inMemorySessionStore) EndSession(name string) error {
	s.Lock()
	defer s.Unlock()
	delete(s.store, name)
	// in memory stores never fail to delete
	return nil
}

func New(name string) *Session {
	return &Session{ID: name, Values: make(map[string]interface{})}
}

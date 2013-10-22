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

// Package auth defines a storage interface and several functions for user authentication.
//
// The functions attempt to make it easy to follow best practices for
// handling user passwords and authenticating them. It uses bcrypt with the
// max cost for password hashing. And requires authentication before any user
// modification.
package auth

import (
	"code.google.com/p/go.crypto/bcrypt"
	"fmt"

	"sync"
)

// Store defines the storage api for user information
type Store interface {
	// UpdateUser stores data for user.
	UpdateUser(user string, pwd_hash []byte) error
	// GetUser returns a user from the db or an error.
	GetUser(user string) (*User, error)
}

type AuthError error

func newAuthError(err error) AuthError {
	return AuthError(err)
}

var (
	// The Store should return this error when the user
	// doesn't exist.
	NoSuchUserErr = newAuthError(fmt.Errorf("No such User"))
	// The Authenticate And UpdatePassword functions return
	// this error when the password is invalid.
	InvalidPassErr = newAuthError(fmt.Errorf("Invalid Password"))
)

type User struct {
	Name string
	Hash []byte
}

type Authenticator struct {
	cost int
	Store
}

func New(store Store) *Authenticator {
	return NewWithCost(store, bcrypt.DefaultCost)
}

func NewWithCost(store Store, cost int) *Authenticator {
	return &Authenticator{Store: store, cost: cost}
}

// UpdatePassword updates a users password in the database. It first verifies
// that the user is authenticated to do this operation. It then updates the
// password using brcrypt.
func (store *Authenticator) UpdatePassword(user, oldPass, newPass string) error {
	if ok, err := store.Authenticate(user, oldPass); ok {
		if err != nil {
			return err
		}
		h, err := store.mkHash(newPass)
		if err != nil {
			return err
		}
		store.UpdateUser(user, h)
		return nil
	}
	return InvalidPassErr
}

// Authenticate authenticates a user using bcrypt. It is expected that
// the stored password hash was generated using bcrypt for storage.
func (store *Authenticator) Authenticate(user, pass string) (bool, error) {
	u, err := store.GetUser(user)
	if err != nil {
		return false, err
	}
	err = bcrypt.CompareHashAndPassword(u.Hash, []byte(pass))
	if err == nil {
		return true, nil
	}
	return false, InvalidPassErr
}

func (store *Authenticator) mkHash(pass string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(pass), store.cost)
}

// NewUser adds a user to the Store. It uses bcrypt to hash the password.
func (store *Authenticator) NewUser(user, pass string) error {
	h, err := store.mkHash(pass)
	if err != nil {
		return err
	}
	return store.UpdateUser(user, h)
}

// InMemoryStore returns an in memory implementation of an auth.Store
// It is meant for ease of testing and not production use.
func NewInMemoryStore() Store {
	return &inMemoryStore{users: make(map[string][]byte)}
}

type inMemoryStore struct {
	sync.RWMutex
	users map[string][]byte
}

func (fs inMemoryStore) GetUser(user string) (*User, error) {
	fs.RLock()
	defer fs.RUnlock()
	if h, ok := fs.users[user]; ok {
		return &User{Name: user, Hash: h}, nil
	}
	return nil, NoSuchUserErr
}

func (fs inMemoryStore) UpdateUser(user string, pwd_hash []byte) error {
	fs.Lock()
	defer fs.Unlock()
	fs.users[user] = pwd_hash
	return nil
}

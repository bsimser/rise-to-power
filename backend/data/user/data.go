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

package user

import (
	"sync"

	"code.google.com/p/rise-to-power/web/auth"
)

type role int

const (
	// Player users are the zero value Role for users.
	// They can play with other players but have no other powers.
	Player role = iota
	// Admin users are all powerful in the rise-to-power universe
	Admin
)

// User defines a user in the rise-to-power system.
// They have a Name, Hash, and Role. Role defines what they are allowed to do
// in the Game.
type User struct {
	Name string
	Hash []byte
	Role role
}

// Store defines the datastore interface for Users in rise-to-power.
type Store interface {
	// User stores should also implement the auth interface.
	auth.Store
	Get(name string) (*User, error)
	Save(*User) error
	Delete(name string) error
}

// InMemoryStore returns an in memory implementation of an auth.Store
// It is meant for ease of testing and not production use.
func NewInMemoryStore() Store {
	return &inMemoryStore{users: make(map[string]*User)}
}

type inMemoryStore struct {
	sync.RWMutex
	users map[string]*User
}

func (fs inMemoryStore) Get(user string) (*User, error) {
	fs.RLock()
	defer fs.RUnlock()
	return fs.get(user)
}

func (fs inMemoryStore) GetPass(user string) ([]byte, error) {
	if u, err := fs.Get(user); err != nil {
		return u.Hash, nil
	}
	return nil, auth.NoSuchUserErr
}

func (fs inMemoryStore) UpdatePass(user string, pwd_hash []byte) error {
	fs.Lock()
	defer fs.Unlock()
	if u, err := fs.get(user); err == nil {
		u.Hash = pwd_hash
		return fs.save(u)
	}
	u := &User{
		Hash: pwd_hash,
		Name: user,
	}
	return fs.save(u)
}

func (fs inMemoryStore) Save(user *User) error {
	fs.Lock()
	defer fs.Unlock()
	return fs.save(user)
}

func (fs inMemoryStore) Delete(user string) error {
	fs.Lock()
	defer fs.Unlock()
	delete(fs.users, user)
	return nil
}

func (fs inMemoryStore) save(user *User) error {
	fs.users[user.Name] = user
	return nil
}

func (fs inMemoryStore) get(user string) (*User, error) {
	if u, ok := fs.users[user]; ok {
		return u, nil
	}
	return nil, auth.NoSuchUserErr
}

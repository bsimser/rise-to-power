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

// package state defines the structs used for the game state.
package state

import "sync"

const (
	MunicipalitySize = 5
)

// Base defines the shared attributes for each of the items making up
// the contents of the world map.
type Base struct {
	// The unique key for this world map item.
	Id string
	// Human readable name for display in the UI.
	Name string
	// The image to represent this world map item in the UI.
	Image string
}

// Building defines a building placed on a square.
type Building struct {
	Base
	// TODO(jwall):
}

// Resource defines a resource on a square.
type Resource struct {
	Base
	// TODO(jwall):
}

type Municipality struct {
	// Unique key identifying this Municipality
	Id string

	// x,y coordinate of this Municipality origin.
	X, Y int

	Squares map[Point]Square

	Owner string // Id of the owner of this municipality

	Conqueror string // Id of the player who has just conquererd this municipality
	Appointee string // Id of the player who has been appointed by the Conqueror
}

type Store interface {
	// Adds a Square to the database.
	AddSquare(*Square) error
	// Adds a municipality to the database.
	AddMunicipality(*Municipality) error
	// Return the Municipality with the given id.
	GetMunicipality(id string) (*Municipality, error)
	// Return the municipality for an owner, conqueror, appointtee triple.
	// If conqeror, or appointtee is the empty string then they are
	// ignored in the Municipality lookup
	GetManagedMunicipalities(owner, conqueror, appointtee string) ([]*Municipality, error)
	// Return all the municipalities
	GetAllMunicipalities() ([]*Municipality, error)
}

var _ Store = new(inMemoryStore)

func NewInMemoryStore() Store {
	return &inMemoryStore{ms: make(map[string]Municipality), ss: make(map[Point]Square)}
}

type Point struct{ x, y int }

type inMemoryStore struct {
	sync.RWMutex
	ms map[string]Municipality
	ss map[Point]Square
}

func (is *inMemoryStore) AddMunicipality(m *Municipality) error {
	is.Lock()
	defer is.Unlock()
	is.ms[m.Id] = *m
	return nil
}

func (is *inMemoryStore) AddSquare(s *Square) error {
	is.Lock()
	defer is.Unlock()
	is.ss[Point{s.X, s.Y}] = *s
	return nil
}

func (is *inMemoryStore) getRect(x1, y1, x2, y2 int) ([]*Square, error) {
	is.RLock()
	defer is.RUnlock()
	p := Point{x1, y1}
	ss := make([]*Square, 0, (x2-x1)*(y2-y1))
	for p.x <= x2 && p.y <= y2 {
		if s, ok := is.ss[p]; ok {
			ss = append(ss, &s)
		}
		// Iterate through our rectangle's Points.
		if p.y == y2 {
			p.x++
			p.y = y1
		} else {
			p.y++
		}
	}
	return ss, nil
}

func (is *inMemoryStore) GetMunicipality(id string) (*Municipality, error) {
	is.RLock()
	defer is.RUnlock()
	if m, ok := is.ms[id]; ok {
		return &m, nil
	}
	return nil, nil
}

func (is *inMemoryStore) GetManagedMunicipalities(owner, conqueror, appointee string) ([]*Municipality, error) {
	is.RLock()
	defer is.RUnlock()
	ms := make([]*Municipality, 0, len(is.ms))
	for _, m := range is.ms {
		if owner == m.Owner && (conqueror == "" || m.Conqueror == conqueror) && (appointee == "" || m.Appointee == appointee) {
			ms = append(ms, &m)
		}
	}
	return ms, nil
}

func (is *inMemoryStore) GetAllMunicipalities() ([]*Municipality, error) {
	is.RLock()
	defer is.RUnlock()
	ms := make([]*Municipality, 0, len(is.ms))
	for _, m := range is.ms {
		ms = append(ms, &m)
	}
	return ms, nil
}

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

import (
	"encoding/json"
)

var (
	Fields = Terrain{ID: ".", Name: "Fields"}
	Forest = Terrain{ID: "T", Name: "Forest"}
	Sea    = Terrain{ID: "~", Name: "Sea"}
)

// Terrain defines the type of Terrain on a square of the map.
type Terrain struct {
	// short id for the terrain.
	ID string
	// Pretty UI name for the terrain.
	Name string
}

// Square defines a single square on a map.
type Square struct {
	// The unique ID for this square. otf: "x,y"
	ID string

	// The Terrain on this square.
	Terrain Terrain

	// x,y coordinate of this square.
	X, Y int

	// A building on this square. nil if no building is on this square.
	// Building *Building

	// The resource on this square. nil if no resource is on this square.
	// Resource *Resource
}

func (s Square) MarshalJSON() ([]byte, error) {
	return json.Marshal(map[string]interface{}{"id": s.ID, "terrain": s.Terrain.ID, "x": s.X, "Y": s.Y})
}

func (s *Square) UnmarshalJSON(data []byte) error {
	type HalfDeserializedSquare struct {
		ID      string
		Terrain string
		X, Y    int
	}

	var blob HalfDeserializedSquare
	if error := json.Unmarshal(data, &blob); error != nil {
		return error
	}

	s.ID = blob.ID
	// TODO(jwall): Make a global constant map of ID -> Terrain type, and use it here to prevent looking at every terrain instance.
	s.Terrain = Fields
	s.X = blob.X
	s.Y = blob.Y

	return nil
}

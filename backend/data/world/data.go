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

// package world defines the structs used for constructing a world map.
package world

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
	// The unique key for this resource.
	Id string
	// Human readable name for display in the UI.
	Name string
	// TODO(jwall):
}

// Terrain defines the type of Terrain on a square of the map.
// The zero value represents the default terrain.
type Terrain struct {
	Base
	// TODO(jwall): should it's traversability be stored in the terrain?
	// TODO(jwall): What are the type of Terrain?
}

// Square defines a single square on a map.
type Square struct {
	Base

	// The Terrain on this square.
	Terrain Terrain

	// x,y coordinate of this square.
	X, Y int

	// A building on this square. nil if no building is on this square.
	Building *Building

	// The resource on this square. nil if no resource is on this square.
	Resource *Resource
}

type Municipality struct {
	// Unique key identifying this Municipality
	Id string

	// x,y coordinate of this Municipality origin.
	X, Y int

	Owner string // Id of the owner of this municipality

	Conqueror string // Id of the player who has just conquererd this municipality
	Appointee string // Id of the player who has been appointed by the Conqueror
}

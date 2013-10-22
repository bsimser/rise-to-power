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

type role int

const (
	// Player users are the zero value Role for users.
	// They can play with other players but have no other powers.
	Player role = iota
	// Admin users are all powerful in the rise-to-power universe
	Admin
)

// User defines a user in the rise-to-power system.
// They have a Name and Role which defines what they are allowed to do in the
// Game.
type User struct {
	Name string
	Role role
}

// Store defines the datastore interface for Users in rise-to-power.
type Store interface {
	Get(name string) (*User, error)
	Save(*User) error
	Delete(name string) error
}

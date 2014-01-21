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

package state

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestStateSerialize(t *testing.T) {
	var state = State{Squares: []Square{{ID: "1,2", Terrain: Fields, X: 1, Y: 2}}}
	var output, _ = json.Marshal(state)

	var newState State
	if error := json.Unmarshal(output, &newState); error != nil {
		panic(error)
	}
	if !reflect.DeepEqual(state, newState) {
		t.Errorf("Serialized state %v doesn't match original state %v", newState, state)
	}
}

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

//import "testing"

/*var worldSquares = []*Square{
	{Base: Base{Id: "square1"}, X: 1, Y: 1},
	{Base: Base{Id: "square2"}, X: 1, Y: 2},
	{Base: Base{Id: "square3"}, X: 1, Y: 3},
	{Base: Base{Id: "square4"}, X: 2, Y: 1},
	{Base: Base{Id: "square5"}, X: 2, Y: 2},
	{Base: Base{Id: "square6"}, X: 2, Y: 3},
	{Base: Base{Id: "square7"}, X: 3, Y: 1},
	{Base: Base{Id: "square8"}, X: 3, Y: 2},
	{Base: Base{Id: "square9"}, X: 3, Y: 3},
}

var worldMunicipalities = []*Municipality{
	{Id: "Muni1", Owner: "dude1", X: 1, Y: 1},
	{Id: "Muni2", Owner: "dude1", Conqueror: "dude2", X: 10, Y: 10},
	{Id: "Muni3", Owner: "dude1", Conqueror: "dude2", Appointee: "dude3", X: 20, Y: 20},
}

func TestBasicMunicipalityStorage(t *testing.T) {
	st := NewInMemoryStore()
	l := len(worldMunicipalities)
	for _, m := range worldMunicipalities {
		if err := st.AddMunicipality(m); err != nil {
			t.Errorf("Error storing Municipality", err)
		}
	}
	ms, err := st.GetAllMunicipalities()
	if err != nil {
		t.Errorf("Error storing Municipality", err)
	}
	if len(ms) != l {
		t.Logf("ms: %v", ms)
		t.Errorf("Expected %d Municipalities got %d", l, len(ms))
	}
	for _, m := range worldMunicipalities {
		m2, err := st.GetMunicipality(m.Id)
		if err != nil {
			t.Errorf("Error getting muni %s", err)
		}
		if m.Id != m2.Id {
			t.Errorf("Expected muni %v got %v", m, m2)
		}
	}
	ms, err = st.GetManagedMunicipalities("dude1", "", "")
	if err != nil {
		t.Errorf("Error getting managed Municipalities", err)
	}
	if len(ms) != l {
		t.Logf("ms: %v", ms)
		t.Errorf("Expected %d Municipalities got %d", l, len(ms))
	}
	ms, err = st.GetManagedMunicipalities("dude1", "dude2", "")
	if err != nil {
		t.Errorf("Error getting managed Municipalities", err)
	}
	if len(ms) != 2 {
		t.Logf("ms: %v", ms)
		t.Errorf("Expected %d Municipalities got %d", l, len(ms))
	}
	ms, err = st.GetManagedMunicipalities("dude1", "dude2", "dude3")
	if err != nil {
		t.Errorf("Error getting managed Municipalities", err)
	}
	if len(ms) != 1 {
		t.Logf("ms: %v", ms)
		t.Errorf("Expected %d Municipalities got %d", l, len(ms))
	}
}

func TestBasicSquareStorage(t *testing.T) {
	st := NewInMemoryStore().(*inMemoryStore)
	l := len(worldSquares)
	for _, s := range worldSquares {
		if err := st.AddSquare(s); err != nil {
			t.Errorf("Error storing Square", err)
		}
	}
	x1, y1, x2, y2 := worldSquares[0].X, worldSquares[0].Y, worldSquares[l-1].X, worldSquares[l-1].Y
	if ss, err := st.getRect(x1, y1, x2, y2); err == nil {
		if len(ss) != l {
			t.Errorf("Expected %d squares back got %d", l, len(ss))
		}
		for i, s := range ss {
			if *s != *(worldSquares[i]) {
				t.Errorf("Expected %v got %v", ss, worldSquares[i])
			}
		}
	} else {
		t.Errorf("Error getting rectangle %s", err)
	}
}
*/

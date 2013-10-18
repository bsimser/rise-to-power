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

import "testing"

func TestSessionStorage(t *testing.T) {
	// First assert that we satisfy the interface
	var store Store
	store = NewInMemoryStore()

	// Now we want to test the actual concrete implementation.
	memStore := store.(*inMemorySessionStore)
	// No session exists case.
	s, err := memStore.Get("foo session")
	if s != nil || err != NoSuchSession {
		t.Errorf("Expected nil session with error. Got %v with %v", s, err)
	}

	// Create a new session
	s, err = memStore.StartSession("foo session")
	if s == nil || err != nil {
		t.Errorf("Expected new session with no error. Got %v with %v", s, err)
	}

	// Save the session
	if err = memStore.Save(s); err != nil {
		t.Errorf("Unexpected error saving session. %v", err)
	}

	// Retrieve the session.
	s, err = memStore.Get("foo session")
	if s == nil || err != nil {
		t.Logf("sessions: %v", memStore.store)
		t.Errorf("Expected valid session with error. Got %v with %v", s, err)
	}
}

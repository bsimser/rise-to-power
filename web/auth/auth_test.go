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

package auth

import "testing"

func TestUserStore(t *testing.T) {
	mgr := New(NewInMemoryStore())
	err := mgr.NewUser("me", "mypass")
	if err != nil {
		t.Error(err.Error())
	}
	if ok, err := mgr.Authenticate("me", "mypass"); !ok {
		t.Error("Failed to authenticate with %q", err)
	}
	if ok, _ := mgr.Authenticate("me", "mypass2"); ok {
		t.Error("Unexpected success authenticating with")
	}
	if err := mgr.UpdatePassword("me", "mypass2", "mypass3"); err == nil {
		t.Error("Unexpected success updating user password")
	}
	if err := mgr.UpdatePassword("me", "mypass", "mypass2"); err != nil {
		t.Error("Failed to update user password with %q", err)
	}
}

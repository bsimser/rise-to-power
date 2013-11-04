// Copyright 2013 Google Inc.
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

define(function() {
  var Municipality = function(id, x, y, owner, conqueror, appointee) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.owner = owner;
    this.conqueror = conqueror;
    this.appointee = appointee;
  };
  
  // Deserializes a JSON object into a semi-loaded Municipality instance.
  Municipality.deserialize = function(m) {
    return new Municipality(m.id, m.x, m.y, m.owner, m.conqueror, m.appointee);
  };
  
  // Finishes deserializing a semi-loaded Municipality instance. Note that
  // accessing the items in the state's collections are safe, but not reaching
  // through those items to the items they point to. Be warned.
  // @param {GameState} state The semi-loaded game state.
  Municipality.prototype.finishDeserialize = function(state) {
    this.owner = state.getPlayerByName(this.owner);
    this.conqueror = this.conqueror ? state.getPlayerByName(this.conqueror) : null;
    this.appointee = this.appointee ? state.getPlayerByName(this.appointee) : null;
  };
  
  return Municipality;
});

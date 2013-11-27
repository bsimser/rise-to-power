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

define(function(require) {
  var Unit = function(id, type, owner, location, power, group) {
    this.id = id;
    this.type = type;
    this.owner = owner;
    this.location = location;
    this.power = power;
    this.group = group;
  };
  
  // Deserializes a JSON object into a Unit instance.
  Unit.deserialize = function(unit) {
    return new Unit(unit.id, unit.type, unit.owner, unit.location, unit.power, unit.group);
  };
  
  Unit.prototype.finishDeserialize = function(state, rules) {
    this.type = rules.getUnitBlueprintById(this.type);
    this.owner = state.getPlayerByName(this.owner);
    this.location = state.getSquareByKey(this.location);
  };
  
  return Unit;
});

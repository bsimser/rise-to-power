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
  var UnitBlueprint = function(id, name, image, maxPower, movement, modifiers) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.maxPower = maxPower;
    this.movement = movement;
    this.modifiers = modifiers || [];
  };
  
  // Deserializes a JSON object into a UnitBlueprint instance.
  UnitBlueprint.deserialize = function(blueprint) {
    return new UnitBlueprint(blueprint.id, blueprint.name, blueprint.image,
                             blueprint.maxPower, blueprint.movement,
                             blueprint.modifiers);
  };
  
  // TODO(applmak): Design the modifier stuff and add the appropriate
  // finishDeserialize here when it's ready.
  
  return UnitBlueprint;
});

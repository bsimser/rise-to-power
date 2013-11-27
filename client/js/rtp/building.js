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
  var ResourceQuantity = require('rtp/resource-quantity');
  var Building = function(id, type, location, productionLevels, storage) {
    this.id = id;
    this.type = type;
    this.location = location;
    this.productionLevels = productionLevels;
    this.storage = storage;
  };
  
  // Deserializes a JSON object into a Building instance.
  Building.deserialize = function(building) {
    var storage = building.storage.map(ResourceQuantity.deserialize);
    return new Building(building.id, building.type, building.location,
                        building.productionLevels, storage);
  };
  
  // Finishes the deserialization process.
  Building.prototype.finishDeserialize = function(state, rules) {
    this.type = rules.getBuildingBlueprintById(this.type);
    this.location = state.getSquareByKey(this.location);
    this.storage.forEach(function(s) {
      s.finishDeserialize(state, rules);
    });
  };
  
  return Building;
});

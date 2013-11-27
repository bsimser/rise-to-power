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
  var UnitBlueprint = require('rtp/unit-blueprint');
  var ResourceBlueprint = require('rtp/resource-blueprint');
  var BuildingBlueprint = require('rtp/building-blueprint');
  
  var Rules = function(unitBlueprints, resourceBlueprints, buildingBlueprints) {
    this.unitBlueprints = unitBlueprints;
    this.resourceBlueprints = resourceBlueprints;
    this.buildingBlueprints = buildingBlueprints;
    // handy maps:
    this.unitBlueprintsById = {};
    this.unitBlueprints.forEach(function(ub) {
      this.unitBlueprintsById[ub.id] = ub;
    }, this);
    
    this.resourceBlueprintsById = {};
    this.resourceBlueprints.forEach(function(rb) {
      this.resourceBlueprintsById[rb.id] = rb;
    }, this);

    this.buildingBlueprintsById = {};
    this.buildingBlueprints.forEach(function(bb) {
      this.buildingBlueprintsById[bb.id] = bb;
    }, this);
  };
  Rules.prototype.getUnitBlueprintById = function(id) {
    return this.unitBlueprintsById[id];
  };
  Rules.prototype.getResourceBlueprintById = function(id) {
    return this.resourceBlueprintsById[id];
  };
  Rules.prototype.getBuildingBlueprintById = function(id) {
    return this.buildingBlueprintsById[id];
  };

  
  // Deserializes a JSON object into a Rules instance.
  Rules.deserialize = function(rules) {
    return new Rules(
      rules.unitBlueprints.map(UnitBlueprint.deserialize),
      rules.resourceBlueprints.map(ResourceBlueprint.deserialize),
      rules.buildingBlueprints.map(BuildingBlueprint.deserialize)
    );
  };
  
  Rules.prototype.finishDeserialize = function() {
    this.buildingBlueprints.forEach(function(blueprint) {
      blueprint.finishDeserialize(null, this);
    }, this);
  };
  
  return Rules;
});

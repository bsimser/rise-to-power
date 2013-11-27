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
  
  var BuildingBlueprint = function(id, name, image, production, constructionCost) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.production = production;
    this.constructionCost = constructionCost;
  };
  
  // Deserializes a JSON object into a BuildingBlueprint instance.
  BuildingBlueprint.deserialize = function(blueprint) {
    var costs = null;
    if (blueprint.constructionCost) {
      costs = blueprint.constructionCost.map(ResourceQuantity.deserialize);
    }
    return new BuildingBlueprint(blueprint.id, blueprint.name, blueprint.image,
                             blueprint.production, costs);
  };
  
  BuildingBlueprint.prototype.finishDeserialize = function(state, rules) {
    if (this.constructionCost) {
      this.constructionCost.forEach(function(cost) {
        cost.finishDeserialize(state, rules);
      });
    }
  };
  
  return BuildingBlueprint;
});

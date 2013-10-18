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
  var Terrain = require('rtp/terrain');
  
  var Square = function(id, terrain, x, y, buildingProduction, building, resource) {
    this.id = id;
    this.terrain = terrain;
    this.x = x;
    this.y = y;
    this.buildingProduction = buildingProduction;
    this.building = building;
    this.resource = resource;
  };
  
  // Deserializes a JSON object into a Square instance.
  Square.deserialize = function(square) {
    return new Square(square.id, Terrain.byId[square.terrain], square.x, square.y,
                      square.buildingProduction, square.building, square.resource);
  };
  
  return Square;
});

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
  var Terrain = function(id, name, image, isWet, modifiers) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.isWet = isWet;
    this.modifiers = modifiers;
  };
  
  // Deserializes a JSON terrain object into a Terrain instance.
  Terrain.deserialize = function(terrain) {
    return new Terrain(terrain.id, terrain.name, terrain.image, terrain.isWet,
                       terrain.modifiers || []);
  };
  
  // Handy named terrain types.
  Terrain.FIELD = new Terrain('.', 'Fields', 'terrain/field.png', false);
  Terrain.FOREST = new Terrain('T', 'Forest', 'terrain/forest.png', false);
  Terrain.SEA = new Terrain('~', 'Sea', 'terrain/sea.png', true);
  
  // Terrain types by their IDs
  Terrain.byId = {
    '.' : Terrain.FIELD,
    'T' : Terrain.FOREST,
    '~' : Terrain.SEA,
  };
  
  return Terrain;
});

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
  var ResourceBlueprint = function(id, name, image) {
    this.id = id;
    this.name = name;
    this.image = image;
  };
  
  // Deserializes a JSON object into a ResourceBlueprint instance.
  ResourceBlueprint.deserialize = function(blueprint) {
    return new ResourceBlueprint(blueprint.id, blueprint.name, blueprint.image);
  };
  
  return ResourceBlueprint;
});

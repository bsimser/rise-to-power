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
  var Rules = require('rtp/rules');
  
  var r = Rules.deserialize({
    unitBlueprints: [{id: 'dude', name: 'Dude', image: 'units/dude.png', maxPower: 50, movement: 3, modifiers: []}],
    resourceBlueprints: [{id: 'iron', name: 'Iron', image: 'iron.png'},
                         {id: 'lumber', name: 'Lumber', image: 'lumber.png'},
                         {id: 'coal', name: 'Coal', image: 'coal.png'}],
    buildingBlueprints: [{id: 'farm', name: 'Farm', image: 'buildings/farm.png', production: null,
                          constructionCost: [{quantity: 17, blueprint: 'iron'},
                                             {quantity: 5, blueprint: 'lumber'}]}]
  });
  r.finishDeserialize();
  return r;
});

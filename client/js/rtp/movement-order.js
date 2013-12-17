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
  var Order = require('rtp/order');
  
  var MovementOrder = function(id, unit, destination, path) {
    Order.call(this, id, 'Move Units', MovementOrder.id);
    this.unit = unit;
    this.destination = destination;
    this.path = path;
  };
  MovementOrder.id = 'MovementOrder';
  MovementOrder.prototype = Object.create(Order.prototype);
  Order.registerSubtype(MovementOrder);
  
  MovementOrder.deserialize = function(mo) {
    return new MovementOrder(mo.id, mo.unit, mo.destination, mo.path);
  };

  // Finishes deserializing a semi-loaded MovementOrder instance. Note that
  // accessing the items in the state's collections are safe, but not reaching
  // through those items to the items they point to. Be warned.
  // @param {GameState} state The semi-loaded game state.
  MovementOrder.prototype.finishDeserialize = function(state, rules) {
    this.unit = state.getUnitById(this.unit);
    this.destination = state.getSquareByKey(this.destination);
    this.path = this.path.map(function(p) {
      return state.getSquareByKey(p);
    });
  };

  return MovementOrder;
});

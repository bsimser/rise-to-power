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
  var Order = function(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
  };
  
  // A map of type string -> order subclasses.
  Order.orderTypes = {};
  
  Order.registerSubtype = function(constructor) {
    Order.orderTypes[constructor.id] = constructor;
  };
  
  // Deserializes a JSON object into a semi-loaded Order instance.
  Order.deserialize = function(o) {
    var constructor = Order.orderTypes[o.type];
    console.assert(constructor, 'No order found for type', o.type);
    return constructor.deserialize(o);
  };

  return Order;
});

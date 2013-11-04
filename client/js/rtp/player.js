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
  var Player = function(id, name, friends, hostiles, ownedLand, title, liege, vassals, orders) {
    this.id = id;
    this.name = name;
    this.friends = friends || [];
  	this.hostiles = hostiles || [];
  	this.ownedLand = ownedLand || [];
    // TODO(applmak): Do something clever with the titles.
  	this.title = title;
  	this.liege = liege;
  	this.vassals = vassals || [];
    this.orders = orders || [];
  };
  
  // Deserializes a JSON object into a semi-loaded Player instance.
  Player.deserialize = function(p) {
    return new Player(p.id, p.name, p.friends, p.hostiles, p.ownedLand, p.title, p.liege, p.vassals, p.orders);
  };
  
  // Finishes deserializing a semi-loaded Player instance. Note that
  // accessing the items in the state's collections are safe, but not reaching
  // through those items to the items they point to. Be warned.
  // @param {GameState} state The semi-loaded game state.
  Player.prototype.finishDeserialize = function(state) {
    this.friends = this.friends.map(state.getPlayerByName, state);
    this.hostiles = this.hostiles.map(state.getPlayerByName, state);
    this.ownedLand = this.ownedLand.map(state.getMunicipalityByKey, state);
    
    this.liege = this.liege ? state.getPlayerByName(this.liege) : null;
    this.vassals = this.vassals.map(state.getPlayerByName, state);
    
    // TODO(applmak): Orders
  };

  return Player;
});

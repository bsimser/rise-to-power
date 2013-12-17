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
  var Square = require('rtp/square');
  var Municipality = require('rtp/municipality');
  var Player = require('rtp/player');
  var Unit = require('rtp/unit');
  var Building = require('rtp/building');
  var Order = require('rtp/order');
  // Because of the way that Orders work, we need to include the subclasses 
  // somewhere.... here is fine.
  var MovementOrder = require('rtp/movement-order');
  
  var OFFSETS = {
    'u': {x: -1, y: 1},
    'ur': {x: 0, y: 1},
    'r': {x: 1, y: 1},
    'dr': {x: 1, y: 0},
    'd': {x: 1, y: -1},
    'dl': {x: 0, y: -1},
    'l': {x: -1, y: -1},
    'ul': {x: -1, y: 0},
  };
  
  var GameState = function(squares, municipalities, players, units, buildings, orders) {
    this.squares = squares;
    this.municipalities = municipalities;
    this.players = players;
    this.units = units;
    this.buildings = buildings;
    this.orders = orders;
    
    // build a handy-dandy map of x,y location to square to save time.
    this.squaresByLocation = {};
    this.squares.forEach(function(s) {
      this.squaresByLocation[s.x + ',' + s.y] = s;
    }, this);
    // build a map of x,y -> municipality.
    this.municipalitiesByKey = {};
    this.municipalities.forEach(function(m) {
      this.municipalitiesByKey[m.x + ',' + m.y] = m;
    }, this);
    // build a map of name -> player.
    this.playersByName = {};
    this.players.forEach(function(p) {
      this.playersByName[p.name] = p;
    }, this);
    // build a map of id -> unit
    this.unitsById = {};
    // build a multimap of location -> unit.
    this.unitsByLocation = {};
    this.units.forEach(function(u) {
      // Note that these units are half-deserialized units, with no points to
      // other data objects.
      (this.unitsByLocation[u.location] = this.unitsByLocation[u.location] || []).push(u);
      this.unitsById[u.id] = u;
    }, this);
    
    // build a map of location -> building.
    this.buildingsByLocation = {};
    this.buildings.forEach(function(b) {
      this.buildingsByLocation[b.location] = b;
    }, this);
    
    // build a map of id -> order.
    this.ordersById = {};
    this.orders.forEach(function(o) {
      this.ordersById[o.id] = o;
    }, this);
  };
  GameState.prototype.getSquareByKey = function(key) {
    return this.squaresByLocation[key];
  };
  GameState.prototype.getSquareAt = function(x, y) {
    return this.squaresByLocation[x + ',' + y];
  };
  // Returns the neighbors of a square at a location.
  // TODO(applmak): Maybe memoize?
  GameState.prototype.getNeighborsOfSquareAt = function(x, y, neighbors) {
    for (var dir in OFFSETS) {
      var offset = OFFSETS[dir];
      neighbors[dir] = this.getSquareAt(x + offset.x, y + offset.y);
    }
    return neighbors;
  };
  GameState.prototype.getMunicipalityByKey = function(key) {
    return this.municipalitiesByKey[key];
  };
  GameState.prototype.getMunicipalityAt = function(x, y) {
    return this.getMunicipalityByKey((Math.floor(x / 17) * 17) + ',' + 
                                     (Math.floor(y / 17) * 17));
  };
  GameState.prototype.getPlayerByName = function(name) {
    return this.playersByName[name];
  };
  GameState.prototype.getUnitById = function(id) {
    return this.unitsById[id];
  };
  GameState.prototype.getUnitsAt = function(x, y) {
    return this.unitsByLocation[x + ',' + y] || [];
  };
  GameState.prototype.getBuildingAt = function(x, y) {
    return this.buildingsByLocation[x + ',' + y];
  };
  GameState.prototype.getOrderById = function(id) {
    return this.ordersById[id];
  };
  
  // Deserializes an entire game state into a GameState instance.
  GameState.deserialize = function(s) {
    return new GameState(
      s.squares.map(Square.deserialize),
      s.municipalities.map(Municipality.deserialize),
      s.players.map(Player.deserialize),
      s.units.map(Unit.deserialize),
      s.buildings.map(Building.deserialize),
      s.orders.map(Order.deserialize)
    );
  };
  
  // Finishes the deserialization.
  // TODO(applmak): In the future, if we ever support sending down only the
  // changed GameState to clients, this method may use its GameState to
  // apply itself to as well.
  GameState.prototype.finishDeserialize = function(state, rules) {
    // Call the relevant finish methods.
    this.municipalities.forEach(function(m) {
      m.finishDeserialize(this);
    }, this);
    this.players.forEach(function(p) {
      p.finishDeserialize(this);
    }, this);
    this.units.forEach(function(u) {
      u.finishDeserialize(this, rules);
    }, this);
    this.buildings.forEach(function(b) {
      b.finishDeserialize(this, rules);
    }, this);
    this.orders.forEach(function(o) {
      o.finishDeserialize(this, rules);
    }, this);
  };
  
  return GameState;
});

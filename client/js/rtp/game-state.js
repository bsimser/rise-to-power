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
  
  var GameState = function(squares) {
    this.squares = squares;
    // build a handy-dandy map of x,y location to square to save time.
    this.squaresByLocation = {};
    this.squares.forEach(function(s) {
      this.squaresByLocation[s.x + ',' + s.y] = s;
    }, this);
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
  
  // Deserializes an entire game state into a GameState instance.
  GameState.deserialize = function(state) {
    return new GameState(
      state.squares.map(Square.deserialize)
    );
  };
  
  return GameState;
});

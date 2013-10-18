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
  
  // Deserializes an entire game state into a GameState instance.
  GameState.deserialize = function(state) {
    return new GameState(
      state.squares.map(Square.deserialize)
    );
  };
  
  return GameState;
});

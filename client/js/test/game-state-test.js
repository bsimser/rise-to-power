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
  var chai = require('chai');
  var sinonChai = require('test/sinon-chai');
  chai.use(sinonChai);
  
  var expect = chai.expect;
  var sinon = require('test/sinon');
  var GameState = require('rtp/game-state');
  var Square = require('rtp/square');
  var Terrain = require('rtp/terrain');
  
  describe('GameState', function() {
    var state;
    beforeEach(function() {
      state = new GameState([new Square('', Terrain.FIELD, 1, 3, undefined, undefined, undefined),
                             new Square('', Terrain.FIELD, 1, 4, undefined, undefined, undefined)]);
    });
    it('can return a square by location', function() {
      var square = state.getSquareAt(1, 3);
      expect(square).to.be.defined;
      expect(square.x).to.equal(1);
      expect(square.y).to.equal(3);      
    });
    it('returns undefined when asked about a square it doesn\'t know about', function() {
      expect(state.getSquareAt(0, 0)).to.be.undefined;
    });
    it('can return neighbor squares', function() {
      var neighbors = state.getNeighborsOfSquareAt(1, 3, {});
      expect(neighbors.ur).to.equal(state.getSquareAt(1, 4));
    });
  });
});

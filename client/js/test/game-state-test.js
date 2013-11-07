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
  var Player = require('rtp/player');
  var Municipality = require('rtp/municipality');
  
  describe('GameState', function() {
    describe('instance', function() {
      var state;
      beforeEach(function() {
        state = new GameState([new Square('', Terrain.FIELD, 1, 3, undefined, undefined, undefined),
                               new Square('', Terrain.FIELD, 1, 4, undefined, undefined, undefined)],
                              [new Municipality('0,0', 0, 0)], []);
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
      it('can return the municipality containing a location', function() {
        var municipality = state.getMunicipalityAt(10, 5);
        expect(municipality).to.be.instanceof(Municipality);
        expect(municipality.x).to.equal(0);
        expect(municipality.y).to.equal(0);
      });
    });
    
    describe('deserialize', function() {
      var state;
      beforeEach(function() {
        state = GameState.deserialize({
          squares: [{id: '0,0', terrain: '.', x: 0, y: 0}],
          municipalities: [{id: '0,0', x: 0, y: 0, owner: 'applmak'}, {id: '17,17', x: 17, y: 17, owner: 'jwall'}],
          players: [{id: 'applmak', name: 'applmak', ownedLand: ['0,0'], liege: 'jwall'},
                    {id: 'jwall', name: 'jwall', ownedLand: ['17,17'], vassals: ['applmak']}],
        });
      });
      it('doesn\'t resolve anything yet', function() {
        expect(state).to.be.an.instanceof(GameState);
        expect(state.players[0]).to.be.an.instanceof(Player);
        expect(state.players[0].liege).to.equal('jwall');
        expect(state.municipalities[0]).to.be.an.instanceof(Municipality);
        expect(state.municipalities[0].owner).to.equal('applmak');
      });
      it('resolves everything', function() {
        state.finishDeserialize(null);
        expect(state.players[0].liege).to.be.an.instanceof(Player);
        expect(state.players[0].liege.name).to.equal('jwall');
        expect(state.municipalities[0].owner).to.be.an.instanceof(Player);
        expect(state.municipalities[0].owner.name).to.equal('applmak');
      });
    });
  });
});

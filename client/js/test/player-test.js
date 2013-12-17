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
  var Unit = require('rtp/unit');
  var Player = require('rtp/player');
  var Municipality = require('rtp/municipality');
  
  describe('Player', function() {
    describe('deserialize', function() {
      var player;
      beforeEach(function() {
        player = Player.deserialize({
          id: 'matt', name: 'matt', friends: ['jwall', 'swsnider'],
          hostiles: ['george'], ownedLand: ['0,0'], title: 0, liege: null,
          vassals: ['dude'], orders: null
        });
      });
      
      it('doesn\'t resolve anything initially', function() {
        expect(player).to.be.an.instanceof(Player);
        expect(player.friends[0]).to.equal('jwall');
        expect(player.liege).to.be.null;
      });
      
      it('resolves keys on finishDeserialize', function() {
        var state = new GameState([], [new Municipality('0,0', 0, 0)], [
          new Player('jwall', 'jwall'),
          new Player('swsnider', 'swsnider'),
          new Player('george', 'george'),
          new Player('dude', 'dude'),
        ], [], [], []);
        player.finishDeserialize(state);
        
        expect(player.liege).to.be.null;
        expect(player.friends[0]).to.be.an.instanceof(Player);
        expect(player.friends[0].name).to.equal('jwall');
        expect(player.hostiles[0].name).to.equal('george');
        expect(player.ownedLand[0]).to.be.an.instanceof(Municipality);
        expect(player.vassals[0].name).to.equal('dude');
      });
    });
  });
});

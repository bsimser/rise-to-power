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
  var Player = require('rtp/player');
  var Municipality = require('rtp/municipality');
  
  describe('Municipality', function() {
    describe('deserialize', function() {
      it('doesn\'t resolve players initially', function() {
        var m = Municipality.deserialize({
          id: '1', x: 0, y: 0,
          owner: 'owner', conqueror: null, appointee: null
        });
        expect(m).to.be.an.instanceof(Municipality);
        expect(m.owner).to.equal('owner');
      });
      
      it('supports a finish pass on the semi-loaded instances', function() {
        var m = Municipality.deserialize({
          id: '1', x: 0, y: 0,
          owner: 'matt', conqueror: null, appointee: null
        });
        var state = new GameState([], [], [
          new Player('id', 'matt')
        ], [], [], []);
        m.finishDeserialize(state);
        expect(m.owner).to.be.an.instanceof(Player);
        expect(m.owner.name).to.equal('matt');
        expect(m.conquerer).to.be.falsey;
        expect(m.appointee).to.be.falsey;
      });
    });
  });
});

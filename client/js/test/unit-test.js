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
  var testRules = require('rtp/test-rules');
  var GameState = require('rtp/game-state');
  var Unit = require('rtp/unit');
  var Player = require('rtp/player');
  var Square = require('rtp/square');
  var UnitBlueprint = require('rtp/unit-blueprint');
  
  describe('Unit', function() {
    describe('deserialize', function() {
      var unit;
      beforeEach(function() {
        unit = Unit.deserialize({
          id: '1', type: 'dude', owner: 'matt', location: '1,4', power: 5, group: 'group1'
        });
      });
      
      it('doesn\'t resolve anything initially', function() {
        expect(unit).to.be.an.instanceof(Unit);
        expect(unit.owner).to.equal('matt');
        expect(unit.location).to.equal('1,4');
        expect(unit.type).to.equal('dude');
      });
      
      it('resolves key on finishDeserialize', function() {
        var state = new GameState(
          [new Square('', '', 1, 4)],
          [],
          [new Player('matt', 'matt')],
          [], []);
        unit.finishDeserialize(state, testRules);
        expect(unit).to.be.an.instanceof(Unit);
        expect(unit.owner).to.be.an.instanceof(Player);
        expect(unit.owner.name).to.equal('matt');
        expect(unit.location).to.be.an.instanceof(Square);
        expect(unit.location.x).to.equal(1);
        expect(unit.type).to.be.an.instanceof(UnitBlueprint);
        expect(unit.type.id).to.equal('dude');
      });
    });
  });
});

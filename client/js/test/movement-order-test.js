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
  var Square = require('rtp/square');
  var MovementOrder = require('rtp/movement-order');
  
  describe('MovementOrder', function() {
    describe('deserialize', function() {
      var movementOrder;
      beforeEach(function() {
        movementOrder = MovementOrder.deserialize({
          id: 'mo', unit: 'dude', destination: '1,2', path: ['1,3', '1,2']
        });
      });
      
      it('doesn\'t resolve anything initially', function() {
        expect(movementOrder).to.be.an.instanceof(MovementOrder);
        expect(movementOrder.unit).to.equal('dude');
        expect(movementOrder.destination).to.equal('1,2');
        expect(movementOrder.path[0]).to.equal('1,3');
      });
      
      it('resolves keys on finishDeserialize', function() {
        var state = new GameState(
          [new Square('1,2', null, 1, 2), new Square('1,3', null, 1, 3)], [],
          [], [new Unit('dude', 'dude')], [], []);
        movementOrder.finishDeserialize(state);
        
        expect(movementOrder.unit).to.be.an.instanceof(Unit);
        expect(movementOrder.unit.id).to.equal('dude');
        expect(movementOrder.destination).to.be.an.instanceof(Square);
        expect(movementOrder.destination.id).to.equal('1,2');
        expect(movementOrder.path[0]).to.be.an.instanceof(Square);
        expect(movementOrder.path[0].id).to.equal('1,3');
      });
    });
  });
});

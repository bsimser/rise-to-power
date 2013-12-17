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
  var Building = require('rtp/building');
  var BuildingBlueprint = require('rtp/building-blueprint');
  var ResourceBlueprint = require('rtp/resource-blueprint');
  var ResourceQuantity = require('rtp/resource-quantity');
  var Square = require('rtp/square');
  var GameState = require('rtp/game-state');
  
  describe('Building', function() {
    describe('deserialize', function() {
      var building;
      beforeEach(function() {
        building = Building.deserialize({
          id: '34a', type: 'farm', location: '0,0', production: null, storage: [{quantity: 5, blueprint: 'coal'}]
        });
      });
      
      it('doesn\'t resolve anything initially', function() {
        expect(building).to.be.an.instanceof(Building);
        expect(building.type).to.equal('farm');
        expect(building.location).to.equal('0,0');
        expect(building.storage[0].blueprint).to.equal('coal');
      });
      
      it('resolves keys on finishDeserialize', function() {
        var state = new GameState([new Square('0,0', null, 0, 0)], [], [], [], [], []);
        building.finishDeserialize(state, testRules);
        
        expect(building.type).to.be.an.instanceof(BuildingBlueprint);
        expect(building.type.id).to.equal('farm');
        expect(building.location).to.be.an.instanceof(Square);
        expect(building.location.id).to.equal('0,0');
        expect(building.storage[0]).to.be.an.instanceof(ResourceQuantity);
        expect(building.storage[0].blueprint).to.be.an.instanceof(ResourceBlueprint);
        expect(building.storage[0].blueprint.id).to.equal('coal');
      });
    });
  });
});

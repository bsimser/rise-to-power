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
  var BuildingBlueprint = require('rtp/building-blueprint');
  var ResourceBlueprint = require('rtp/resource-blueprint');
  var ResourceQuantity = require('rtp/resource-quantity');
  
  describe('BuildingBlueprint', function() {
    describe('deserialize', function() {
      var building;
      beforeEach(function() {
        building = BuildingBlueprint.deserialize({
          id: 'farm', name: 'Farm', image: 'farm.png', production: null, constructionCost: [{quantity: 56, blueprint: 'coal'}]
        });
      });
      
      it('doesn\'t resolve anything initially', function() {
        expect(building).to.be.an.instanceof(BuildingBlueprint);
        expect(building.constructionCost[0]).to.be.an.instanceof(ResourceQuantity);
        expect(building.constructionCost[0].blueprint).to.equal('coal');
      });
      
      it('resolves keys on finishDeserialize', function() {
        building.finishDeserialize(null, testRules);
        
        expect(building.constructionCost[0].blueprint).to.be.an.instanceof(ResourceBlueprint);
        expect(building.constructionCost[0].blueprint.id).to.equal('coal');
      });
    });
  });
});

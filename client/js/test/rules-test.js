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
  var Rules = require('rtp/rules');
  var UnitBlueprint = require('rtp/unit-blueprint');
  var ResourceBlueprint = require('rtp/resource-blueprint');
  var ResourceQuantity = require('rtp/resource-quantity');
  var BuildingBlueprint = require('rtp/building-blueprint');
  
  describe('Rules', function() {
    describe('instance', function() {
      var rules;
      beforeEach(function() {
        rules = new Rules([new UnitBlueprint('unit', 'unit')],
                          [new ResourceBlueprint('gold', 'Gold', 'gold.png')],
                          [new BuildingBlueprint('farm', 'Farm', 'farm.png', null, [new ResourceQuantity(14, 'gold')])]);
      });
      it('can return a unit blueprint by id', function() {
        var unitBlueprint = rules.getUnitBlueprintById('unit');
        expect(unitBlueprint).to.be.an.instanceof(UnitBlueprint);
        expect(unitBlueprint.id).to.equal('unit');
      });
      it('can return a resource blueprint by id', function() {
        var resourceBlueprint = rules.getResourceBlueprintById('gold');
        expect(resourceBlueprint).to.be.an.instanceof(ResourceBlueprint);
        expect(resourceBlueprint.id).to.equal('gold');
      });
      it('can return a building blueprint by id', function() {
        var buildingBlueprint = rules.getBuildingBlueprintById('farm');
        expect(buildingBlueprint).to.be.an.instanceof(BuildingBlueprint);
        expect(buildingBlueprint.id).to.equal('farm');
      });
    });
    
    describe('deserialize', function() {
      var rules;
      beforeEach(function() {
        rules = Rules.deserialize({
          unitBlueprints: [{id: 'unit', name: 'unit', image: 'unit.png', maxPower: 20, movement: 17, modifiers: []}],
          resourceBlueprints: [{id: 'gold', name: 'Gold', image: 'gold.png'}],
          buildingBlueprints: [{id: 'farm', name: 'Farm', image: 'farm.png', production: null, constructionCost: [{quantity: 10, blueprint: 'gold'}]}]
        });
      });
      it('works', function() {
        expect(rules).to.be.an.instanceof(Rules);
        expect(rules.unitBlueprints[0]).to.be.an.instanceof(UnitBlueprint);
        expect(rules.unitBlueprints[0].name).to.equal('unit');
        expect(rules.resourceBlueprints[0]).to.be.an.instanceof(ResourceBlueprint);
        expect(rules.resourceBlueprints[0].name).to.equal('Gold');
        expect(rules.buildingBlueprints[0]).to.be.an.instanceof(BuildingBlueprint);
        expect(rules.buildingBlueprints[0].name).to.equal('Farm');
        expect(rules.buildingBlueprints[0].constructionCost[0].blueprint).to.equal('gold');
      });
      
      it('completes serialization in finish deserialize', function() {
        rules.finishDeserialize();
        expect(rules.buildingBlueprints[0]).to.be.an.instanceof(BuildingBlueprint);
        expect(rules.buildingBlueprints[0].constructionCost[0].blueprint).to.be.an.instanceof(ResourceBlueprint);
        expect(rules.buildingBlueprints[0].constructionCost[0].blueprint.id).to.equal('gold');
      });
    });
  });
});

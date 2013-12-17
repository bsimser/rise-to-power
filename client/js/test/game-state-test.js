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
  var Unit = require('rtp/unit');
  var UnitBlueprint = require('rtp/unit-blueprint');
  var ResourceQuantity = require('rtp/resource-quantity');
  var Building = require('rtp/building');
  var BuildingBlueprint = require('rtp/building-blueprint');
  var MovementOrder = require('rtp/movement-order');
  var testRules = require('rtp/test-rules');
  
  describe('GameState', function() {
    describe('instance', function() {
      var state;
      beforeEach(function() {
        state = new GameState([new Square('', Terrain.FIELD, 1, 3, undefined, undefined, undefined),
                               new Square('', Terrain.FIELD, 1, 4, undefined, undefined, undefined)],
                              [new Municipality('0,0', 0, 0)],
                              [new Player('joe', 'joe')],
                              [new Unit('dude', 'dude', 'joe', '1,4')],
                              [new Building('myfarm', 'farm', '1,3', [], [new ResourceQuantity(100, 'lumber')])],
                              [new MovementOrder('someorder', 'dude', '1,3', ['1,3'])]);
      });
      it('can return a square by key', function() {
        var square = state.getSquareByKey('1,3');
        expect(square).to.be.defined;
        expect(square.x).to.equal(1);
        expect(square.y).to.equal(3);      
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
      it('can return the municipality by its location key', function() {
        var municipality = state.getMunicipalityByKey('0,0');
        expect(municipality).to.be.instanceof(Municipality);
        expect(municipality.x).to.equal(0);
        expect(municipality.y).to.equal(0);
      });
      it('can return the municipality containing a location', function() {
        var municipality = state.getMunicipalityAt(10, 5);
        expect(municipality).to.be.an.instanceof(Municipality);
        expect(municipality.x).to.equal(0);
        expect(municipality.y).to.equal(0);
      });
      it('can return a player by name', function() {
        var player = state.getPlayerByName('joe');
        expect(player).to.be.instanceof(Player);
        expect(player.name).to.equal('joe');
      });
      it('can return units by location', function() {
        var units = state.getUnitsAt(1, 4);
        expect(units.length).to.equal(1);
        expect(units[0].id).to.equal('dude');
      });
      it('can return a unit by id', function() {
        var unit = state.getUnitById('dude');
        expect(unit).to.be.an.instanceof(Unit);
        expect(unit.id).to.equal('dude');
      });
      it('can return buildings by location', function() {
        var building = state.getBuildingAt(1, 3);
        expect(building).to.be.an.instanceof(Building);
        expect(building.type).to.equal('farm');
      });
      it('can return orders by id', function() {
        var order = state.getOrderById('someorder');
        expect(order).to.be.an.instanceof(MovementOrder);
        expect(order.id).to.equal('someorder');
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
          units: [{id: 'dude1', type: 'dude', owner: 'jwall', location: '0,0', power: 10, group: null}],
          buildings: [{id: 'myfarm', type: 'farm', location: '0,0', productionLevels: null,
                       storage: [{quantity: 100, blueprint: 'lumber'}]}],
          orders: [{id: 'someorder', type:'MovementOrder', unit: 'dude1', destination: '0,0', path: ['0,0']}],
        });
      });
      it('doesn\'t resolve anything yet', function() {
        expect(state).to.be.an.instanceof(GameState);
        expect(state.players[0]).to.be.an.instanceof(Player);
        expect(state.players[0].liege).to.equal('jwall');
        expect(state.municipalities[0]).to.be.an.instanceof(Municipality);
        expect(state.municipalities[0].owner).to.equal('applmak');
        expect(state.units[0]).to.be.an.instanceof(Unit);
        expect(state.units[0].owner).to.equal('jwall');
        expect(state.buildings[0]).to.be.an.instanceof(Building);
        expect(state.buildings[0].type).to.equal('farm');
        expect(state.orders[0]).to.be.an.instanceof(MovementOrder);
        expect(state.orders[0].unit).to.equal('dude1');
      });
      it('resolves everything', function() {
        state.finishDeserialize(null, testRules);
        expect(state.players[0].liege).to.be.an.instanceof(Player);
        expect(state.players[0].liege.name).to.equal('jwall');
        expect(state.municipalities[0].owner).to.be.an.instanceof(Player);
        expect(state.municipalities[0].owner.name).to.equal('applmak');
        expect(state.units[0].owner).to.be.an.instanceof(Player);
        expect(state.units[0].owner.name).to.equal('jwall');
        expect(state.units[0].type).to.be.an.instanceof(UnitBlueprint);
        expect(state.units[0].type.name).to.equal('Dude');
        expect(state.buildings[0].type).to.be.an.instanceof(BuildingBlueprint);
        expect(state.buildings[0].type.id).to.equal('farm');
        expect(state.orders[0].unit).to.be.an.instanceof(Unit);
      });
    });
  });
});

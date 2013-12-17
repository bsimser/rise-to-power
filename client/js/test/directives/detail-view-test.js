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
  var angular = require('test/angular-mocks');
  var Terrain = require('rtp/terrain');
  var Square = require('rtp/square');
  var FakeGameStateGenerator = require('rtp/fake-game-state-generator');
  require('rtp/directives/detail-view');
  require('partials/detail-view.html');
  
  describe('detail-view directive', function() {
    var element, scope;
    beforeEach(module('rtp'));
    beforeEach(module('partials/detail-view.html'));
    beforeEach(inject(function($compile, $rootScope) {
      scope = $rootScope;
      scope.state = FakeGameStateGenerator('rtp-debug');
      element = $compile('<detail-view></detail-view>')($rootScope);
      scope.$digest();
    }));

    it('displays the x,y of the selection', function() {
      scope.$apply(function() {
        scope.state.setSquareProperties(31, 42, {terrain: Terrain.FIELD});
        scope.selected.object = scope.state.getSquareAt(31, 42);
      });

      var info = $(element).find('.info');
      expect(info.text()).to.contain('Fields');
      expect(info.text()).to.contain('31');
      expect(info.text()).to.contain('42');
      expect(info.text()).to.contain('Unowned');
    });
    
    it('displays the owner of the selection', function() {
      scope.$apply(function() {
        scope.selected.object = scope.state.getSquareAt(5, 17);
        scope.state.setMunicipalityProperties(5, 17, {owner: 'applmak'});
      });
      
      var info = $(element).find('.info');
      expect(info.text()).to.contain('applmak');
    });
    
    it('displays the currently selected unit', function() {
      scope.$apply(function() {
        var unit = scope.state.units[0];
        scope.selected.object = scope.state.getSquareAt(unit.location.x, unit.location.y);
      });
      
      var info = $(element).find('.info');
      expect(info.text()).to.contain('1 Unit');
    });
    
    it('displays the currently selected building', function() {
      scope.$apply(function() {
        var building = scope.state.buildings[0];
        scope.selected.object = scope.state.getSquareAt(building.location.x, building.location.y);
      });
      
      var info = $(element).find('.info');
      expect(info.text()).to.contain('Farm');
    });
    
    it('displays the image associated with the selection', function() {
      scope.$apply(function() {
        scope.selected.object = scope.state.getSquareAt(5, 17);
      });
      
      var info = $(element).find('img.icon');
      expect(info.attr('src')).to.equal('images/terrain/field.png');
    });
  });
});

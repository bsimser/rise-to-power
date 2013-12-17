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
  require('rtp/directives/order-view');
  require('partials/order-view.html');
  
  describe('order-view directive', function() {
    var element, scope;
    beforeEach(module('rtp'));
    beforeEach(module('partials/order-view.html'));
    beforeEach(inject(function($compile, $rootScope) {
      scope = $rootScope;
      scope.state = FakeGameStateGenerator('rtp-debug');
      element = $compile('<order-view></order-view>')($rootScope);
      scope.$digest();
    }));

    it('displays an <li> for each order', function() {
      expect(scope.state.orders.length).to.equal(element.find('li').length);
    });
    
    it('displays the name of the order', function() {
      var someOrder = scope.state.orders[0];
      var orderElement = element.find('li')[0];
      expect($(orderElement).text()).to.contain(someOrder.name);
    });

    it('displays the destination of the movement order', function() {
      var someOrder = scope.state.orders[0];
      var orderElement = element.find('li')[0];
      expect($(orderElement).text()).to.contain(someOrder.destination.x);
      expect($(orderElement).text()).to.contain(someOrder.destination.y);
    });
  });
});

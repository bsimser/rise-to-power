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
  require('rtp/directives/map');
  
  describe('map directive', function() {
    var element;  
    beforeEach(module('rtp'));
    beforeEach(inject(function($compile, $rootScope) {
      var link = $compile('<map style="width: 100px; height: 400px"></map>');
      element = link($rootScope);
    }));
  
    it('sets the width and height properties of the canvas', function() {
      var canvas = element.find('canvas');
      expect(canvas.prop('width')).to.equal(100);
      expect(canvas.prop('height')).to.equal(400);
    });
  });
  
  describe('map directive controller', function() {
    var mapController;
    beforeEach(module('rtp'));
    beforeEach(inject(function($rootScope, $controller, ResizeObserver) {
      // Note: width, height chosen to be 2 x square size
      var element = $('<div style="width:140px;height:96px"><canvas width="140" height="96"></canvas></div>');
      ResizeObserver.reset();
      mapController = $controller(
          'MapController', {$scope: $rootScope, $element: element, $attrs:{},
                            ResizeObserver: ResizeObserver});
      // Disable drawing in unit tests.
      sinon.stub(mapController.constructor.prototype, 'draw');
    }));
    afterEach(function() {
      mapController.constructor.prototype.draw.restore();
    });
    
    it('calculates the right visible squares', function() {
      var visibleSquares = mapController.getVisibleSquares();
      // Because 0,0 on screen is the left corner of the 0,0 map tile (with no
      // translation), we expect to see three tiles in the first row,
      // four in the next offset row,
      // three in the next real row,
      // four in the next offset row,
      // three in the last real row.
      // and finally four in the last real row.
      expect(visibleSquares).to.deep.equal([
        0, 0, 1, 1, 2, 2,
        0, -1, 1, 0, 2, 1, 3, 2,
        1, -1, 2, 0, 3, 1,
        1, -2, 2, -1, 3, 0, 4, 1,
        2, -2, 3, -1, 4, 0,
        2, -3, 3, -2, 4, -1, 5, 0
      ]);
    });
    
    it('calculates the right visible squares when translated', function() {
      // Shift by +2 in the map x:
      mapController.translation.x = 70;
      mapController.translation.y = 48;
      
      var visibleSquares = mapController.getVisibleSquares();
      expect(visibleSquares).to.deep.equal([
        2, 0, 3, 1, 4, 2,
        2, -1, 3, 0, 4, 1, 5, 2,
        3, -1, 4, 0, 5, 1,
        3, -2, 4, -1, 5, 0, 6, 1,
        4, -2, 5, -1, 6, 0,
        4, -3, 5, -2, 6, -1, 7, 0
      ]);
    });
    
    it('listens for resize events', function() {
      sinon.stub(mapController, 'adjustCanvasSize');
      $(window).trigger('resize');
      expect(mapController.adjustCanvasSize).to.be.calledOnce;
    });
  });
});

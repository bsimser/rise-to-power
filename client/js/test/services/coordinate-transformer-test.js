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
  require('rtp/services/coordinate-transformer');
  var Point = require('rtp/point');
  
  describe('CoordinateTransformer', function() {
    var CoordinateTransformer;
    beforeEach(module('rtp'));
    beforeEach(inject(function(_CoordinateTransformer_) {
      CoordinateTransformer = _CoordinateTransformer_;
    }));
    
    it('transforms pixel origin -> map origin', function() {
      var mapCoord = CoordinateTransformer.pixelToMap(0, 0, new Point);
      expect(mapCoord).to.deep.equal({x: 0, y: 0});
    });

    it('transforms pixel @ bottom-corner of origin tile -> map @ (1, 0)', function() {
      var mapCoord = CoordinateTransformer.pixelToMap(35, 24, new Point);
      expect(mapCoord).to.deep.equal({x: 1, y: 0});
    });

    it('transforms pixel @ right-corner of origin tile -> map @ (1, 1)', function() {
      var mapCoord = CoordinateTransformer.pixelToMap(70, 0, new Point);
      expect(mapCoord).to.deep.equal({x: 1, y: 1});
    });
    
    it('transforms pixel @ top-corner of origin tile -> map @ (0, 1)', function() {
      var mapCoord = CoordinateTransformer.pixelToMap(35, -24, new Point);
      expect(mapCoord).to.deep.equal({x: 0, y: 1});
    });
    
    it('transforms pixel in middle of origin tile -> map @ (0.5, 0.5)', function() {
      var mapCoord = CoordinateTransformer.pixelToMap(35, 0, new Point);
      expect(mapCoord).to.deep.equal({x: 0.5, y: 0.5});
    });
    
    it('transforms pixel @ (245, 0) -> map @ (3.5, 3.5)', function() {
      var mapCoord = CoordinateTransformer.pixelToMap(245, 0, new Point);
      expect(mapCoord).to.deep.equal({x: 3.5, y: 3.5});
    });
    
    it('transforms pixel in middle of origin tile -> int map @ (0, 0)', function() {
      var mapCoord = CoordinateTransformer.pixelToIntMap(35, 0, new Point);
      expect(mapCoord).to.deep.equal({x: 0, y: 0});
    });
    
    it('transforms map origin -> pixel origin', function() {
      var pixelCoord = CoordinateTransformer.mapToPixel(0, 0, new Point);
      expect(pixelCoord).to.deep.equal({x: 0, y: 0});
    });
    
    it('transforms map @ (1, 0) -> pixel @ (35, 24)', function() {
      var pixelCoord = CoordinateTransformer.mapToPixel(1, 0, new Point);
      expect(pixelCoord).to.deep.equal({x: 35, y: 24});      
    });
    
    it('transforms map @ (0, 0) -> image origin @ (0, -24)', function() {
      var pixelCoord = CoordinateTransformer.mapToImageOrigin(0, 0, new Point);
      expect(pixelCoord).to.deep.equal({x: 0, y: -24});
    });
  });
});

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
  
  var element;
  
  beforeEach(module('rtp'));
  beforeEach(inject(function($compile, $rootScope) {
    var link = $compile('<map style="width: 100px; height: 400px"></map>');
    element = link($rootScope);
  }));
  
  describe('map directive', function() {
    it('sets the width and height properties of the canvas', function() {
      var canvas = element.find('canvas');
      expect(canvas.prop('width')).to.equal(100);
      expect(canvas.prop('height')).to.equal(400);
    });
  });
});

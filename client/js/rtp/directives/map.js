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
	var rtp = require('rtp/ui-module');
  rtp.directive('map', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div><canvas></canvas></div>',
      controller: 'MapController',
    };
  });
  
  var MapController = function($scope, $element, $attrs) {
    console.log('MapController loaded');
    
    // Step 1: Measure the size of the canvas in the $element, and set the 
    // canvas width/height to that number.
    this.width = $element.width();
    this.height = $element.height();
    
    this.canvas = $element.find('canvas');
    this.context = this.canvas[0].getContext('2d');
    if (!this.context) {
      console.error('NO CANVAS CONTEXT');
    }
    
    this.canvas.prop('width', this.width);
    this.canvas.prop('height', this.height);
  };
  
  rtp.controller('MapController', MapController);
});

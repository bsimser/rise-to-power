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
  var Point = require('rtp/point');
  require('rtp/services/image-downloader');
  
  rtp.directive('map', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div><canvas></canvas></div>',
      controller: 'MapController',
    };
  });
  
  var MapController = function($scope, $element, $attrs, ImageDownloader, $timeout) {
    console.log('MapController loaded');
    this.images = ImageDownloader;
    this.timeout = $timeout;
    
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
    
    this.load();
  };
  MapController.prototype.load = function() {
    // perform standard initialization tasks... show a loading bar until they 
    // are finished.
    var imagesToDownload = IMAGES.length;
    var loadingBar = new LoadingBar(imagesToDownload, this.width, this.height, this.context);
    loadingBar.draw();
    
    var mapController = this;
    this.images.download(IMAGES).then(function() {
      console.log('DONE LOADING IMAGES!');
      loadingBar.finish();
      loadingBar.draw();
      mapController.timeout(mapController.draw.bind(mapController), 0);
    }, function(error) {
      console.error('ERROR LOADING IMAGES!');
    }, function() {
      console.log('redraw');
      // an image was downloaded!
      loadingBar.advance();
      loadingBar.draw();
    });
  };
  MapController.prototype.draw = function() {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);
    console.log('Map draw');
  };
  rtp.controller('MapController', MapController);
  
  
  var LoadingBar = function(max, width, height, context) {
    this.progress = 0;
    this.max = max;
    this.width = width;
    this.height = height;
    this.context = context;
  };
  LoadingBar.prototype.advance = function() {
    console.assert(this.progress < this.max, 'LoadingBar advanced too far!');
    this.progress++;
  };
  LoadingBar.prototype.finish = function() {
    this.progress = this.max;
  };
  LoadingBar.prototype.draw = function() {
    var c = this.context;
    c.save();
    c.fillStyle = 'black';
    c.fillRect(0, 0, this.width, this.height);
    
    // The Loading Bar should be about 80% of the width of the context:
    var loadingBarWidth = Math.floor(0.8 * this.width);
    var loadingBarHeight = 20;
    
    var ul = new Point(Math.floor(this.width / 2 - loadingBarWidth / 2),
                       Math.floor(this.height / 2 - loadingBarHeight / 2));
    
    c.strokeStyle = 'white';
    c.strokeRect(ul.x, ul.y, loadingBarWidth, loadingBarHeight);
    
    ul.x += 2;
    ul.y += 2;
    
    var progressWidth = Math.ceil((loadingBarWidth - 4) * this.progress / this.max);
    
    c.fillStyle = 'yellow';
    c.fillRect(ul.x, ul.y, progressWidth, loadingBarHeight - 4);
    
    c.restore();
  };
  
  var IMAGES = [
    "buildings/barracks-1.png",
    "buildings/construction.png",
    "buildings/courthouse-1.png",
    "buildings/extractor.png",
    "buildings/farm.png",
    "buildings/refinery-1.png",
    "terrain/field.png",
    "terrain/forest.png",
    "terrain/sea.png",
  ];
});

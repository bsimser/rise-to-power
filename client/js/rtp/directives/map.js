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
  var LoadingBar = require('rtp/loading-bar');
  require('rtp/services/image-downloader');
  require('rtp/services/coordinate-transformer');
  require('rtp/services/resize-observer');
  
  rtp.directive('map', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div><canvas></canvas></div>',
      controller: 'MapController',
    };
  });
  
  var MapController = function($scope, $element, $attrs, ImageDownloader,
                               CoordinateTransformer, ResizeObserver, $timeout) {
    console.log('MapController loaded');
    this.images = ImageDownloader;
    this.timeout = $timeout;
    this.coordinateTransformer = CoordinateTransformer;
    
    // The current translation of the map. Dragging moves the map around.
    this.translation = new Point(0, 0);
    
    this.container = $element;
    this.canvas = $element.find('canvas');
    this.context = this.canvas[0].getContext('2d');
    
    if (!this.context) {
      console.error('NO CANVAS CONTEXT');
    }
  
    this.adjustCanvasSize();
    var mapController = this;
    ResizeObserver(function() {
      mapController.adjustCanvasSize();
      mapController.redraw(true);
    });
    
    this.load();
  };
  MapController.prototype.adjustCanvasSize = function() {
    this.width = this.container.width();
    this.height = this.container.height();
  
    this.canvas.prop('width', this.width);
    this.canvas.prop('height', this.height);
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
      mapController.redraw();
    }, function(error) {
      console.error('ERROR LOADING IMAGES!');
    }, function() {
      // an image was downloaded!
      loadingBar.advance();
      loadingBar.draw();
    });
  };
  
  // The standard way to schedule drawing to occur.
  // @param {boolean} rightNow When true, draw on THIS frame. When false, draw
  //     on the NEXT frame.
  MapController.prototype.redraw = function(rightNow) {
    if (rightNow) {
      this.draw();
    } else {
      this.timeout(this.draw.bind(this), 0);
    }
  };
  MapController.prototype.draw = function() {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);
    console.log('Map draw');
    
    var visibleSquares = this.getVisibleSquares();
    // TODO(applmak): Implement a real renderer.
    this.context.fillStyle = 'white';
    var offset = new Point;
    for (var i = 0; i < visibleSquares.length; i += 2) {
      var mapX = visibleSquares[i], mapY = visibleSquares[i+1];
      
      this.coordinateTransformer.mapToImageOrigin(mapX, mapY, offset);
      this.context.drawImage(this.images.get('terrain/field.png'), offset.x, offset.y);
    }
  };
  // Returns a list of visible square coordinates in [x1, y1, x2, y2, ...] form.
  // @returns Array of numbers.
  MapController.prototype.getVisibleSquares = function() {
    var visibleSquares = [];
    var ul = new Point, dl = new Point,
        ur = new Point, dr = new Point;
    this.coordinateTransformer.pixelToIntMap(this.translation.x, this.translation.y, ul);
    this.coordinateTransformer.pixelToIntMap(this.translation.x, this.translation.y + this.height, dl);
    this.coordinateTransformer.pixelToIntMap(this.translation.x + this.width, this.translation.y, ur);
    this.coordinateTransformer.pixelToIntMap(this.translation.x + this.width, this.translation.y + this.height, dr);
    
    // Now, generate the list of visible squares in order.
    // The order is top-to-bottom, left-to-right:
    // 1 2 3 4 5
    //6 7 8 9 0
    // 1 2 3 4 5
    // but this is hard because of the isometric grid.
    
    // Since +x is se and +y is ne, the length of the line ul<->ur is:
    //  Math.abs(ur.x + 1 - ul.x)
    var mapWidth = Math.abs(ur.x + 1 - ul.x);
    // Also, the length of the line ul<->dl is:
    //  Math.abs(dl.x + 1 - ul.x)
    var mapHeight = Math.abs(dl.x + 1 - ul.x);
    
    for (var j = 0; j < mapHeight; ++j) {
      for (var i = 0; i < mapWidth; ++i) {
        visibleSquares.push(i + ul.x + j, i + ul.y - j);
      }
      for (var i = -1; i < mapWidth; ++i) {
        visibleSquares.push(1 + i + ul.x + j, i + ul.y - j);
      }
    }
    
    return visibleSquares;
  };
  rtp.controller('MapController', MapController);
  
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

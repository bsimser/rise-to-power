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
  var Square = require('rtp/square');
  
  require('rtp/services/image-downloader');
  require('rtp/services/coordinate-transformer');
  require('rtp/services/resize-observer');
  require('rtp/services/drag-handler');
  
  rtp.directive('map', function() {
    return {
      scope: {
        state: '=',
        hoverSquare: '=hover',
        selected: '=',
      },
      restrict: 'E',
      replace: true,
      template: '<div><canvas></canvas></div>',
      controller: 'MapController',
    };
  });
  
  var MapController = function($scope, $element, $attrs, ImageDownloader,
                               CoordinateTransformer, ResizeObserver, DragHandler,
                               $timeout) {
    console.log('MapController loaded');
    this.images = ImageDownloader;
    this.timeout = $timeout;
    this.coordinateTransformer = CoordinateTransformer;
    this.scope = $scope;
    
    // The current translation of the map. Dragging moves the map around.
    this.translation = new Point(0, 0);
    
    this.container = $element;
    this.canvas = $element.find('canvas');
    this.context = this.canvas[0].getContext('2d');
    
    if (!this.context) {
      console.error('NO CANVAS CONTEXT');
    }
  
    this.adjustCanvasSize();
    this.loadingComplete = false;
    
    var mapController = this;
    ResizeObserver(function() {
      mapController.adjustCanvasSize();
      if (mapController.loadingComplete) {
        mapController.redraw(true);
      }
    });
    
    DragHandler(this.container, this);
        
    this.scope.hoverSquare = new Point(0, 0);
    this.container.on('mousemove', function(e) {
      // Publish the hover square coordinate on the $scope as hoverSquare
      $scope.$apply(function() {
        CoordinateTransformer.pixelToIntMap(e.offsetX + mapController.translation.x,
                                            e.offsetY + mapController.translation.y,
                                            $scope.hoverSquare);
      });
    });
    this.scope.$watch('selected', function(center) {
      if (center) {
        // check to see if this square is near enough the middle of the map.
        var location = CoordinateTransformer.mapToPixel(center.x, center.y, new Point);
        var x = location.x - mapController.translation.x;
        var y = location.y - mapController.translation.y;
        if (!(x > 100 && x <= mapController.width - 100 &&
              y > 100 && y <= mapController.height - 100)) {
          // We need to scroll. Calculate ideal translation:
          mapController.translation.x = Math.floor(location.x - mapController.width / 2);
          mapController.translation.y = Math.floor(location.y - mapController.height / 2);
        }
        $scope.selected = $scope.state.getSquareAt(center.x, center.y);
        
        mapController.redraw(true);
      }
    }, true);
    
    this.scope.selected = null;

    this.load();
  };
  MapController.prototype.mouseDown = function(e) {
    this.startDragX = this.currentDragX = e.offsetX;
    this.startDragY = this.currentDragY = e.offsetY;
  };
  MapController.prototype.mouseDrag = function(e) {
    this.translation.x -= (e.offsetX - this.currentDragX);
    this.translation.y -= (e.offsetY - this.currentDragY);
    this.currentDragX = e.offsetX;
    this.currentDragY = e.offsetY;
    this.redraw(true);
  };
  MapController.prototype.mouseUp = function(e) {
    if (Math.abs(e.offsetX - this.startDragX) < 5 && 
        Math.abs(e.offsetY - this.startDragY) < 5) {
      // treat this as a selection click.
      var lastClickSquare = this.coordinateTransformer.pixelToIntMap(
          this.startDragX + this.translation.x, this.startDragY + this.translation.y,
          new Point);
      var scope = this.scope;
      var mapController = this;
      this.scope.$apply(function() {
        scope.selected = scope.state.getSquareAt(lastClickSquare.x, lastClickSquare.y);
        mapController.redraw(true);
      });
    }
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
    var loadingBar = new LoadingBar(imagesToDownload + 1, this.width, this.height, this.context);
    loadingBar.draw();
    
    var mapController = this;
    
    // In order to avoid drawing the map until both loaders are finished, we use
    // this variable to denote how many more loading tasks need to finish before
    // we draw.
    var loadingThingsToFinish = 2;
    this.images.download(IMAGES).then(function() {
      if (--loadingThingsToFinish == 0) {
        mapController.loadingComplete = true;
        mapController.redraw();
      }
    }, function(error) {
      console.error('ERROR LOADING IMAGES!');
    }, function() {
      // an image was downloaded!
      loadingBar.advance();
      loadingBar.draw();
    });
    
    this.scope.$watch('state', function(state) {
      if (state) {
        console.log('state loaded!');
        if (--loadingThingsToFinish == 0) {
          mapController.loadingComplete = true;
          mapController.redraw();
        }
      }
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
    // ASSERT: There is a state on the scope.
    
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);
    console.log('Map draw');
    
    var visibleSquares = this.getVisibleSquares();
    // TODO(applmak): Implement a real renderer.
    this.context.fillStyle = 'white';
    var offset = new Point;
    for (var i = 0; i < visibleSquares.length; i += 2) {
      var mapX = visibleSquares[i], mapY = visibleSquares[i+1];
      
      var square = this.scope.state.getSquareAt(mapX, mapY);
      this.coordinateTransformer.mapToImageOrigin(mapX, mapY, offset);

      if (square) {
    		this.drawSquare(square, offset);
      }
    }
    
    // Draw owned municipality boundaries.
    // TODO(applmak): This isn't exactly elegant.
    var drawnMunicipalities = {};
    var offset2 = new Point, offset3 = new Point, offset4 = new Point;
    for (var i = 0; i < visibleSquares.length; i += 2) {
      var mx = Math.floor(visibleSquares[i] / 17) * 17,
          my = Math.floor(visibleSquares[i+1] / 17) * 17;
      var key = mx + ',' + my;
      if (drawnMunicipalities[key]) {
        continue;
      }
      
      var municipality = this.scope.state.getMunicipalityByKey(key) || {};

      this.coordinateTransformer.mapToPixel(mx, my, offset);
      this.coordinateTransformer.mapToPixel(mx + 17, my, offset2);
      this.coordinateTransformer.mapToPixel(mx + 17, my + 17, offset3);
      this.coordinateTransformer.mapToPixel(mx, my + 17, offset4);
      
      this.context.strokeStyle = municipality.owner ? 'orange' : '#333';
      this.context.lineWidth = 1;
      this.context.beginPath();
      this.context.moveTo(offset.x - this.translation.x + 1, offset.y - this.translation.y);
      this.context.lineTo(offset2.x - this.translation.x, offset2.y - this.translation.y - 1);
      this.context.lineTo(offset3.x - this.translation.x - 1, offset3.y - this.translation.y);
      this.context.lineTo(offset4.x - this.translation.x, offset4.y - this.translation.y + 1);
      this.context.closePath();
      this.context.stroke();
    }
    
    // On top of the most everything and the borders, but beneath the 
    // highlight, draw the units.
    for (var i = 0; i < visibleSquares.length; i += 2) {
      var x = visibleSquares[i],
          y = visibleSquares[i+1]; //1 5 9 16 19 24
      var units = this.scope.state.getUnitsAt(x, y);
      // TODO(applmak): These will need to be sorted.
      this.coordinateTransformer.mapToImageOrigin(x, y, offset);
      units.forEach(function(unit) {
        var image = this.images.get(unit.type.image);
        this.context.drawImage(image, offset.x - this.translation.x,
                               offset.y - this.translation.y);
      }, this);
    }
    
    // Draw the highlight
    if (this.scope.selected) {
      this.coordinateTransformer.mapToImageOrigin(this.scope.selected.x,
                                                  this.scope.selected.y,
                                                  offset);
                                                  
      this.context.strokeStyle = 'yellow';
      this.context.strokeRect(offset.x - this.translation.x - 1, offset.y - this.translation.y - 1,
                              70 + 2, 48 + 2);
    }
  };
  MapController.prototype.drawSquare = function(square, offset) {
    var neighbors = this.scope.state.getNeighborsOfSquareAt(square.x, square.y, {});
    
    var image = this.images.get(square.terrain.image);
    this.context.drawImage(image,
                           offset.x - this.translation.x,
                           offset.y - this.translation.y);

    // Draw beaches.
    if (square.terrain.isWet) {
      for (var dir in neighbors) {
        if (neighbors[dir]) {
          if (!neighbors[dir].terrain.isWet) {
            var image = this.images.get('terrain/shore-' + dir + '.png');
            this.context.drawImage(image, offset.x - this.translation.x,
                                   offset.y - this.translation.y);
          }
        }
      }
    }
    
    // Draw buildings
    var building = this.scope.state.getBuildingAt(square.x, square.y);
    if (building) {
      var image = this.images.get(building.type.image);
      this.context.drawImage(image, offset.x - this.translation.x,
                                    offset.y - this.translation.y);
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
    
    // Also also, we need to iterate from -1,-1 to mapWidth, mapHeight due to 
    // literal edge cases.
    
    for (var j = -1; j <= mapHeight; ++j) {
      for (var i = -1; i <= mapWidth; ++i) {
        visibleSquares.push(i + ul.x + j, i + ul.y - j);
      }
      for (var i = -1; i <= mapWidth; ++i) {
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
    "terrain/shore-d.png",
    "terrain/shore-dl.png",
    "terrain/shore-dr.png",
    "terrain/shore-l.png",
    "terrain/shore-r.png",
    "terrain/shore-u.png",
    "terrain/shore-ul.png",
    "terrain/shore-ur.png",
    "units/dude.png",
  ];
});

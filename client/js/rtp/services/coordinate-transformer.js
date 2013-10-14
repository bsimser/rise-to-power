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
  
  var CELL_WIDTH = 70;
  var CELL_HEIGHT = 48;
  var HALF_CELL_WIDTH = CELL_WIDTH / 2;
  var HALF_CELL_HEIGHT = CELL_HEIGHT / 2;
  
  // The coodinate transformer contains all the logic for transforming
  // coordinates between the map and the screen.
  var CoordinateTransformer = {
    // Converts a js event's offset (say, from a mouse-up), and returns a map
    // coordinate as a Point. Note that we take a param to avoid creating
    // unnecessary temporaries as we are working (as we expect this function
    // to be called A LOT).
    // @param {Event} event
    // @param {Point} outPoint, an out param (same as the return value).
    // @returns {Point} the outPoint.
    eventToMap: function(event, outPoint) {
      return CoordinateTransformer.pixelToMap(event.offsetX, event.offsetY, outPoint);
    },

    // Converts a passed-in x, y in pixel coordinates to a map coordinate.
    // @param {number} x
    // @param {number} y
    // @param {Point} outPoint, an out param (same as the return value).
    // @returns {Point} the outPoint.
    pixelToMap: function(x, y, outPoint) {
      outPoint.x = x / CELL_WIDTH + y / CELL_HEIGHT;
      outPoint.y = x / CELL_WIDTH - y / CELL_HEIGHT;
      return outPoint;
    },

    // Converts a passed-in x, y, in pixel coordinates to an integer map 
    // coordinate.
    pixelToIntMap: function(x, y, outPoint) {
      CoordinateTransformer.pixelToMap(x, y, outPoint);
      outPoint.x = Math.floor(outPoint.x);
      outPoint.y = Math.floor(outPoint.y);
      return outPoint;
    },

    // Converts a passed-in map coordinate to the pixel coordinate of its 
    // left corner. Note that we always return whole pixel coordinates.
    // @param {number} x
    // @param {number} y
    // @param {Point} outPoint, an out param (same as the return value).
    // @returns {Point} the outPoint.
    mapToPixel: function(x, y, outPoint) {
      outPoint.x = Math.floor((x + y) * HALF_CELL_WIDTH);
      outPoint.y = Math.floor((x - y) * HALF_CELL_HEIGHT);
      return outPoint;
    },

    // Converts a map-coordinate to the top-left corner of the image that
    // represents a map square.
    mapToImageOrigin: function(x, y, outPoint) {
      CoordinateTransformer.mapToPixel(x, y, outPoint);
      outPoint.y -= HALF_CELL_HEIGHT;
      return outPoint;
    }
  };

  rtp.value('CoordinateTransformer', CoordinateTransformer);
});

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
  
  // The DragHandler service takes an element and a dictionary of callbacks,
  // and manages the complexities of dragging in JS.
  rtp.factory('DragHandler', function($window) {
    function fixupLocation(event, element) {
      var pos = $(element).position();
      event.offsetX = event.pageX - pos.left;
      event.offsetY = event.pageY - pos.top;
    }
    
    var currentTarget = null;
    var currentHandler = null;
    // We capture mousemove and mouseup on the window to meet user expectations
    // that a held-down mouse button continues to be able to drag the target,
    // say, a slider, even if the mouse button is not within the rectangle of
    // the target. The mousedown event is on the target, as expected.
    $($window).on('mousemove', function(e) {
      if (currentTarget) {
        if (currentHandler.mouseDrag) {
          fixupLocation(e, currentTarget);
          e.preventDefault();
          currentHandler.mouseDrag(e);
        }
      }
    });
    $($window).on('mouseup', function(e) {
      if (currentTarget) {
        if (currentHandler.mouseUp) {
          fixupLocation(e, currentTarget);
          e.preventDefault();
          currentHandler.mouseUp(e);
        }
        currentTarget = null;
        currentHandler = null;
      }
    });
    return function(element, handlerDict) {
      return $(element).on('mousedown', function(e) {
        currentTarget = element;
        currentHandler = handlerDict;
        if (currentHandler.mouseDown) {
          fixupLocation(e, currentTarget);
          e.preventDefault();
          currentHandler.mouseDown(e);
        }
      });
    };
  });
});

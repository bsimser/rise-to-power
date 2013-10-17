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
  var $ = require('jquery');
  var rtp = require('rtp/ui-module');
  
  rtp.factory('ResizeObserver', function($window) {
    var observers = [];
    
    $($window).on('resize', function() {
      observers.forEach(function(o) {
        o();
      });
    });
    
    var ResizeObserver = function(callback) {
      observers.push(callback);
    };
    // Only for testing, really, but resets the callback list back to empty.
    ResizeObserver.reset = function() {
      observers.length = 0;
    };
    
    return ResizeObserver;
  });
});

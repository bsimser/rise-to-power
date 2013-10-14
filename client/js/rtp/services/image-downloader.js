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
  
  var IMAGES_DIR = '/images/';

  // Exists for mocking purposes (as we can't really use Image in a unit test)
  rtp.factory('SingleImageDownloader', function() {
    return function(path, successCallback, failureCallback) {
      var i = new Image();
      i.src = path;
      i.onload = successCallback;
      i.onerror = failureCallback;
      return i;
    };
  });
  
  rtp.factory('ImageDownloader', function($q, SingleImageDownloader) {
    var cachedImages = {};
    return {
      download: function(images) {
        var deferred = $q.defer();
        var imagesThatNeedDownload = images.filter(function(i) {
          return !(i in cachedImages);
        });
        var imagesLeft = imagesThatNeedDownload.length;
      
        if (imagesLeft == 0) {
          deferred.resolve();
        } else {
          imagesThatNeedDownload.forEach(function(image) {
            var imageTag = SingleImageDownloader(IMAGES_DIR + image, function() {
              deferred.notify(image);
              cachedImages[image] = imageTag;
              if (--imagesLeft == 0) {
                deferred.resolve();
              }
            }, function() {
              deferred.reject(image);
            });
          });
        }
        return deferred.promise;
      },
      get: function(image) {
        return cachedImages[image];
      }
    };
  });
});

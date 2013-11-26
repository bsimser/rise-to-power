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
  rtp.directive('detailView', function() {
    return {
      scope: false,
      restrict: 'E',
      replace: true,
      templateUrl: 'partials/detail-view.html',
      controller: 'DetailViewController',
    };
  });
  
  var DetailViewController = function($scope, $element) {
    console.log('detail-view controller');
    
    // Returns the type of the given object as a string.
    // TODO(applmak): There are elegant ways of doing this. Use one of them.
    $scope.getType = function(selectedThing) {
      if (selectedThing) {
        return "Square";
      }
      return "undefined";
    };
    
    // Returns the owner of a thing or undefined if there is no owner.
    // @return {Player} the owning player.
    $scope.getOwner = function(selectedThing) {
      if (selectedThing) {
        var m = $scope.state.getMunicipalityAt(selectedThing.x, selectedThing.y);
        return m.owner;
      }
    };
    
    // Returns an image to display for the selected thing.
    $scope.getImage = function(selectedThing) {
      if (selectedThing) {
        // Square!
        return 'images/' + selectedThing.terrain.image;
      }
    };
  };
  
  rtp.controller('DetailViewController', DetailViewController);
});

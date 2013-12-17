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
  var Square = require('rtp/square');
  
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
    
    $scope.$watch('selected.object', function(selected) {
      if (selected) {
        $scope.selected.units = $scope.state.getUnitsAt(selected.x, selected.y);
        $scope.selected.building = $scope.state.getBuildingAt(selected.x, selected.y);
        $scope.selected.square = selected;
        
        if ($scope.selected.units.length) {
          $scope.selected.type = 'Units';
        } else if ($scope.selected.building) {
          $scope.selected.type = 'Building';
        } else {
          $scope.selected.type = 'Square';
        }
      } else {
        $scope.selected.units = [];
        $scope.selected.buildings = undefined;
        $scope.selected.square = undefined;
        $scope.selected.type = 'Nothing';
      }
    });
  };
  
  rtp.controller('DetailViewController', DetailViewController);
});

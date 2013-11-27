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
    
    $scope.$watch('selected', function(selected) {
      if (selected) {
        $scope.selectedUnits = $scope.state.getUnitsAt(selected.x, selected.y);
        $scope.selectedSquare = selected;
        
        if ($scope.selectedUnits.length) {
          $scope.detail.selection = 'Units';
        } else {
          $scope.detail.selection = 'Square';
        }
      } else {
        $scope.selectedUnits = [];
        $scope.selectedSquare = undefined;
        $scope.detail.selection = 'Nothing';
      }
    });
  };
  
  rtp.controller('DetailViewController', DetailViewController);
});

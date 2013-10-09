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
  rtp.controller('LoginPageController', function($scope, $location, $http) {
    console.log('LoginPageController inited');
    $scope.login = function() {
      $http.post('/_api/login', $scope.params).then(function() {
        $location.path('/map');
      }, function(error) {
        $scope.error = error.data || error.status || error;
      });
    };
  });
});

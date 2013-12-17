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
  var GameState = require('rtp/game-state');
  var FakeGameStateGenerator = require('rtp/fake-game-state-generator');
  
  rtp.controller('MapPageController', function($scope, $timeout, $location, $http) {
    console.log('MapPageController inited');
    
    $http.get('/_api/backendAddress').then(function(result) {
      console.log('backend address:', result.data);
      // TODO(applmak): When backend starts talkin' websockets, create the 
      // jsonrpc client here, and stick it somewhere.
      
      // TODO(applmak): Once the server supports it, here's a good place to read
      // the entire game state. For the moment, we'll fake it.
      var state = FakeGameStateGenerator('rtp-debug');
      $timeout(function() {
        $scope.state = state;
      }, 2000);
    }, function(error) {
      console.error('backend error:', error);
      $location.path('/login');
    });
  });
});

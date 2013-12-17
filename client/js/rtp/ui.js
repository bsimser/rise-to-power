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
  var angular = require('angular');
  var rtp = require('rtp/ui-module');
  require('rtp/controllers/map-page');
  require('rtp/controllers/login-page');
  require('rtp/directives/map');
  require('rtp/directives/detail-view');
  require('rtp/directives/order-view');
  
  rtp.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/login', {
      templateUrl: 'login.html',
      controller: 'LoginPageController'
    });
    // /logout has no view, it redirects back to the main page.
    $routeProvider.otherwise({
      templateUrl: 'map.html',
      controller: 'MapPageController'
    });
  });
  rtp.controller('MainController', function() {
    console.log('MainController loaded');
  });
  
  angular.bootstrap($('body')[0], ['rtp']);
});

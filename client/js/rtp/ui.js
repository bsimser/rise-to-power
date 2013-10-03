define(function(require) {
  var $ = require('jquery');
  var rtp = require('rtp/ui-module');
  
  rtp.config(function($routeProvider) {
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

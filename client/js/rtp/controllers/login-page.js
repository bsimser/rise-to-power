define(function(require) {
  var rtp = require('rtp/ui-module');
  rtp.controller('LoginPageController', function($scope, $location) {
    console.log('LoginPageController inited');
    $scope.returnToMap = function() {
      $location.path('/map');
    };
  });
});
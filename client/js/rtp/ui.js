define(function(require) {
  var $ = require('jquery');
  
  var rtp = angular.module('rtp', []);
  rtp.controller('MainController', function() {
    console.log('MainController loaded');
  });
  
  angular.bootstrap($('body')[0], ['rtp']);
});
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
  
  var Socket = function(address, handler) {
    this.socket = new WebSocket(address);
    this.ready = false;
    this.handler = handler;
    
    var socket = this;
    this.socket.onopen = function() {
      console.debug('open');
      socket.ready = true;
    };
    this.socket.onmessage = function(msg) {
      console.debug('msg:', msg.length);
      this.handler(msg);
    };
  };
  Socket.prototype.sendMessage = function(msg) {
    this.socket.send(msg);
  };
  
  rtp.factory('Socket', function() {
    return Socket; 
  });
});

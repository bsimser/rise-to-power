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
  
  function encodeParams(thing) {
    return thing;
  }
  function decodeParams(thing) {
    return thing;
  }
  
  var JsonRpcSocket = function(Socket, $q, address, handler) {
    this.socket = new Socket(address, this.handleResponse.bind(this));
    this.nextId = 1;
    this.q = $q;
    this.requestHandler = handler;
    this.inflightRequests = {};
  };
  JsonRpcSocket.prototype.sendMessage = function(method, params) {
    var id = this.nextId++;
  
    this.inflightRequests[id] = this.q.defer();
  
    this.socket.sendMessage(JSON.stringify({
      method: method,
      params: encodeParams(params),
      id: id
    }));
    
    return this.inflightRequests[id].promise;
  };
  JsonRpcSocket.prototype.handleResponse = function(msg) {
    try {
      msg = JSON.parse(msg);
    } catch (e) {
      // Handle json errors... don't let exception leak out.
      console.error('received non json message!');
      return;
    }
    
    if (msg.result || msg.error) {
      if (!msg.id) {
        console.error('response contained no id field!');
        return;
      }
      
      // It's an actual response.
      var req = this.inflightRequests[msg.id];
      if (!req) {
        console.error('response to an unknown request!');
        return;
      }
      
      if (msg.error) {
        req.reject(msg.error);
      } else {
        req.resolve(decodeParams(msg.result));
      }
      
      // Clear out the cache.
      this.inflightRequests[msg.id] = null;
    } else {
      // it's a request!
      if (msg.method in this.requestHandler) {
        try {
          var result = this.requestHandler[msg.method].apply(this.requestHandler, decodeParams(msg.params));
          this.socket.sendMessage(JSON.stringify({
            result: result,
            error: null,
            id: msg.id,
          }));
        } catch (e) {
          this.socket.sendMessage(JSON.stringify({
            result: null,
            error: e.message,
            id: msg.id
          }));
        }
      } else {
        console.error('Unsupported method call attempt', msg.method);
      }
    }
  };
  
  
  rtp.factory('JsonRpcSocket', function(Socket, $q) {
    return function(address, handler) {
      return new JsonRpcSocket(Socket, $q, address, handler);
    }; 
  });
});

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
  var chai = require('chai');
  var sinonChai = require('test/sinon-chai');
  chai.use(sinonChai);
  
  var expect = chai.expect;
  var sinon = require('test/sinon');
  var angular = require('test/angular-mocks');
  require('rtp/services/jsonrpc');
  
  describe('JsonRpcSocket', function() {
    var jsonrpc, rootScope, handler;
    beforeEach(function() {
      var rtpTest = angular.module('test', ['rtp']);
      rtpTest.factory('Socket', function() {
        var FakeSocket = function(address, handler) {
          this.handler = handler;
        };
        FakeSocket.prototype.fakeIncomingMessage = function(msg) {
          this.handler(msg);
        };
        FakeSocket.prototype.sendMessage = function(msg) {};
        return FakeSocket;
      });
    })
    beforeEach(module('rtp'));
    beforeEach(module('test'));
    beforeEach(inject(function(JsonRpcSocket, $rootScope) {
      handler = {handleMsg: sinon.stub().returns('test'),
                 generateError: sinon.stub().throws('BadError', 'an error')};
      jsonrpc = JsonRpcSocket('lala', handler);
      sinon.stub(jsonrpc.socket, 'sendMessage');
      rootScope = $rootScope;
    }));
    afterEach(function() {
      jsonrpc.socket.sendMessage.restore();
    });
    
    describe('client-side', function() {
      describe('normal handling', function() {
        var result, error;
        beforeEach(function() {
          result = sinon.spy();
          error = sinon.spy();
          jsonrpc.sendMessage('yoyoyo', ['a']).then(result, error);
        });
            
        it('sends a message to the server and receives a reply', function() {
          expect(jsonrpc.socket.sendMessage).to.be.calledWith(JSON.stringify(
              {method: 'yoyoyo', params: ['a'], id: 1}));
          expect(result).not.to.be.called;    
          expect(error).not.to.be.called;    
            
          // response
          jsonrpc.socket.fakeIncomingMessage(JSON.stringify(
              {result: 'hmm', error: null, id: 1}));
          rootScope.$digest();  // Fire off chained promises.
          expect(result).to.be.calledWith('hmm');
        });
        
        it('rejects when error is set', function() {
          jsonrpc.socket.fakeIncomingMessage(JSON.stringify(
              {result: null, error: 'bad', id: 1}));
          rootScope.$digest();
          expect(error).to.be.calledWith('bad');
        });
      });
      
      describe('error-handling', function() {
        beforeEach(function() {
          sinon.stub(console, 'error');
        });
        afterEach(function() {
          console.error.restore();
        });
        
        it('errors out if reply contains no id', function() {
          jsonrpc.socket.fakeIncomingMessage(JSON.stringify(
              {result: 'hmm', error: null}));
            
          expect(console.error).to.be.calledWith(sinon.match(/no id/));
        });
      
        it('errors out if response isn\'t valid json', function() {
          jsonrpc.socket.fakeIncomingMessage('flskjfs{[');
            
          expect(console.error).to.be.calledWith(sinon.match(/non json/));
        });
        
        it('errors out if response isn\'t paired with request', function() {
          jsonrpc.socket.fakeIncomingMessage(JSON.stringify(
              {result: 'yep', error: null, id: 15}));
          expect(console.error).to.be.calledWith(sinon.match(/unknown request/));
        });
      });
    });
    
    describe('server-side', function() {
      it('dispatches to handleMessage spy', function() {
        jsonrpc.socket.fakeIncomingMessage(JSON.stringify(
            {method: 'handleMsg', params: [], id: 17}));
        expect(handler.handleMsg).to.be.called;
        expect(jsonrpc.socket.sendMessage).to.be.calledWith(JSON.stringify(
            {result: 'test', error: null, id: 17}));
      });
      
      it('returns errors on exception', function() {
        jsonrpc.socket.fakeIncomingMessage(JSON.stringify(
            {method: 'generateError', params: [], id: 17}));
        expect(handler.generateError).to.be.called;
        expect(jsonrpc.socket.sendMessage).to.be.calledWith(JSON.stringify(
            {result: null, error: 'an error', id: 17}));
      });
      
      it('errors on bad method request', function() {
        sinon.stub(console, 'error');
        jsonrpc.socket.fakeIncomingMessage(JSON.stringify(
            {method: 'alkjfsd', params: [], id: 17}));
        expect(handler.handleMsg).not.to.be.called;
        expect(console.error).to.be.called;
        console.error.restore();
      })
    });
  });
});

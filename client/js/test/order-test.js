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
  var chai = require('chai');
  var sinonChai = require('test/sinon-chai');
  chai.use(sinonChai);
  
  var expect = chai.expect;
  var sinon = require('test/sinon');
  var GameState = require('rtp/game-state');
  var Unit = require('rtp/unit');
  var Square = require('rtp/square');
  var Order = require('rtp/order');
  
  describe('Order', function() {
    describe('deserialize', function() {
      it('calls deserialize on the registered constructor', function() {
        var subtype = {id: 'subtype', deserialize: sinon.spy()};
        Order.registerSubtype(subtype);
        Order.deserialize({type: 'subtype'});
        expect(subtype.deserialize).to.be.calledOnce;
      });
    });
  });
});

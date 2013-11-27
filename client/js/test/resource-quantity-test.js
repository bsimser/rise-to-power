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
  var testRules = require('rtp/test-rules');
  var ResourceQuantity = require('rtp/resource-quantity');
  var ResourceBlueprint = require('rtp/resource-blueprint');
  
  describe('ResourceQuantity', function() {
    describe('deserialize', function() {
      var resources;
      beforeEach(function() {
        resources = ResourceQuantity.deserialize({
          quantity: 17, blueprint: 'iron'
        });
      });
      
      it('doesn\'t resolve anything initially', function() {
        expect(resources).to.be.an.instanceof(ResourceQuantity);
        expect(resources.blueprint).to.equal('iron');
      });
      
      it('resolves keys on finishDeserialize', function() {
        resources.finishDeserialize(null, testRules);
        
        expect(resources.blueprint).to.be.an.instanceof(ResourceBlueprint);
        expect(resources.blueprint.id).to.equal('iron');
      });
    });
  });
});

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
  var angular = require('test/angular-mocks');
  require('rtp/services/drag-handler');
  
  describe('DragHandler', function() {
    var DragHandler, target, spyHandler;
    beforeEach(module('rtp'));
    beforeEach(inject(function(_DragHandler_) {
      DragHandler = _DragHandler_;
      $('body').empty();
      target = $('<div style="position:absolute;left:100px;top:50px;width:100px;height:100px"></div>').appendTo('body');
      spyHandler = {
        mouseDown: sinon.spy(),
        mouseUp: sinon.spy(),
        mouseDrag: sinon.spy()
      };
    }));
    
    it('ignores mousedowns that occur outside of any target', function() {
      DragHandler(target, spyHandler);
      $(window).trigger($.Event('mousedown', {pageX: 400, pageY: 400}));
      expect(spyHandler.mouseDown).to.not.be.called;
    });

    it('calls mousedown events that occur on a target', function() {
      DragHandler(target, spyHandler);
      $(target).trigger($.Event('mousedown', {pageX: 150, pageY: 125}));
      expect(spyHandler.mouseDown).to.be.calledOnce;
      expect(spyHandler.mouseDown.args[0][0].offsetX).to.equal(50);
      expect(spyHandler.mouseDown.args[0][0].offsetY).to.equal(75);
    });

    it('mousedown the mousemove triggers handler', function() {
      DragHandler(target, spyHandler);
      $(target).trigger($.Event('mousedown', {pageX: 150, pageY: 125}));
      $(target).trigger($.Event('mousemove', {pageX: 160, pageY: 100}));
      expect(spyHandler.mouseDrag).to.be.calledOnce;
      expect(spyHandler.mouseDrag.args[0][0].offsetX).to.equal(60);
      expect(spyHandler.mouseDrag.args[0][0].offsetY).to.equal(50);
    });
    
    it('mouseup gets sent', function() {
      DragHandler(target, spyHandler);
      $(target).trigger($.Event('mousedown', {pageX: 150, pageY: 125}));
      $(target).trigger($.Event('mousemove', {pageX: 160, pageY: 100}));
      $(target).trigger($.Event('mouseup', {pageX: 160, pageY: 100}));
      expect(spyHandler.mouseUp).to.be.calledOnce;
      expect(spyHandler.mouseUp.args[0][0].offsetX).to.equal(60);
      expect(spyHandler.mouseUp.args[0][0].offsetY).to.equal(50);
    });
    
    it('mouseup does not get sent without target', function() {
      DragHandler(target, spyHandler);
      $(target).trigger($.Event('mouseup', {pageX: 160, pageY: 100}));
      expect(spyHandler.mouseUp).to.not.be.called;
    });
  });
});

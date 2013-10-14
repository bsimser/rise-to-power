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
  require('rtp/services/image-downloader');
  
  describe('Image Downloader', function() {
    var ImageDownloader, httpBackend, rootScope, SingleImageDownloader;
  
    beforeEach(function() {
      var rtpTest = angular.module('test', ['rtp']);
      // Replace the SingleImageDownloader with a version that uses $http, which
      // we can mock. Otherwise, we'd have to have an actual server to talk to in 
      // order to support Image.
      rtpTest.factory('SingleImageDownloader', function($http) {
        return function(path, success, failure) {
          return $http.get(path).then(success, failure);
        };
      });
    });
  
    beforeEach(module('rtp'));
    beforeEach(module('test'));
    beforeEach(inject(function($httpBackend, _ImageDownloader_, _SingleImageDownloader_, $rootScope) {
      ImageDownloader = _ImageDownloader_;
      httpBackend = $httpBackend;
      rootScope = $rootScope;
      SingleImageDownloader = _SingleImageDownloader_;
    }));
    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });
  
    var successSpy, failureSpy, notifySpy;
    beforeEach(function() {
      successSpy = sinon.spy();
      failureSpy = sinon.spy();
      notifySpy = sinon.spy();
    });
    
    it('downloads an image', function() {
      httpBackend.expect('GET', '/images/test.png').respond(200, 'an image');
      
      ImageDownloader.download(['test.png']).then(successSpy, failureSpy, notifySpy);

      expect(successSpy).to.not.be.called;
      expect(failureSpy).to.not.be.called;
      expect(notifySpy).to.not.be.called;
      
      httpBackend.flush();
      rootScope.$digest();
      
      expect(successSpy).to.be.calledOnce;
      expect(failureSpy).to.not.be.called;
      expect(notifySpy).to.be.calledWith('test.png');
    });
    
    it('downloads three images', function() {
      httpBackend.expect('GET', '/images/test.png').respond(200, 'an image');
      httpBackend.expect('GET', '/images/test2.png').respond(200, 'an image');
      httpBackend.expect('GET', '/images/test3.png').respond(200, 'an image');
      
      ImageDownloader.download(['test.png', 'test2.png', 'test3.png'])
          .then(successSpy, failureSpy, notifySpy);

      expect(successSpy).to.not.be.called;
      expect(failureSpy).to.not.be.called;
      expect(notifySpy).to.not.be.called;
    
      httpBackend.flush();
      rootScope.$digest();
      
      expect(successSpy).to.be.calledOnce;
      expect(failureSpy).to.not.be.called;
      expect(notifySpy).to.be.calledThrice;
    });
    
    it('rejects when any image fails', function() {
      httpBackend.expect('GET', '/images/test.png').respond(200, 'an image');
      httpBackend.expect('GET', '/images/test2.png').respond(500, 'badness!');
      httpBackend.expect('GET', '/images/test3.png').respond(200, 'an image');
      
      ImageDownloader.download(['test.png', 'test2.png', 'test3.png'])
          .then(successSpy, failureSpy, notifySpy);

      expect(successSpy).to.not.be.called;
      expect(failureSpy).to.not.be.called;
      expect(notifySpy).to.not.be.called;
    
      httpBackend.flush();
      rootScope.$digest();
      
      expect(successSpy).to.not.be.called;
      expect(failureSpy).to.be.calledOnce;
      expect(notifySpy).to.be.calledOnce;
    });
    
    it('caches duplicate images', function() {
      httpBackend.expect('GET', '/images/test.png').respond(200, 'an image');
      ImageDownloader.download(['test.png']);
      httpBackend.flush();
      rootScope.$digest();
      
      ImageDownloader.download(['test.png']).then(successSpy, failureSpy, notifySpy);
      rootScope.$digest();
      expect(successSpy).to.be.calledOnce;
    });
    
    it('returns undefined for images that aren\'t found', function() {
      expect(ImageDownloader.get('someimage.png')).to.be.undefined;
    });
    
    it('returns the downloaded image', function() {
      httpBackend.expect('GET', '/images/test.png').respond(200, 'an image');
      ImageDownloader.download(['test.png']);
      httpBackend.flush();
      rootScope.$digest();
      
      // Can't test for actual Image here, because we mock out the Image part.
      expect(ImageDownloader.get('test.png')).to.be.defined;
    });
  });
});

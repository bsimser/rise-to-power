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

var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/test\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/js',

    paths: {
      jquery: 'jquery-2.0.3',
      less: 'less-1.4.1.min',
      'test/sinon': 'test/sinon-1.7.3',
      partials: '../partials',
    },

    shim: {
      'angular': {
        exports: 'angular',
        deps: ['jquery'],
      },
      'angular-route': {
        deps: ['angular'],
      },
      'test/angular-mocks': {
        exports: 'angular',
        deps: ['angular'],
      },
      'test/sinon': {
        exports: 'sinon',
      },
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});

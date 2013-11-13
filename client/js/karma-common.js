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

module.exports = {
  // base path, that will be used to resolve files and exclude
  basePath: '..',

  // frameworks to use
  frameworks: ['mocha', 'requirejs'],

  // list of files / patterns to load in the browser
  files: [
    'js/test/test-config.js',
    'js/angular.js',
    {pattern: '**/*.js', included: false},
    {pattern: 'partials/**/*.html', included: false}
  ],

  // list of files to exclude
  exclude: [
    'js/rtp/main.js',
    'js/rtp/config.js'
  ],

  // test results reporter to use
  // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
  reporters: ['progress'],

  // web server port
  port: 9876,

  // enable / disable colors in the output (reporters and logs)
  colors: true,

  // enable / disable watching file and executing tests whenever any file 
  // changes
  autoWatch: true,

  // Start these browsers, currently available:
  // - Chrome
  // - ChromeCanary
  // - Firefox
  // - Opera
  // - Safari (only Mac)
  // - PhantomJS
  // - IE (only Windows)
  browsers: ['Chrome'],

  // If browser does not capture in given timeout [ms], kill it
  captureTimeout: 60000,

  // Continuous Integration mode
  // if true, it capture browsers, run tests and exit
  singleRun: false,
  
  preprocessors: {
    '**/*.html': ['ng-html2js']
  }
};

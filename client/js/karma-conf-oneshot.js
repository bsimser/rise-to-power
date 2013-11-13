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

// Karma configuration
// Generated on Sun Oct 06 2013 10:15:06 GMT-0500 (CDT)

var rtpConfig = require('./karma-common.js');

module.exports = function(config) {
  rtpConfig.singleRun = true;
  rtpConfig.reporters = ['junit'];
  config.set(rtpConfig);
};


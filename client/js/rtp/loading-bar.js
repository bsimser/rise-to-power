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
	var Point = require('rtp/point');
  
  var LoadingBar = function(max, width, height, context) {
    this.progress = 0;
    this.max = max;
    this.width = width;
    this.height = height;
    this.context = context;
  };
  LoadingBar.prototype.advance = function() {
    console.assert(this.progress < this.max, 'LoadingBar advanced too far!');
    this.progress++;
  };
  LoadingBar.prototype.finish = function() {
    this.progress = this.max;
  };
  LoadingBar.prototype.draw = function() {
    var c = this.context;
    c.save();
    c.fillStyle = 'black';
    c.fillRect(0, 0, this.width, this.height);
    
    // The Loading Bar should be about 80% of the width of the context:
    var loadingBarWidth = Math.floor(0.8 * this.width);
    var loadingBarHeight = 20;
    
    var ul = new Point(Math.floor(this.width / 2 - loadingBarWidth / 2),
                       Math.floor(this.height / 2 - loadingBarHeight / 2));
    
    c.strokeStyle = 'white';
    c.strokeRect(ul.x, ul.y, loadingBarWidth, loadingBarHeight);
    
    ul.x += 2;
    ul.y += 2;
    
    var progressWidth = Math.ceil((loadingBarWidth - 4) * this.progress / this.max);
    
    c.fillStyle = 'yellow';
    c.fillRect(ul.x, ul.y, progressWidth, loadingBarHeight - 4);
    
    c.restore();
  };
  
  return LoadingBar;
});

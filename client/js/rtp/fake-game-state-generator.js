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
  var Terrain = require('rtp/terrain');
  var Square = require('rtp/square');
  var GameState = require('rtp/game-state');
  var Municipality = require('rtp/municipality');
  var Player = require('rtp/player');
  var Unit = require('rtp/unit');
  var Building = require('rtp/building');
  var MovementOrder = require('rtp/movement-order');
  var testRules = require('rtp/test-rules');
  
  function fade(t) {
    // Unrolled 5th degree polynomial
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(alpha, a, b) {
    return a + alpha * (b - a);
  }

  function grad(hash, x, y, z) {
    var h = hash & 15;
    var u = (h<8) ? x : y;
    var v = (h<4) ? y : ((h==12||h==14) ? x : z);
    return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
  }

  var p = [];
  var permutation = [151,160,137,91,90,15,
     131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
     190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
     88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
     77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
     102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
     135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
     5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
     223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
     129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
     251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
     49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
     138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

  for (var i=0;i<256;++i) {
    p[256 + i] = p[i] = permutation[i];
  }

  function noise(x, y, z) {
    var X = Math.floor(x) & 0xFF;
    var Y = Math.floor(y) & 0xFF;
    var Z = Math.floor(z) & 0xFF;
  
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
  
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);
  
    var A = p[X] + Y;
    var B = p[X+1] + Y;
  
    var AA = p[A] + Z;
    var AB = p[A+1] + Z;
    var BA = p[B] + Z;
    var BB = p[B+1] + Z;
  
    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
                                   grad(p[BA], x-1, y, z)),
                           lerp(u, grad(p[AB], x, y-1, z),
                                   grad(p[BB], x-1, y-1, z))),
                   lerp(v, lerp(u, grad(p[AA+1], x, y, z-1),
                                   grad(p[BA+1], x-1, y, z-1)),
                           lerp(u, grad(p[AB+1], x, y-1, z-1),
                                   grad(p[BB+1], x-1, y-1, z-1))));
                 
  }
  
  // Returns a Terrain for square x,y.
  function chooseTerrain(x, y) {
    var val = noise(x / 13 + 0.0001, y / 15 + 0.0001, 0);
    if (val < 0) {
      return Terrain.SEA;
    } else if (val < 0.5) {
      return Terrain.FIELD;
    } else {
      return Terrain.FOREST;
    }
  }
  
  var prevRand = 0.001;
  function nextRand() {
    prevRand = noise(prevRand * 10000 + 0.01, prevRand * 2457 + 0.01, 0);
    var r = (prevRand + 1.0) * 0.5;
    return r;
  }
  
  return function(loggedInPlayer) {
    var fakeSquares = [];
    for (var j = -17*6; j < 17*6; ++j) {
      for (var i = -17*6; i < 17*6; ++i) {
        var terrain = chooseTerrain(i, j);
        var fakeSquare = new Square(i + ',' + j, terrain, i, j, undefined, undefined, undefined);
        fakeSquares.push(fakeSquare);
      }
    }
    
    var fakeMunicipalities = [];
    for (var j = -17*6; j < 17*6; j += 17) {
      for (var i = -17*6; i < 17*6; i += 17) {
        var municipality = new Municipality(i + ',' + j, i, j, null, null, null);
        fakeMunicipalities.push(municipality);
      }
    }
    
    var fakePlayers = [loggedInPlayer, 'applmak', 'jmegq', 'jwall', 'swsnider', 'dovenj'].map(function(name) {
      return new Player(name, name, [], [], [], null, null, [], []);
    });
    
    // Each player needs to own SOME municipality.. choose it based on our
    // random number generator.
    fakePlayers.forEach(function(p) {
      var x = (p.name.length + 0.1) * 0.145;
      var y = (p.name.charCodeAt(0) + 0.11) * 0.143;
      var z = 0.1;
      var i = Math.floor(fakeMunicipalities.length * 0.5 * (1 + noise(x, y, z)));
      while (i < fakeMunicipalities.length && fakeMunicipalities[i].owner) { i++; }
      fakeMunicipalities[i].owner = p.name;
      console.log(fakeMunicipalities[i].x, fakeMunicipalities[i].y, p.name);
      p.ownedLand.push(fakeMunicipalities[i].x + ',' + fakeMunicipalities[i].y);
    });
    
    var someUnit;
    var fakeUnits = fakePlayers.map(function(player, index) {
      // make a unit for each player... on a random square in his municipality.
      var m = player.ownedLand[0].split(',');
      var x = Math.floor(nextRand() * 17) + parseInt(m[0]);
      var y = Math.floor(nextRand() * 17) + parseInt(m[1]);
      
      console.log(player.name, 'dude', x, y);
      
      var u = new Unit('fjsl' + index, 'dude', player.name, x + ',' + y, 10, null);
      if (player.name == 'rtp-debug') {
        someUnit = u;
      }
      return u;
    });
    
    var fakeBuildings = fakePlayers.map(function(player) {
      // make a building for each player...
      var m = player.ownedLand[0].split(',');
      var x = Math.floor(nextRand() * 17) + parseInt(m[0]);
      var y = Math.floor(nextRand() * 17) + parseInt(m[1]);
      
      console.log(player.name, 'building', x, y);
      
      return new Building('flkjs', 'farm', x + ',' + y, [], []);
    });
    
    var fakeOrders = [];
    // We're going to fill in fake orders for the logged-in-user, which is 
    // hard-coded to be rtp-debug in other parts of the code. In the future,
    // when we actually transfer the logged-in-user, we won't need this, but 
    // then, hopefully, we won't need a fake game state generator.
    fakeOrders.push(new MovementOrder('mo', someUnit.id, someUnit.location, []));
    
    console.log('Generated fake game state!');
    
    function FakeGameState() {
      GameState.apply(this, [].slice.call(arguments));
    }
    FakeGameState.prototype = Object.create(GameState.prototype);
    FakeGameState.prototype.setSquareProperties = function(x, y, props) {
      var id = x + ',' + y;
      var square = this.getSquareAt(x, y);
      props.id = id;
      props.x = x;
      props.y = y;
      
      if (square) {
        // Existing square case:
        if (props.terrain) {
          square.terrain = props.terrain;
        }
      } else {
        // New square case:
        square = Square.deserialize(props);
        this.squaresByLocation[id] = square;
        this.squares.push(square);
      }
    };
    FakeGameState.prototype.setMunicipalityProperties = function(x, y, props) {
      var m = this.getMunicipalityAt(x, y);
      if (m) {
        x = m.x;
        y = m.y;
      }
      var id = x + ',' + y;
      props.id = id;
      props.x = x;
      props.y = y;
      
      if (m) {
        // Existing municipality case:
        if (props.owner) {
          m.owner = props.owner instanceof Player ? props.owner : this.getPlayerByName(props.owner);
        }
      } else {
        // New municipality case:
        m = Municipality.deserialize(props);
        this.municipalitiesByKey[id] = m;
        this.municipalities.push(m);
      }
    };
    
    var state = new FakeGameState(fakeSquares, fakeMunicipalities, fakePlayers, fakeUnits, fakeBuildings, fakeOrders);
    state.finishDeserialize(null, testRules);
    return state;
  };
});

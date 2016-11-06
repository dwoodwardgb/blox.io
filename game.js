'use strict';

module.exports = function () {
  var state = {};
  var worldWidth = 480, worldHeight = 320;

  function addPlayer(id, startX, startY) {
    state[id] = {
      type = 0,
      x: startX,
      y: startY,
      dx: 0,
      dy: 0
    };
  }

  function updatePlayerVelocity(id, newDx, newDy) {
    var player = state[id];

    if (player) {
      player.dx = newDx;
      player.dy = newDy;
    }
  }

  function removePlayer(id) {
    delete state[id];
  }

  function getState() {
    return state;
  }

  function addNPC(id, startX, startY) {
    state[id] = {
      type = 1,
      x: startX,
      y: startY,
      destx: 0,
      desty: 0
    }
  }

  function updateNPC(id, destX, destY) {
    state[id].destx = destX;
    state[id].desty = destY;
  }

  function tick(deltaT) {
    for (var id in state) {
      var data = state[id];

      if (data.type === 0) {
        if (!outOfBounds(data.x + (data.dx * deltaT),
                         data.y + (data.dy * deltaT))) {

          data.x += data.dx * deltaT;
          data.y += data.dy * deltaT;
        }
      } else if (data.type === 1) {
          var distfromdestx = (data.destx-data.x);
          var distfromdesty = (data.destx-data.y);

          var distfromdest = Math.sqrt((Math.pow(distfromdestx, 2) + Math.pow(distfromdesty, 2)));

          if (distfromdest >= 20) {
            var relpropx = distfromdestx / distfromdest;
            var relpropy = distfromdesty / distfromdest;

            data.x += 0.2 * relpropx * deltaT;
            data.y += 0.2 * relpropy * deltaT;
          }
      }
    }
  }

  function outOfBounds(x, y) {
    return ((x < 0 || x > worldWidth) || (y < 0 || y > worldHeight));
  }

  return {
    addPlayer,
    addNPC,
    updatePlayerVelocity,
    removePlayer,
    getState,
    tick
  };
};

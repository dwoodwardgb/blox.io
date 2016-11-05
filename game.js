'use strict';

module.exports = function () {
  var state = {};
  var worldWidth = 480, worldHeight = 320;

  function addPlayer(id, startX, startY) {
    state[id] = {
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

  function tick(deltaT) {
    for (var id in state) {
      var data = state[id];

      if (!outOfBounds(data.x + (data.dx * deltaT),
                       data.y + (data.dy * deltaT))) {

        data.x += data.dx * deltaT;
        data.y += data.dy * deltaT;
      }
    }
  }

  function outOfBounds(x, y) {
    return ((x < 0 || x > worldWidth) || (y < 0 || y > worldHeight));
  }

  return {
    addPlayer,
    updatePlayerVelocity,
    removePlayer,
    getState,
    tick
  };
};

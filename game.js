'use strict';

module.exports = function () {
  var state = {};

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

      data.x += data.dx * deltaT;
      data.y += data.dy * deltaT;
    }
  }

  return {
    addPlayer,
    updatePlayerVelocity,
    removePlayer,
    getState,
    tick
  };
};

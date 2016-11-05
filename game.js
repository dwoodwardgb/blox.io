'use strict';

module.exports = function () {
  var state = {};

  return {
    addPlayer(id, startX, startY) {
      state[id] = {
        x: startX,
        y: startY,
        dx: 0,
        dy: 0
      };
    },

    updatePlayerVelocity(id, newDx, newDy) {
      var player = state[id];

      if (player) {
        player.dx = newDx;
        player.dy = newDy;
      }
    },

    removePlayer(id) {
      delete state[id];
    },

    getState() {
      return state;
    },

    tick(deltaT) {
      for (var id in state) {
        var data = state[id];

        data.x += data.dx * deltaT;
        data.y += data.dy * deltaT;
      }
    }
  };
};

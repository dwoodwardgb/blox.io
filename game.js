'use strict';

module.exports = function () {
  var state = {};
  var worldWidth = 1000, worldHeight = 450;
  var PLAYER_WIDTH = 20, PLAYER_HEIGHT = 20;

  function addPlayer(id, startX, startY) {
    state[id] = {
      type: 0,
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
      type: 1,
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
                         data.y + (data.dy * deltaT))
            && !nextMoveIntersectsOtherCharacter(id, data, deltaT)) {

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

  function nextMoveIntersectsOtherCharacter(charId, charData, deltaT) {
    var newX = charData.x + charData.dx * deltaT,
        newY = charData.y + charData.dy * deltaT;

    for (var _id in state) {
      if (_id !== charId) {
        var curData = state[_id];
        if (rectsCollide(newX, newY, PLAYER_WIDTH, PLAYER_HEIGHT,
                         curData.x, curData.y, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          return true;
        }
      }
    }

    return false;
  }

  function rectsCollide(x1, y1, width1, height1, x2, y2, width2, height2) {
    return (absDistance(x1, x2) < avg(width1, width2)) && (absDistance(y1, y2) < avg(height1, height2));
  }

  function absDistance(a, b) {
    return Math.abs(a - b);
  }

  function avg(...args) {
    var sum = 0;
    for (var i = 0; i < args.length; i += 1) {
      sum += args[i];
    }
    return sum / args.length;
  }

  function outOfBounds(x, y) {
    return ((x < 0 || x > worldWidth - PLAYER_WIDTH)
            || (y < 0 || y > worldHeight - PLAYER_HEIGHT));
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

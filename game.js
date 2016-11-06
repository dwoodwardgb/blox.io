'use strict';

module.exports = function (getSocketById) {
  var state = {};
  var worldWidth = 1000, worldHeight = 450;
  var PLAYER_WIDTH = 20, PLAYER_HEIGHT = 20;

  // potential move results
  var INTERSECTS = 1, VALID = 0, OUT_OF_BOUNDS = 2, STAGNANT = 3;

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
      destx: 100,
      desty: 100
    }
  }

  function updateNPC(id, destX, destY) {
    state[id].destx = destX;
    state[id].desty = destY;
  }

  function tick(deltaT) {
    for (var id in state) {
      var data = state[id];

      var res = checkNextMove(id, data, deltaT);
      if (res.status === INTERSECTS) {
        // for each, remove accordingly
        res.intersected.forEach(intId => {
          var intData = state[intId];
          var sock;

          if (data.type === 0 && intData.type !== 0) {
            // kill data
            delete state[id];
            sock = getSocketById(id);
            sock.emit('dead', {});
            console.log('killing: ' + id);
          } else if (data.type === 1 && intData.type === 0) {
            // kill intData & move in
            delete state[intId];
            sock = getSocketById(intId);
            sock.emit('dead', {});
            console.log('killing: ' + intId);

            data.x = res.move.x;
            data.y = res.move.y;
          }
        });
      } else if (res.status === VALID) {
        data.x = res.move.x;
        data.y = res.move.y;
      }
    }
  }

  // (...) => { x, y }
  function getNextMove(charId, charData, deltaT) {
    if (charData.type === 0) {
      if (charData.dx === 0 && charData.dy === 0) return null;

      return { x: charData.x + charData.dx * deltaT,
               y: charData.y + charData.dy * deltaT
      };
    } else if (charData.type === 1) {

      var distfromdestx = (charData.destx-charData.x);
      var distfromdesty = (charData.desty-charData.y);

      var distfromdest = Math.sqrt((Math.pow(distfromdestx, 2) + Math.pow(distfromdesty, 2)));

      if (distfromdest >= 20) {
        var relpropx = distfromdestx / distfromdest;
        var relpropy = distfromdesty / distfromdest;

        return {
          x: charData.x + 0.2 * relpropx * deltaT,
          y: charData.y + 0.2 * relpropy * deltaT
        };
      }
    }
  }

  function checkNextMove(charId, charData, deltaT) {
    var newMove = getNextMove(charId, charData, deltaT);
    if (!newMove) return { status: STAGNANT };

    if (outOfBounds(newMove.x, newMove.y)) {
      return { status: OUT_OF_BOUNDS };
    }

    var intersected = [];
    for (var _id in state) {
      if (_id === charId) continue;

      var curData = state[_id];
      if (intersect(newMove.x, newMove.y, charData, curData)) {
        intersected.push(_id);
      }
    }

    if (intersected.length > 0) {
      return { status: INTERSECTS, intersected, move: newMove };
    }

    return { status: VALID, move: newMove };
  }

  function intersect(x1, y1, char1, char2) {
    var width1 = typeToWidth(char1.type);
    var height1 = typeToHeight(char1.type);
    var width2 = typeToWidth(char2.type);
    var height2 = typeToHeight(char2.type);

    return rectsCollide(x1, y1, width1, height1, char2.x, char2.y, width2, height2);
  }

  function typeToWidth(type) {
    if (type === 0 || type === 1) {
      return PLAYER_WIDTH;
    }
  }

  function typeToHeight(type) {
    if (type === 0 || type === 1) {
      return PLAYER_HEIGHT;
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
    updateNPC,
    updatePlayerVelocity,
    removePlayer,
    getState,
    tick
  };
};

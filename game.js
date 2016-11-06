'use strict';

module.exports = function (getSocketById) {
  var state = {};
  var worldWidth = 4000, worldHeight = 4000;
  var PLAYER_WIDTH = 20, PLAYER_HEIGHT = 20;
  var npcid = 1;
  var luckyPlayer;

  // potential move results
  var INTERSECTS = 1, VALID = 0, OUT_OF_BOUNDS = 2, STAGNANT = 3;

  function addPlayer(id, startX, startY, myhand) {
    state[id] = {
      type: 0,
      x: startX,
      y: startY,
      dx: 0,
      dy: 0,
      facing: 0, //0 up, 1 down, 2 left, 3 right
      hand: myhand, //empty, shield, sword, bow
      handactive: false
    };
  }

  function updatePlayerVelocity(id, newDx, newDy) {
    var player = state[id];

    if (player) {
      player.dx = newDx;
      player.dy = newDy;
    }

    if (newDx !== 0) {
      if (newDx > 0) {
        state[id].facing = 3;
      } else {
        state[id].facing = 2;
      }
    }

    if (newDy !== 0) {
      if (newDy > 0) {
        state[id].facing = 1;
      } else {
        state[id].facing = 0;
      }
    }
  }

  function removePlayer(id) {
    delete state[id];
  }

  function wielding(id, value) {
    state[id].handactive = value;
  }

  function getState() {
    return state;
  }

  function addNPC(id, startX, startY) {
    state[id] = {
      type: 1,
      x: startX,
      y: startY,
      destx: 2200,
      desty: 2000
    }
  }

  function updateNPC(socketid) {
    for (var id in state) {
      var data = state[id];

      if (data.type === 1) {
        state[id].destx = state[socketid].x;
        state[id].desty = state[socketid].y;
      }
    }
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
            if (data.hand === "shield" && data.handactive && protecting(data, intData)) {
              relocate(intData, data);
            } else if (data.hand === "sword" && data.handactive && protecting(data, intData)) {
              //kill intData
              delete state[intId];
              console.log("Deleted monster: " + intId);
            } else {
              // kill data
              delete state[id];
              sock = getSocketById(id);
              sock.emit('dead', {});
              console.log('killing: ' + id);
            }
          } else if (data.type === 1 && intData.type === 0) {
            if (intData.hand === "shield" && intData.handactive && protecting(intData, data)) {
              relocate(data, intData);
            } else if (intData.hand === "sword" && intData.handactive && protecting(intData, data)) {
              //kill data
              delete state[id];
              console.log("Deleted monster: " + id);
            } else {
              // kill intData & move in
              delete state[intId];
              sock = getSocketById(intId);
              sock.emit('dead', {});
              console.log('killing: ' + intId);

              data.x = res.move.x;
              data.y = res.move.y;
            }
          }
        });
      } else if (res.status === VALID) {
        data.x = res.move.x;
        data.y = res.move.y;
      }
    }
    manageMonsters();
  }

  function manageMonsters() {
    var currentPlayers = [];
    for (var id in state) {
      var data = state[id];
      if (data.type === 0) {
        currentPlayers.push(id);
      }
    }
    if (currentPlayers.length > 0) {
      if (!state[luckyPlayer]) {
        luckyPlayer = currentPlayers[0];
      }
      if (Math.floor((Math.random() * 100) + 1) === 1) {
        var newX = Math.floor(Math.random() * 4000);
        var newY = Math.floor(Math.random() * 4000);

        if (Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2)) > 430) {
          addNPC(npcid++, newX, newY);
          console.log("New NPC Spawned at: " + newX + ", " + newY);
        }

        luckyPlayer = currentPlayers[Math.floor((Math.random() * currentPlayers.length))];
      }
      for (var id in state) {
        var data = state[id];
        if (data.type === 1) {
          data.destx = state[luckyPlayer].x;
          data.desty = state[luckyPlayer].y;
        }
      }
    }
  }

  function relocate(toMove, reference, id, deltaT) {
    toMove.x += (toMove.x - reference.x)*2; //assume toMove x = 1, ref x = 3. xtoMove = -4 now, which is twice the distance down from reference
    toMove.y += (toMove.y - reference.y)*2;
    var res = checkNextMove(id, toMove, deltaT);
    if (res.status === INTERSECTS) {
      // for each, remove accordingly
      res.intersected.forEach(intId => {
        var intData = state[intId];
        relocate(intData, toMove);
      });
    }
  }

  function protecting(player, monster) {
    if (player.facing === 0) {
      return monster.y < player.y;
    }
    if (player.facing === 1) {
      return monster.y > player.y;
    }
    if (player.facing === 2) {
      return monster.x < player.x;
    }
    if (player.facing === 3) {
      return monster.x > player.x;
    }
    return false; //no shield???
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
          x: charData.x + 0.05 * relpropx * deltaT,
          y: charData.y + 0.05 * relpropy * deltaT
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
    wielding,
    removePlayer,
    getState,
    tick
  };
};

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var gameFactory = require('./game');
var npcid = 1;

server.listen(4000);
app.use(express.static('public'));

// game instance ---------------------------------------------------------------

var game = gameFactory();
var intervalTime = 50;

setInterval(function () {
  game.tick(intervalTime);

  io.sockets.emit('update', game.getState());
}, intervalTime);

// connection handling ---------------------------------------------------------

io.on('connection', function (socket) { //opens connection with a client
  console.log(`client: ${socket.id} connected`);

  // add player to game
  var startX = 270, startY = 200;
  game.addPlayer(socket.id, startX, startY);
  game.addNPC(npcid++, 100, startY);

  // tell player it's id
  socket.emit('id', socket.id);

  // set message listeners

  socket.on('updateVelocity', function (data) {
    game.updatePlayerVelocity(socket.id, data.dx, data.dy);
    console.log(`updated player velocity: ${socket.id} (${data.dx},${data.dy})`);
  });

  socket.on('disconnect', function () { // client disconnects, remove from playerDataList
    game.removePlayer(socket.id);
    console.log(`client: ${socket.id} disconnected`);
  });

  socket.on('click', function (data) {
    game.updateNPC(data.x, data.y);
    console.log(`updated NPC dest: ${data.x},${data.y})`);
  });
});

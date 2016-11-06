var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var gameFactory = require('./game');
var playerNum = 0;

server.listen(4000);
app.use(express.static('public'));

// game instance ---------------------------------------------------------------

var game = gameFactory(id => io.sockets.sockets[id]);
var intervalTime = 50;

setInterval(function () {
  game.tick(intervalTime);

  io.sockets.emit('update', game.getState());
}, intervalTime);

// connection handling ---------------------------------------------------------

io.on('connection', function (socket) { //opens connection with a client
  console.log(`client: ${socket.id} connected`);

  // add player to game
  var startX = Math.floor((Math.random() * 1000) + 500), startY = Math.floor((Math.random() * 1000) + 500);

  var hand = "empty";
  playerNum++;
  if (playerNum % 3 === 1) {
    hand = "sword";
  } else if (playerNum % 3 === 2) {
    hand = "shield";
  } else if (playerNum % 3 === 0) {
    hand = "block";
  }

  game.addPlayer(socket.id, startX, startY, hand);

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
    game.updateNPC(socket.id);
    console.log(`updated NPC dest: ${data.x},${data.y})`);
  });

  socket.on('wielded', function(data) {
    game.wielding(socket.id, data);
  });
});

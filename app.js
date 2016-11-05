var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var gameFactory = require('./game');

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
  var startX = 0, startY = 0;
  game.addPlayer(socket.id, startX, startY);

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
});


'use strict';

(function () {

  //Socket Variables
  var socket = io.connect('http://localhost:4000');
  var id;

  //Client Variables
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  var speed = .3;
  var size = 20;
  var dx = 0;
  var dy = 0;
  var dxOld = dx;
  var dyOld = dy;
  var color = "green";
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  //Socket ID
    socket.on('id', function (_id) {
      id = _id;
    });


  //Socket Data
    socket.on('update', function (data) {
      console.log('got update: ' + data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var _id in data) {
      	var info = data[_id];

        drawPlayer(data[_id].x, data[_id].y, colorById(_id));
      }

    });


  //Test Window
  function setText(text) {
    var x = document.getElementById('text');
    x.innerHTML = text;
  }

  //Draws the players
  function drawPlayer(xPosition, yPosition, color) {
      ctx.beginPath();
      ctx.rect(xPosition, yPosition, size, size);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
  }


  //When someone presses a key
  function keyDownHandler(e) {
    setText(String(e.keyCode));
      if(e.keyCode == 37 || e.keyCode == 65) {

          dx = -1*speed;
          setText("left");
      }
      if(e.keyCode == 39 || e.keyCode == 68) {

          dx = speed;
          setText("right");
      }
      if(e.keyCode == 40 || e.keyCode == 83) {

          dy = speed;
          setText("down");
      }
      if(e.keyCode == 38 || e.keyCode == 87 ) {

          dy = -1*speed;
          setText("top");
      }
      if (dx!=dxOld || dy!=dyOld){
      socket.emit("updateVelocity", {dx,dy});
    }
    dxOld = dx;
    dyOld = dy;
  }
  //When someone let goes of a key
  function keyUpHandler(e) {
      if(e.keyCode == 37 || e.keyCode == 65) {
        dx= 0;

      }
      if(e.keyCode == 39 || e.keyCode == 68) {
        dx=0;

      }
      if(e.keyCode == 40 || e.keyCode == 83) {
        dy=0;

      }
      if(e.keyCode == 38 || e.keyCode == 87 ) {
          dy=0;

      }
      if (dx!=dxOld || dy!=dyOld){
      socket.emit("updateVelocity", {dx,dy});
    }
    dxOld = dx;
    dyOld = dy;
  }

  function colorById(str) { //directly from stack overflow user Joe Freeman, built from code by Cristian Sanchez
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }


}());

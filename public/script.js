//Test comment
'use strict';

(function () {

  //Socket Variables
  var socket = io.connect('http://localhost:4000');
  var id;

  //Client Variables
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  var speed = .1;
  var size = 20;
  var dx = 0;
  var dy = 0;
  var x = 0;
  var y = 0;
  var dxOld = dx;
  var dyOld = dy;
  var color = "green";
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  document.addEventListener("mousedown", mouseDownHandler, false);

  var img = new Image();
  img.src = 'http://i.imgur.com/RWRchd2.jpg';
  var imageX = 0;
  var imageY = 0;

  //Monster
  //Eyes State
  var fx = 25;
  var fy = 25;
  var fz = fx+50;

  //Iris State
  var fs = 22.5;
  var ft = 22.5;
  var fu = fx+47.5;

  //Face State
  var fa=0;
  var fb=0;

  //Socket ID
  socket.on('id', function (_id) {
    id = _id;
  });

  //Socket Data
  socket.on('update', function (data) {
    console.log('got update: ' + data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    imageX = canvas.width / 2 - x;
    imageY = canvas.height / 2 - y;

    ctx.drawImage(img, imageX-(data[id].dx*20), imageY-(data[id].dy*20));

    x = data[id].x;
    y = data[id].y;

    if (x < canvas.width/2) {
      x = canvas.width/2;
    } else if (x > 4000 - canvas.width/2) {
      x = 4000 - canvas.width/2;
    }
    if (y < canvas.height/2) {
      y = canvas.height/2;
    } else if (y > 4000-canvas.height/2) {
      y = 4000 - canvas.height/2;
    }

    for (var _id in data) {
      var info = data[_id];
      //setText("x: " + x + " " + "y: " + y);
      var xPosition = info.x - x + (canvas.width / 2);
      var yPosition = info.y - y + (canvas.height / 2);

      if (info.type === 0){
        drawPlayer(xPosition, yPosition, colorById(_id));
        if (data[_id].hand === "sword") {
          if (data[_id].handactive) {
            drawPointedSword(xPosition, yPosition, data[_id].facing);
          } else {
            drawRestedSword(xPosition, yPosition, data[_id].facing);
          }
        } else if (data[_id].hand === "shield" && data[_id].handactive) {
          drawShield(xPosition, yPosition, data[_id].facing);
        } else if (data[_id].hand === "block") {
          drawBuilder(xPosition, yPosition, data[_id].facing);
        }
      } else if (info.type === 1) {
        drawMonster(xPosition, yPosition, "green");
      } else if (info.type === 2) {
        drawBox(xPosition, yPosition);
      }
    }
  });

  socket.on('dead', function () {
    //setText('you died!');
    socket.close();
  	var overlay = document.getElementById('overlay');
  	var specialBox = document.getElementById('specialBox');
  	overlay.style.opacity = .8;
  	if(overlay.style.display == "block"){
  		overlay.style.display = "none";
  		specialBox.style.display = "none";
  	} else {
  		overlay.style.display = "block";
  		specialBox.style.display = "block";
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

  //Drawing the Monster
  function drawEyes(xPosition, yPosition) {
    ctx.fillStyle= "black";
    ctx.fillRect(xPosition+fx/5-2,yPosition+fy/5-2,4,4);
    ctx.fillRect(xPosition+fz/5-2,yPosition+fy/5-2,4,4);
  }
  function drawFace(xPosition, yPosition, color) {
    ctx.fillStyle= color;
    ctx.fillRect(xPosition+fa,yPosition+fb,100/5,100/5);
  }
  function drawMouth(xPosition, yPosition) {
    ctx.fillStyle= "black";
    ctx.fillRect((xPosition+fa+32.5/5),(yPosition+fb+50/5),35/5,45/5);
  }
  function drawIris(xPosition, yPosition){
    ctx.fillStyle = "red";
    ctx.fillRect((xPosition+fs/5),(yPosition+ft/5),1,1);
    ctx.fillRect((xPosition+fu/5),(yPosition+ft/5),1,1);
  }

  function drawMonster(xPosition, yPosition, color) {
    drawFace(xPosition, yPosition, color);
    drawEyes(xPosition, yPosition);
    drawIris(xPosition, yPosition);
    drawMouth(xPosition, yPosition);
  }

  //Drawing the Sword (when unsheathed and sheathed)
  //Sword Functions to be Activated in Spacebar
  function drawRestedSword(xPosition, yPosition, facing){
    ctx.fillStyle= "yellow";
    //Up = 0, Down = 1. Left = 2, Right = 3
     if (facing === 0) {
      ctx.fillRect(xPosition+8.5,yPosition,3,20);
      ctx.fillRect(xPosition+5,yPosition+12.5,10,3);
     } else if (facing === 1){
      ctx.fillRect(xPosition+8.5,yPosition,3,20);
      ctx.fillRect(xPosition+5,yPosition+3.5,10,3);
     } else if (facing === 2){
      ctx.fillRect(xPosition,yPosition+8.5,20,3);
      ctx.fillRect(xPosition+12.5,yPosition+5,3,10);
     } else if (facing === 3){
      ctx.fillRect(xPosition,yPosition+8.5,20,3);
      ctx.fillRect(xPosition+3.5,yPosition+5,3,10);
     }
  }

  function drawPointedSword(xPosition, yPosition, facing){
    ctx.fillStyle= "yellow";
    //Up = 0, Down = 1. Left = 2, Right = 3
    if (facing === 0) {
      ctx.fillRect(xPosition+8.5,yPosition-20,3,20);
      ctx.fillRect(xPosition+5,yPosition-8.5,10,3);
    }else if (facing === 1){
      ctx.fillRect(xPosition+8.5,yPosition+20,3,20);
      ctx.fillRect(xPosition+5,yPosition+12.5*2,10,3);
    }else if (facing === 2){
      ctx.fillRect(xPosition-20,yPosition+8.5,20,3);
      ctx.fillRect(xPosition-8.5,yPosition+5,3,10);
    }else if (facing === 3){
      ctx.fillRect(xPosition+20,yPosition+8.5,20,3);
      ctx.fillRect(xPosition+12.5*2,yPosition+5,3,10);
    }
  }

  //Drawing Shield pending on Direction
  function drawShield(xPosition, yPosition, facing){
    ctx.fillStyle= "gold";
    //Up = 0, Down = 1. Left = 2, Right = 3
    if (facing === 0) {
      ctx.fillRect(xPosition-3,yPosition,26,3);
      ctx.fillRect(xPosition+5.5,yPosition-3,10,3);
    }else if (facing === 1){
      ctx.fillRect(xPosition-3,yPosition+20,26,3);
      ctx.fillRect(xPosition+5.5,yPosition+23,10,3);
    }else if (facing === 2){
      ctx.fillRect(xPosition,yPosition-3,3,26);
      ctx.fillRect(xPosition-3,yPosition+5.5,3,10);
    }else if (facing === 3){
      ctx.fillRect(xPosition+20,yPosition-3,3,26);
      ctx.fillRect(xPosition+23,yPosition+5.5,3,10);
    }
  }

  function drawBox(xPosition, yPosition) {
    ctx.fillStyle= "black";
    ctx.fillRect(xPosition,yPosition,20,20);
    ctx.fillStyle= "gray";
    ctx.fillRect(xPosition+2,yPosition+2,16,16);
  }

  function drawBuilder(xPosition, yPosition, facing) {
    ctx.fillStyle="blue";
    if (facing === 0) {
      ctx.fillRect(xPosition-3,yPosition,26,3);
    }else if (facing === 1){
      ctx.fillRect(xPosition-3,yPosition+20,26,3);
    }else if (facing === 2){
      ctx.fillRect(xPosition,yPosition-3,3,26);
    }else if (facing === 3){
      ctx.fillRect(xPosition+20,yPosition-3,3,26);
    }
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
    if (e.keyCode == 32 ){
      socket.emit("wielded", true);
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

    if (e.keyCode == 32 ){
      socket.emit("wielded", false);
    }
    if (dx!=dxOld || dy!=dyOld){
      socket.emit("updateVelocity", {dx,dy});
    }
    dxOld = dx;
    dyOld = dy;
  }

  function mouseDownHandler(e) {
    socket.emit("click", {});
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

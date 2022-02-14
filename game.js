const levelOne = [
  [25,25,25,25,25,25,25,25,25,21,62,18,25,25,25,25],
  [25,40,26,25,25,25,25,25,25,21,56,15,25,25,25,25],
  [25,50,27,34,34,34,28,47,25,25,65,37,34,28,47,25],
  [25,61,4,46,46,46,45,59,41,1,61,44,67,12,59,24],
  [25,62,6,25,50,27,34,62,34,34,62,28,47,14,62,25],
  [26,62,6,41,60,19,20,54,15,16,55,13,57,22,55,40],
  [2,62,6,25,51,30,33,39,30,32,64,14,65,36,49,2],
  [3,54,9,14,10,7,7,46,46,45,57,9,61,11,25,6],
  [38,0,29,34,34,34,28,47,1,41,51,30,34,34,34,34],
  [17,58,52,21,21,21,13,57,23,25,42,43,53,67,67,67],
  [40,56,23,25,25,25,72,71,29,28,35,31,48,21,25,18],
  [21,51,30,34,34,34,33,70,69,5,58,66,8,21,25,18],
  [21,42,67,67,67,67,67,68,25,25,62,25,25,25,25,18]
];
const upTiles = [0,39,48,49,51,53,54,55,56,57,58,59,60,61,62,63,64,65,70,71];
const downTiles = [0,35,47,50,53,54,55,56,57,58,59,60,61,62,63,64,65,71];
const leftTiles = [0,27,28,29,30,31,32,33,34,35,36,37,38,39,47,48,49,70];
const rightTiles = [0,27,28,29,30,31,32,33,34,35,36,37,38,39,50,51];
var xPos = 80;
var yPos = 32;
function check(x,y) {
  //up,down,left,right
  let moves = [false,false,false,false];
  if (upTiles.includes(levelOne[y][x])) {
    moves[0] = true;
  }
  if (downTiles.includes(levelOne[y][x])) {
    moves[1] = true;
  }
  if (leftTiles.includes(levelOne[y][x])) {
    moves[2] = true;
  }
  if (rightTiles.includes(levelOne[y][x])) {
    moves[3] = true;
  }
  return moves;
}
var socket = io();
const myCanvas = document.getElementById('game');
const myContext = myCanvas.getContext('2d');
document.getElementById("create").addEventListener("click",() => {
  socket.emit('create',document.getElementById("name").value);
  let background = function() {
    for (let i = 0; i < levelOne.length; i++) {
      for (let j = 0; j < levelOne[i].length; j++) {
        let img = new Image();
        img.src = 'https://msguy01.com/images/pvt/' + levelOne[i][j] + '.png';
        img.onload = () => {
                myContext.drawImage(img,j * 16,i * 16);
              }
        }
    }
  }
  var policeReady = false; 
  var policeImage = new Image();
  policeImage.onload = function(){
      policeReady = true;
  }
  policeImage.src="https://msguy01.com/images/pvt/sprites/police side.png";

  var thiefReady = false;
  var thiefImage = new Image();
  thiefImage.onload = function() {
    thiefReady = true;
  }
  thiefImage.src = "https://msguy01.com"

  var then = 0;
  //Game objects
  var police = {
    speed:35,
    x:64,
    y:32,
    currentTileX: 4,
    currentTileY: 2
  };

  var keysDown = {};
  addEventListener("keydown", function(e){
          keysDown[e.keyCode] = true;
      e.preventDefault();
  }, false);
  addEventListener("keyup", function(e){
          delete keysDown[e.keyCode];
          e.preventDefault();
  }, false);


  function update(modifier){
      //up
      if(38 in keysDown && check(police.currentTileX,police.currentTileY)[0]){
          socket.emit('movement', police.x, police.y);
          police.y -= police.speed * modifier;
      }

      //down
      if(40 in keysDown && check(police.currentTileX,police.currentTileY)[1]){
          socket.emit('movement', police.x, police.y);
          police.y += police.speed * modifier;
      }

      //left
      if(37 in keysDown && check(police.currentTileX,police.currentTileY)[2]){
          socket.emit('movement', police.x, police.y);
          police.x -= police.speed * modifier;
      }

      //right
      if(39 in keysDown && check(police.currentTileX,police.currentTileY)[3]){
          socket.emit('movement', police.x, police.y);
          police.x += police.speed * modifier;
      }
      if (police.y < 0) {
        police.y = 196;
      }
      police.currentTileX = Math.round(police.x/16);
      police.currentTileY = Math.round(police.y/16);

  }

  function render(c){
      //c.clearRect(0,0,600,600)
      background();
      if(policeReady == true){
          c.drawImage(policeImage,police.x,police.y);
      }
  }
  function setImage(){
      var canvas = document.getElementById("game");
      var ctx = canvas.getContext("2d");
      var now = Date.now();
      var delta = now-then;

      update(delta/1000);
      render(ctx);

      then = now;

      requestAnimationFrame(setImage);
  }
      var w = window;
      requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

  function start(){
      console.log('starting');
      then = Date.now();
      setImage();
  }

  start();
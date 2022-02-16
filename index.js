const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var totalP = 0;
/*
{
  gameCode: {
    players: [bob, joe],
    online: 1,
    policePos: [],
  }
}
*/
let games = {
};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  totalP++;
  io.emit('connection', totalP);
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});
io.on('connection', (socket) => {
  socket.on('disconnect', (socket) => {
    console.log('a user disconnected');
    totalP--;
    io.emit('connection', totalP)
  });
  socket.on('movement', (x,y,code,playerNum) => {
    games[code].policePos = [x,y];
    //change this for thief/police switching
    let type = playerNum;
    io.emit('movement',code,x,y,playerNum,type);
  });
  socket.on('join', (code, name) => {
    let gamesArr = Object.keys(games);
    if (gamesArr.includes(code)) {
      games[code].players.push(name);
      games[code].online++;
      io.emit('code',code);
    }
    else {
      io.emit('code','Does Not Exist');
    }
  });
  socket.on('exist', () => {
    io.emit('exist');
  })
  socket.on('create', (name) => {
    //TODO:PREVENT DUPLICATE CODES
    let moveOn = false;
    let code;
    while (!moveOn) {
      moveOn = true;
      code = Math.floor(Math.random() * 9);
      for (let i = 0; i < 5; i++) {
        code *= 10;
        code += Math.floor(Math.random() * 9);
      }
      let gamesArr = Object.keys(games);
      if (gamesArr.includes(code)) {
        moveOn = false;
      }
    }
    games[code] = {
      'players': [name],
      'online': 1,
      'policePos': [64,32]
    };
    io.emit('code', code);
  })
});
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
    players: [[bob, 123456, 100], [joe, 091234, 200],
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
  //console.log(socket);
  socket.on('disconnect', (socket) => {
    console.log('a user disconnected');
    totalP--;
    io.emit('connection', totalP)
  });
  socket.on('movement', (x,y,code,playerNum,arrow) => {
    games[code].policePos = [x,y];
    //change this for thief/police switching
    let type = playerNum;
    io.emit('movement',code,x,y,playerNum,type,arrow);
  });
  socket.on('join', (code, name, clientID) => {
    let gamesArr = Object.keys(games);
    if (gamesArr.includes(code)) {
      if (games[code].closed) {
        io.emit('bruh');
      }
      else {
        games[code].players.push([name, clientID,0,'thief']);
        games[code].online++;
        games[code].closed = true;
        io.emit('code',code,games[code].players,games[code].online, clientID);
      }
    }
    else {
      io.emit('code','Does Not Exist', clientID);
    }
  });
  socket.on('exist', () => {
    io.emit('exist');
  })
  socket.on('gameOver', (code, winner, clientID) => {
    console.log(winner);
    console.log(games[code].players[winner-1][2]);
    for (let i = 0; i < games[code].players.length; i++) {
      if (games[code].players[i][3] == 'thief') {
        games[code].players[i][3] = 'police';
      }
      else {
        games[code].players[i][3] = 'thief';
      }
    }
    games[code].players[winner-1][2]+=100;
    console.log(games[code].players);
    io.emit('restartGame', winner, games[code].players[winner-1][2], code,games[code].players);
  });
  socket.on('create', (name, clientID) => {
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
      'players': [[name,clientID,0,'police']],
      'online': 1,
      'policePos': [64,32],
      'closed': false
    };
    io.emit('code', code, games[code].players, games[code].online, clientID);
  })
});
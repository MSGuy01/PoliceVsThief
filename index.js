const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
/*
{
  gameCode: {
    players: [bob, joe],
    online: 1
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
  console.log(Object.keys(socket.client.nsps));
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});
io.on('connection', (socket) => {
  socket.on('movement', (x, y) => {
    console.log('new pos: (' + x + ',' + y + ')');
  });
  socket.on('join', (code, name) => {
    let gamesArr = Object.keys(games);
    if (gamesArr.includes(code)) {
      games[code].players.push(name);
      games[code].online++;
    }
    else {
      console.log('does not exist');
    }
  });
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
      'online': 1
    };
    io.emit('code', code);
  })
});
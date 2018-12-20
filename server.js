const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const shortid = require('shortid');

let players = [];

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/getID', function(req, res) {
  res.send(shortid.generate());
});

io.on('connection', function(socket) {
  console.log('a user connected');
  
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
  
  socket.on('player coordinates', function(coords) {
    // io.emit('player coordinates', coords);
    let coordsObject = JSON.parse(coords);
    let matches = 0;
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === coordsObject.id) {
        players[i].x = coordsObject.x;
        players[i].y = coordsObject.y;
        matches++;
      } 
    }
    if (matches === 0 && coordsObject.id.length > 0) {
      players.push(coordsObject);
    }
    let outData = {data: players};
    io.emit('player coordinates', JSON.stringify(outData));
  });
  
  socket.on('disconnect', function() {
    players = [];
    console.log('a user disconnected');
  });
});

// listen for requests :)
http.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + http.address().port);
});

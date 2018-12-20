const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const shortid = require('shortid');

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
  
  socket.on('disconnect', function() {
    console.log('a user disconnected');
  });
});

// listen for requests :)
http.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + http.address().port);
});

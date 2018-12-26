const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const shortid = require('shortid');

let players = [];
let rooms = [];

let lastPowerUpX = 0.5;
let lastPowerUpY = 0.5;
let lastPowerUpType = "health";
let powerUpGot = false;
let powerUpFailSafe; // Respawns power up in case the client who's got the setTimeout disconnects

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/getID', function (req, res) {
    res.send(shortid.generate());
});

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('update rooms', function () {
        let output = {data: rooms};
        io.emit('update rooms', JSON.stringify(output));
    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('game message', function (msg) {
        io.emit('game message', msg);
    });

    socket.on('player coordinates', function (coords) {
        // io.emit('player coordinates', coords);
        let coordsObject = JSON.parse(coords);
        let matches = 0;
        for (let i = 0; i < players.length; i++) {
            if (players[i].id === coordsObject.id) {
                players[i].x = coordsObject.x;
                players[i].y = coordsObject.y;
                players[i].name = coordsObject.name;
                players[i].bullets = coordsObject.bullets;
                players[i].dir = coordsObject.dir;
                players[i].invincible = coordsObject.invincible;
                players[i].shielded = coordsObject.shielded;
                players[i].alive = coordsObject.alive;
                matches++;
            }
        }
        if (matches === 0 && coordsObject.id.length > 0) {
            players.push(coordsObject);
        }
        let outData = {data: players};
        io.emit('player coordinates', JSON.stringify(outData));
    });

    socket.on('splice bullet', function (info) {
        io.emit('splice bullet', info);
    });

    socket.on('spawn power up', function (info) {
        clearTimeout(powerUpFailSafe);
        powerUpGot = false;
        let parsedInfo = JSON.parse(info);
        lastPowerUpX = parsedInfo.x;
        lastPowerUpY = parsedInfo.y;
        lastPowerUpType = parsedInfo.type;
        io.emit('spawn power up', info);
    });

    socket.on('power up got', function () {
        powerUpFailSafe = setTimeout(function() {
            const powerUpTypes = ["health", "speed", "rapidFire", "shield", "slothadone", "funkyFungus"];
            let rnd = Math.floor(Math.random() * powerUpTypes.length);
            powerUpGot = false;
            const defaultPowerUp = {
                x: 0.5,
                y: 0.5,
                type: powerUpTypes[rnd]
            };
            io.emit('spawn power up', JSON.stringify(defaultPowerUp));
        }, 15 * 1000);
        powerUpGot = true;
        io.emit('power up got');
    });

    socket.on('get power up details', function () {
        let details = {
            x: lastPowerUpX,
            y: lastPowerUpY,
            type: lastPowerUpType,
            got: powerUpGot
        };
        io.emit('get power up details', JSON.stringify(details));
    });

    socket.on('disconnect', function () {
        players = [];
        console.log('a user disconnected');
    });
});

http.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + http.address().port);
});

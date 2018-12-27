// Dependencies imported
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const shortid = require('shortid');

// Global variables for game, things that will be changed according to user activity
let players = [];
let rooms = [{name: "The Room", password: ""}];

// Power up variables
let lastPowerUpX = 0.5;
let lastPowerUpY = 0.5;
let lastPowerUpType = "health";
let powerUpGot = false;
let powerUpFailSafe; // Respawns power up in case the client who's got the setTimeout disconnects

// Use (JS, CSS) files in Public folder
app.use(express.static('public'));

// Send index.html
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// Generates a random ID that will be used to identify the user, useful in case of duplicate names
app.get('/getID', function (req, res) {
    res.send(shortid.generate());
});

// Manage socket connections
io.on('connection', function (socket) {
    console.log('a user connected');

    // Disconnection
    socket.on('disconnect', function () {
        players = [];
        console.log('a user disconnected');
    });

    // Update Rooms
    socket.on('update rooms', function () {
        let output = {data: rooms};
        io.emit('update rooms', JSON.stringify(output));
    });

    // User creates a room
    socket.on('create room', function (roomData) {
        let proposedRoom = JSON.parse(roomData);
        for (let i = 0; i < rooms.length; i++) {
            if (proposedRoom.name === rooms[i].name) {
                // Name of user will be included, use this to show message for said user
                return io.emit('room rejected', JSON.stringify(proposedRoom));
            }
        }
        rooms.push(proposedRoom);
        let output = {data: rooms};
        io.emit('update rooms', JSON.stringify(output));
    });

    // Messages
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('game message', function (msg) {
        io.emit('game message', msg);
    });

    /* GAME OBJECTS

    PLEASE NOTE ALL X AND Y COORDINATES ARE A DECIMAL PROPORTION OF WIDTH AND HEIGHT
    e.g. 0.5 is 50% of the width
    THESE VALUES ARE TO BE MULTIPLIED BY WIDTH AND HEIGHT ON THE CLIENT SIDE DUE TO DIFFERENT CANVAS SIZES

     */

    // Updates the coordinates of each player so this can be broadcast to each player
    socket.on('player coordinates', function (coords) {
        let coordsObject = JSON.parse(coords);
        let matches = 0;
        for (let i = 0; i < players.length; i++) {
            if (players[i].id === coordsObject.id) {
                // Each property that is required to broadcast for each player in contained in the array below 'props'
                const props = "x y name bullets dir invincible shielded alive".split(" ");
                for (let j = 0; j < props.length; j++) {
                    players[i][props[j]] = coordsObject[props[j]];
                }
                matches++;
            }
        }
        if (matches === 0 && coordsObject.id.length > 0) {
            players.push(coordsObject);
        }
        let outData = {data: players};
        io.emit('player coordinates', JSON.stringify(outData));
    });

    // Delete bullet from game, upon collision with wall, character, or outside screen
    socket.on('splice bullet', function (info) {
        io.emit('splice bullet', info);
    });

    // Spawn a power up
    socket.on('spawn power up', function (info) {
        clearTimeout(powerUpFailSafe);
        powerUpGot = false;
        let parsedInfo = JSON.parse(info);
        lastPowerUpX = parsedInfo.x;
        lastPowerUpY = parsedInfo.y;
        lastPowerUpType = parsedInfo.type;
        io.emit('spawn power up', info);
    });

    // Broadcast the fact that the power up has been collected, so that it is removed from all users' games
    socket.on('power up got', function () {
        // fail-safe included in case client who's generating new power up disconnects
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

    // Get details of existing power up when user connects
    socket.on('get power up details', function () {
        let details = {
            x: lastPowerUpX,
            y: lastPowerUpY,
            type: lastPowerUpType,
            got: powerUpGot
        };
        io.emit('get power up details', JSON.stringify(details));
    });
});

http.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + http.address().port);
});

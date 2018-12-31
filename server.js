// Dependencies imported
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const shortid = require('shortid');

// Defining how to generate a power up object
class PowerUp {
    constructor(x = 0.5, y = 0.5, type = "health", got = false) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.got = got;
    }
}

// Coordinates and dimensions of original level design / walls proportionate to width and height
const defaultLevel = [
    {
        "x": 0.1,
        "y": 0.1,
        "w": 0.3,
        "h": 0.1
    },
    {
        "x": 0.1,
        "y": 0.2,
        "w": 0.1,
        "h": 0.2
    },
    {
        "x": 0.1,
        "y": 0.8,
        "w": 0.3,
        "h": 0.1
    },
    {
        "x": 0.1,
        "y": 0.6,
        "w": 0.1,
        "h": 0.2
    },
    {
        "x": 0.6,
        "y": 0.1,
        "w": 0.3,
        "h": 0.1
    },
    {
        "x": 0.8,
        "y": 0.2,
        "w": 0.1,
        "h": 0.2
    },
    {
        "x": 0.6,
        "y": 0.8,
        "w": 0.3,
        "h": 0.1
    },
    {
        "x": 0.8,
        "y": 0.6,
        "w": 0.1,
        "h": 0.2
    },
    {
        "x": 0.3,
        "y": 0.3,
        "w": 0.4,
        "h": 0.1
    },
    {
        "x": 0.3,
        "y": 0.6,
        "w": 0.4,
        "h": 0.1
    }
];

// Global variables for game, things that will be changed according to user activity
let players = [];
let rooms = [
    {name: "The Room", password: "", seconds: Infinity, playerCount: 0, numId: 261085, authorId: null, powerUp: new PowerUp()},
    {name: "Private", password: "private", seconds: Infinity, playerCount: 0, numId: 261086, authorId: null, powerUp: new PowerUp()}
];

// // Power up variables
let lastPowerUpX = 0.5;
let lastPowerUpY = 0.5;
let lastPowerUpType = "health";
let powerUpGot = false;
let powerUpFailSafe; // Respawns power up in case the client who's got the setTimeout disconnects

// Set clock for expiring
const roomLife = 10 * 60; // Ten minutes
const roomClock = setInterval(function() {
    for (let i = 2; i < rooms.length; i++) {
        rooms[i].seconds--;
        const closeToEnd = 5 * 60; // 5 Minutes
        if (rooms[i].seconds <= closeToEnd && rooms[i].seconds % 60 === 0){
            io.emit('game message', JSON.stringify({
                msg: "This room will expire in " + (rooms[i].seconds / 60) + " minutes.",
                roomId: rooms[i].numId
            }));
        }
        if (rooms[i].seconds <= 0) {
            rooms.splice(i, 1);
            let output = {data: rooms};
            io.emit('update rooms', JSON.stringify(output));
        }
    }
}, 1000);

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

// Check if public, send password back for prompting if not
app.get('/checkIfPublic/:num', function(req, res) {
    let reqNumId = Number(req.params.num);
    let output = "missing";
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].numId === reqNumId) {
            if (rooms[i].password.length > 0) {
                output = "private";
            } else {
                output = "public";
            }
        }
    }
    res.send(output);
});

// Check if room name exists, deny creation of room if it does
app.get('/checkIfRoomExists/:roomData', function(req, res) {
    // Check name length
    let roomData = JSON.parse(req.params.roomData);
    let proposedName = roomData.name;
    let proposedId = roomData.id;
    if (proposedName.length > 15) {
        return res.send("Room name too long");
    } else if (proposedName.length < 1) {
        return res.send("Room name too short");
    }
    // Check if name exists, or if user (by id) has submitted too many rooms
    let idMatches = 0;
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].name === proposedName) {
            return res.send("Room with that name already exists");
        }
        if (rooms[i].authorId === proposedId) {
            idMatches++;
        }
    }
    if (idMatches > 10) {
        return res.send("You've made too many rooms, consider deleting some");
    }
    // String "granted" grants access - see domQueries.js
    res.send("granted");
});

// Password Submission
app.get('/passwordSubmission/:password&:desiredRoomNum', function(req, res) {
    // console.log(req.params.password);
    // console.log(req.params.desiredRoomNum);
    let output = "missing";
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].numId === Number(req.params.desiredRoomNum)) {
            // Correct password
            if (rooms[i].password === req.params.password) {
                output = "granted";
            }
            // Incorrect password
            else {
                output = "denied";
            }
            break;
        }
    }
    res.send(output);
});

// Deleting a room
app.get('/checkIfCanDeleteRoom/:deletionData', function (req, res) {
    let deletionData = JSON.parse(req.params.deletionData);
    let roomNum = deletionData.roomNum;
    let userId = deletionData.userId;
    for (let i = 0; i < rooms.length; i++) {
        if (roomNum === rooms[i].numId) {
            let granted = rooms[i].authorId === userId;
            if (granted) {
                rooms.splice(i, 1);
                let output = {data: rooms};
                io.emit('update rooms', JSON.stringify(output));
                // Kick players out if they're in the room i.e. show lobby
                io.emit('kick players', roomNum);
            }
            // Prevent players from hack-deleting the main rooms
            if (userId === null) {
                granted = false;
            }
            return res.send(granted);
        }
    }
});

// Getting power up details for the room you are in
app.get("/powerUpDetails/:roomNum", function(req, res) {
    let roomNum = Number(req.params.roomNum);
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].numId === roomNum) {
            console.log(rooms[i].powerUp);
            return res.json(rooms[i].powerUp);
        }
    }
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
        // Check to see which rooms players are in, to update the count of players before sending info to all clients
        for (let i = 0; i < rooms.length; i++) {
            let count = 0;
            for (let j = 0; j < players.length; j++) {
                if (rooms[i].numId === players[j].room) {
                    count++;
                }
            }
            rooms[i].playerCount = count;
        }
        let output = {data: rooms};
        io.emit('update rooms', JSON.stringify(output));
    });

    // User creates a room
    socket.on('create room', function (roomData) {
        let proposedRoom = JSON.parse(roomData);
        // generate random numerical ID for room, check for clashes
        let idClash = true;
        let rndId = 0;
        while(idClash) {
            idClash = false;
            rndId = Math.floor(Math.random() * 1000000);
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].numId === rndId) {
                    idClash = true;
                }
            }
        }
        proposedRoom.numId = rndId;
        proposedRoom.seconds = roomLife;
        proposedRoom.playerCount = 0;
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
        // If player already is in the array, update their details
        for (let i = 0; i < players.length; i++) {
            if (players[i].id === coordsObject.id) {
                // Each property that is required to broadcast for each player in contained in the array below 'props'
                const props = "x y name id room bullets dir invincible kills shielded alive".split(" ");
                for (let j = 0; j < props.length; j++) {
                    players[i][props[j]] = coordsObject[props[j]];
                }
                matches++;
            }
        }
        // If player is not in the array, add them to it
        if (matches === 0 && coordsObject.id.length > 0) {
            players.push(coordsObject);
        }
        // Send data to all clients
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
    // REPLACING WITH app.get see above
    // socket.on('get power up details', function () {
    //     let details = {
    //         x: lastPowerUpX,
    //         y: lastPowerUpY,
    //         type: lastPowerUpType,
    //         got: powerUpGot
    //     };
    //     io.emit('get power up details', JSON.stringify(details));
    // });

    socket.on('kill increment', function(person) {
        io.emit('kill increment', person);
    });
});

http.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + http.address().port);
});

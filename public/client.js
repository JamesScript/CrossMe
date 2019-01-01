const socket = io();
let name = "";
let id = "";
let room = null;
let desiredRoom = null;

$(function () {
    // When user connects, the server will generate a random id for them which will be used to identify them
    $.get("/getID", function (data) {
        id = data;
    });

    // Functionalities added to DOM elements
    domQueries();

    // Update Rooms
    socket.on('update rooms', function (incoming) {
        buildRooms(incoming);
    });

    // Kick players from deleted room
    socket.on('kick players', function (roomN) {
        if (room === roomN) {
            player.hp = 100;
            player.kills = 0;
            player.tripping = false;
            player.shielded = false;
            inGame = false;
            room = null;
            desiredRoom = null; // check if necessary
            $("#lobby").show();
        }
    });
    
    // When message is sent by anyone, append it to the chat window
    socket.on('chat message', function (msg) {
        const msgObject = JSON.parse(msg);
        if (msgObject.roomId === roomNum) {
            $('#messages').append($('<li>').text(msgObject.msg));
            const container = $('#msgContainer');
            container.scrollTop(container[0].scrollHeight);
        }
    });

    // Messages from the game about events such as kill or item found
    socket.on('game message', function(msg) {
        const msgObject = JSON.parse(msg);
        if (msgObject.roomId === room) {
            $('#messages').append($('<li class="gameMsg">').text(msgObject.msg));
            const container = $('#msgContainer');
            container.scrollTop(container[0].scrollHeight);
        }
    });

    // Remove bullet from game when Splice Bullet is broadcast
    socket.on('splice bullet', function (info) {
        let parsedInfo = JSON.parse(info);
        let opponentId = parsedInfo.id;
        let bulletIndex = parsedInfo.bulletIndex;

        for (let i = 0; i < opponents.length; i++) {
            if (opponents[i].id === opponentId) {
                player.bullets.splice(bulletIndex, 1);
                break;
            }
        }
    });

    // Power up is spawn on client side because of walls and collision checking
    socket.on('power up respawned', function(roomNum) {
        if (roomNum === room) {
            getPowerUp();
        }
    });

    // Power up got
    socket.on('power up got', function(roomNum) {
        if (roomNum === room) {
            powerUp.got = true;
        }
    });

    // Get details of existing power up from server when joining the game
    // REPLACED WITH GET REQUEST IN game.js enterGame()
    // socket.on('get power up details', function(details) {
    //     let potentialPowerUp = JSON.parse(details);
    //     powerUp = new PowerUp(potentialPowerUp.x, potentialPowerUp.y, potentialPowerUp.type);
    //     if (potentialPowerUp.got) {
    //         powerUp.got = true;
    //     }
    // });

    // Get information on the other players and put them in the array to be rendered
    socket.on('player coordinates', function (coords) {
        let incoming = JSON.parse(coords);
        // Only keep those who are in the same room
        opponents = incoming.data.filter(function(e) {
           return e.room === room;
        });
    });

    // Increase kill count by one and update everyone
    socket.on('kill increment', function (person) {
        // Person is the id the user, not the name
        if (person === id) {
            player.kills++;
        }
        updatePlayerDetails();
    });
});
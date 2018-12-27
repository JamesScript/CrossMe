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

    // Create room NEEDS TO START WITH REQUEST TO SERVER SO THAT IP ADDRESS CAN BE MONITORED

    // Room rejected - usually if the name is already taken
    socket.on('room rejected', function (message) {
        let parsed = JSON.parse(message);
        // Consider checking IP address to make sure they're not spamming rooms
    });

    // When message is sent by anyone, append it to the chat window
    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
        const container = $('#msgContainer');
        container.scrollTop(container[0].scrollHeight);
    });

    // Messages from the game about events such as kill or item found
    socket.on('game message', function(msg) {
        $('#messages').append($('<li class="gameMsg">').text(msg));
        const container = $('#msgContainer');
        container.scrollTop(container[0].scrollHeight);
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
    socket.on('spawn power up', function(info) {
        let potentialPowerUp = JSON.parse(info);
        // X and Y values multiplied by width and height in constructor of PowerUp
        powerUp = new PowerUp(potentialPowerUp.x, potentialPowerUp.y, potentialPowerUp.type);
    });

    // Power up got
    socket.on('power up got', function() {
        powerUp.got = true;
    });

    // Get details of existing power up from server when joining the game
    socket.on('get power up details', function(details) {
        let potentialPowerUp = JSON.parse(details);
        powerUp = new PowerUp(potentialPowerUp.x, potentialPowerUp.y, potentialPowerUp.type);
        if (potentialPowerUp.got) {
            powerUp.got = true;
        }
    });

    // Get information on the other players and put them in the array to be rendered
    socket.on('player coordinates', function (coords) {
        let incoming = JSON.parse(coords);
        opponents = incoming.data;
    });
});
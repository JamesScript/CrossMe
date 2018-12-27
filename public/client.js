const socket = io();
let name = "";
let id = "";

$(function () {
    $.get("/getID", function (data) {
        id = data;
    });

    $('#submitName').submit(function (e) {
        name = $("#userNameIn").val();
        $('#enterName')
            .css({"pointer events": "none"})
            .addClass("vanish");
        e.preventDefault();
        inGame = true;

    });

    $('#chatForm').submit(function () {
        const m = $('#m');
        socket.emit('chat message', name + ": " + m.val());
        m.val('');
        return false;
    });

    socket.on('update rooms', function (incoming) {
        buildRooms(incoming);
    });

    socket.on('room rejected', function (message) {
        let parsed = JSON.parse(message);
    });

    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
        const container = $('#msgContainer');
        container.scrollTop(container[0].scrollHeight);
    });

    socket.on('game message', function(msg) {
        $('#messages').append($('<li class="gameMsg">').text(msg));
        const container = $('#msgContainer');
        container.scrollTop(container[0].scrollHeight);
    });

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

    socket.on('spawn power up', function(info) {
        let potentialPowerUp = JSON.parse(info);
        // X and Y values multiplied by width and height in constructor of PowerUp
        powerUp = new PowerUp(potentialPowerUp.x, potentialPowerUp.y, potentialPowerUp.type);
    });

    socket.on('power up got', function() {
        powerUp.got = true;
    });

    socket.on('get power up details', function(details) {
        let potentialPowerUp = JSON.parse(details);
        powerUp = new PowerUp(potentialPowerUp.x, potentialPowerUp.y, potentialPowerUp.type);
        if (potentialPowerUp.got) {
            powerUp.got = true;
        }
    });

    socket.on('player coordinates', function (coords) {
        let incoming = JSON.parse(coords);
        opponents = incoming.data;
    });
});
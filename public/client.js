const socket = io();
let name = "";
let id = "";

$(function () {
    $.get("/getID", function (data) {
        id = data;
    });

    $('#submitName').submit(function (e) {
        name = $("#userNameIn").val();
        $('#enterName').hide();
        e.preventDefault();
    });

    $('#chatForm').submit(function () {
        const m = $('#m');
        socket.emit('chat message', name + ": " + m.val());
        m.val('');
        return false;
    });

    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
        const container = $('#msgContainer');
        container.scrollTop(container[0].scrollHeight);
    });

    socket.on('splice bullet', function (info) {
        let parsedInfo = JSON.parse(info);
        let opponentId = parsedInfo.id;
        let bulletIndex = parsedInfo.bulletIndex;


        // if (player.id === opponentId) {
        //   console.log("delete all bullets of player");
        //   player.bullets = [];
        //   // player.bullets.splice(bulletIndex, 1);
        // }
        for (let i = 0; i < opponents.length; i++) {
            if (opponents[i].id === opponentId) {
                // opponents[i].bullets = [];
                player.bullets.splice(bulletIndex, 1);
                // opponents[i].bullets.splice(bulletIndex, 1);
                break;
            }
        }
    });

    socket.on('player coordinates', function (coords) {
        let incoming = JSON.parse(coords);
        opponents = incoming.data;
    });
});
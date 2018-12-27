function domQueries() {

    // Submit name - Action taken when submitName button is pressed
    $('#submitName').submit(function (e) {
        name = $("#userNameIn").val();
        $('#enterName')
            .css({"pointer-events": "none"})
            .addClass("vanish");
        e.preventDefault();
        $('#lobby').css({"pointer-events": "auto", "opacity": "1"});
        socket.emit("update rooms");
    });

    // Sending a message in the chat window
    $('#chatForm').submit(function () {
        const m = $('#m');
        socket.emit('chat message', name + ": " + m.val());
        m.val('');
        return false;
    });

    // Hide password screen function
    const hidePWScreen = function() {
        desiredRoom = null;
        $("#roomPassword").val('');
        $("#passwordPrompt").css({"pointer-events": "none", "opacity": "0"});
    };

    // Password submission form
    $('#passwordForm').submit(function(e) {
        e.preventDefault();
        let passwordInput = $("#roomPassword");
        let feedback = $("#passwordFeedback");
        let passwordToSubmit = passwordInput.val();
        $.get("/passwordSubmission/" + passwordToSubmit + "&" + desiredRoom, function(data) {
            switch (data) {
                case "missing":
                    feedback.text("Something went wrong, could not find room");
                    break;
                case "denied":
                    feedback.text("Wrong password");
                    break;
                case "granted":
                    room = desiredRoom;
                    inGame = true;
                    let infoPackage = {
                        x: player.x / width,
                        y: player.y / height,
                        hue: player.hue,
                        name: name,
                        id: id,
                        room: room,
                        dir: player.dir,
                        invincible: player.invincible,
                        shielded: player.shielded,
                        alive: player.alive,
                        bullets: []
                    };
                    socket.emit('player coordinates', JSON.stringify(infoPackage));
                    $("#lobby").hide();
                    socket.emit('update rooms');
                    hidePWScreen();
                    break;
                default:
                    feedback.text("Something went wrong, could not find room");
                    break;
            }
        });
        passwordInput.val('');
    });

    // Creating New Room - Pop up screen
    $('#createRoomBtn').click(function() {
        $("#createRoomScreen").css({"pointer-events": "auto", "opacity": "1"}).show();
    });

    // Submit New Room
    $('#roomCreationForm').submit(function(e) {
        e.preventDefault();
        let proposedName = $("#creatingRoomName");
        let proposedPassword = $("#creatingRoomPassword");
        $.get("/checkIfRoomExists/" + proposedName.val(), function(data) {
            // If name is allowed
            if (data === "granted") {
                let roomObj = {
                    name: proposedName.val(),
                    password: proposedPassword.val(),
                    activePlayers: 0
                };
                socket.emit("create room", JSON.stringify(roomObj));
                $("#createRoomScreen").hide();
                socket.emit("update rooms");
            } else {
                // Name already exists or otherwise rejected
                console.log("denied");
            }
            proposedName.val("");
            proposedPassword.val("")
        });
    });

    // Button to back out of password prompt screen
    $('#backBtn').click(function() {
        hidePWScreen();
    });

    $('#backBtnCreate').click(function() {
        $("#createRoomScreen").css({"pointer-events": "none", "opacity": "0"}).hide();
    });

    // Leave Current Room, exit game to Lobby
    $("#leaveRoom").click(function () {
        room = null;
        inGame = false;
        player.shielded = player.tripping = player.invincible = false;
        player.hp = 100;
        player.kills = 0;
        let infoPackage = {
            x: player.x / width,
            y: player.y / height,
            hue: player.hue,
            name: name,
            id: id,
            room: room,
            dir: player.dir,
            invincible: player.invincible,
            shielded: player.shielded,
            alive: player.alive,
            bullets: []
        };
        socket.emit('player coordinates', JSON.stringify(infoPackage));
        // $('#lobby').css({"pointer-events": "auto", "opacity": "1"});
        $('#lobby').show();
        socket.emit("update rooms");
    });
}
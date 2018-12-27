function buildRooms(roomInfo) {
    let parsed = JSON.parse(roomInfo);
    let roomList = parsed.data;
    let output = [];
    // console.log(roomList);
    for (let i = 0; i < roomList.length; i++) {
        let shade = i % 2 === 0 ? "roomEvenShade" : "roomOddShade";
        output.push(`<div onclick="enterRoom(${roomList[i].numId})" class="room ${shade}">`);
        output.push(`<p>${roomList[i].name}</p>`);
        output.push(`<p>Active Players: ${roomList[i].playerCount}</p>`);
        output.push('</div>');
    }
    $('#listOfRooms').html(output.join(""));
}

function submitRoom(submissionInfo) {

}

function enterRoom(roomNum) {
    $.get("/checkIfPublic/" + roomNum, function (data) {
        // Error, room not found
        if (data === "missing") {
            return alert("There was an error, maybe the room no longer exists");
        }
        // No password i.e. public
        if (data === "public") {
            room = roomNum;
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
            socket.emit("update rooms");
            $("#lobby").hide();
        }
        // Password exists
        else {
            desiredRoom = roomNum;
            $("#passwordFeedback").text("");
            $("#passwordPrompt").css({"pointer-events": "auto", "opacity": "1"});
        }
    });
}


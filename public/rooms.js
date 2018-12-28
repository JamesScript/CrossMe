function buildRooms(roomInfo) {
    let parsed = JSON.parse(roomInfo);
    let roomList = parsed.data;
    let output = [];
    console.log(roomList);
    for (let i = 0; i < roomList.length; i++) {
        let shade = i % 2 === 0 ? "roomEvenShade" : "roomOddShade";
        let lock = roomList[i].password.length > 0 ? "&#128274;" : "";
        output.push(`<div onclick="enterRoom(${roomList[i].numId})" class="room ${shade}">`);
        // First child element is room list, search bar uses data from first children element so keep in mind for changes
        output.push(`<p>${roomList[i].name} ${lock}</p>`);
        output.push(`<p>Active Players: ${roomList[i].playerCount}</p>`);
        output.push('</div>');
    }
    $('#listOfRooms').html(output.join(""));
    searchRoom(); // Removes ones that are not in the search query
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

function searchRoom() {
    let query = $("#searchBar").val();
    let roomElements = $("#listOfRooms").children();
    let qReg = new RegExp(query, "gi");
    let anyMatches = false;
    for (let i = 0; i < roomElements.length; i++) {
        // SEARCHING FOR NAME BY FIRST ELEMENT, ADDING ELEMENT BEFORE WILL CAUSE BUG
        let roomName = roomElements[i].firstElementChild.textContent;
        if (qReg.test(roomName)) {
            roomElements[i].style.display = "flex";
            anyMatches = true;
        } else {
            roomElements[i].style.display = "none";
        }
    }
    let nmMsg = $("#noMatches");
    anyMatches ? nmMsg.hide() : nmMsg.show();
}

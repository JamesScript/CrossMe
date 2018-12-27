function buildRooms(roomInfo) {
    let parsed = JSON.parse(roomInfo);
    let roomList = parsed.data;
    let output = [];
    console.log(roomList);
    for (let i = 0; i < roomList.length; i++) {
        output.push(`<div onclick="enterRoom(${roomList[i].numId})" class="room">`);
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


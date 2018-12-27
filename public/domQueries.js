function domQueries() {

    // Submit name - Action taken when submitName button is pressed
    $('#submitName').submit(function (e) {
        name = $("#userNameIn").val();
        $('#enterName')
            .css({"pointer-events": "none"})
            .addClass("vanish");
        e.preventDefault();
        $('#lobby').css({"pointer-events": "auto", "opacity": "1"});
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
            console.log(data);
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
                    $("#lobby").hide();
                    hidePWScreen();
                    break;
                default:
                    feedback.text("Something went wrong, could not find room");
                    break;
            }
        });
        passwordInput.val('');
    });

    // Creating a new room
    $('#roomCreationForm').submit(function(e) {
        e.preventDefault();

    });

    // Button to back out of password prompt screen
    $('#backBtn').click(function() {
        hidePWScreen();
    });
}
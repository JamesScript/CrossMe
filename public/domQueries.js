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

    // Password submission form
    $('#passwordForm').submit(function(e) {
        e.preventDefault();
        let passwordInput = $("#roomPassword");
        let passwordToSubmit = passwordInput.val();
        $.get("/passwordSubmission/" + passwordToSubmit + "&" + desiredRoom, function(data) {
            desiredRoom = null;
        });
        passwordInput.val('');
    });
}
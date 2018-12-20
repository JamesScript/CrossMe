const socket = io();
let name = "";
let id = "";

$(function () {
  $.get("/getID", function(data) {
    console.log(data);
    id = data;
  });

  $('#submitName').submit(function(e) {
    name = $("#userNameIn").val();
    $('#enterName').hide();
    e.preventDefault();
  });
  
  $('#chatForm').submit(function(){
    socket.emit('chat message', name + ": " + $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(msg) {
    $('#messages').append($('<li>').text(msg));
    console.log($('#msgContainer')[0].scrollHeight);
    $('#msgContainer').scrollTop($('#msgContainer')[0].scrollHeight);
  });
});
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var client = io.of('/client');
var commandCenter = io.of('/commandCenter');
var clients = [];

app.get('/client', function(req, res){
  res.sendFile(__dirname + '/client.html');
});

app.get('/commandCenter', function(req, res){
    res.sendFile(__dirname + '/command.html');
  });

client.on('connection', function(socket) {
    clients.push(socket.id);
    console.log('a user connected to client');
    socket.on('disconnect', function(){
        console.log('user disconnected to client');
    });
    socket.on('chat message', function(msg){
        commandCenter.emit('chat message', msg);
        console.log("from client " + socket.id + ": " + msg);
    });
});

commandCenter.on('connection', function(socket){
    console.log('a user connected to command');
    socket.on('disconnect', function(){
        console.log('user disconnected from command');
    });
    socket.on('chat message', function(msg){
        client.emit('chat message', msg);
        console.log("from commandCenter" + socket.id + ": " + msg);
    });
});

http.listen(4050, function(){
  console.log('listening on *:4050');
});
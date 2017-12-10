const app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    client = io.of('/client'),
    commandCenter = io.of('/commandCenter'),
    clients = {};


app.get('/client', function(req, res){
  res.sendFile(__dirname + '/client.html');
});

app.get('/commandCenter', function(req, res){
    res.sendFile(__dirname + '/command.html');
  });

client.on('connection', function(socket) {
    console.log('a user connected to client');
    let username = socket.handshake.query.username;
    clients[username.toString()] = socket.id;
    socket.on('disconnect', function(){
        console.log('user disconnected to client');
    });
    socket.on('chat message', function(msg){
        commandCenter.emit('chat message', username + ": " + msg);
    });
});

commandCenter.on('connection', function(socket){
    console.log('a user connected to command');
    socket.on('disconnect', function(){
        console.log('user disconnected from command');
    });
    socket.on('chat message', function(msg) {
        let targetUserFlag = msg.toString().split(' '),
            targetUserIndicator = targetUserFlag[0],
            pertinentMessage = msg.split(targetUserIndicator)[1];

        if (targetUserIndicator.startsWith('@')) {
            targetUserIndicator = targetUserIndicator.slice(1);
           try {
             let targetSocket = clients[targetUserIndicator];
             if (targetSocket !== undefined) {
                 client.to(targetSocket).emit('chat message', pertinentMessage);
             } else {
                 commandCenter.emit('chat message', "Please enter a valid target client. No punctuation allowed immediately target user.");
             }
           } catch(err) {
                console.log(err);
                commandCenter.emit('chat message', "Unable to send message. Please try again.");
           }
        } else {
            commandCenter.emit('chat message', "Please indicate a target user for response.  Use @ sign and do not end with punctuation e.g. @user message");
        }
    });
});

http.listen(4050, function(){
  console.log('listening on *:4050');
});
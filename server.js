var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var users = [];
var port = 8080;

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function(socket) {
    console.log('new connection made');

    socket.on('join', function(data) {


        socket.nickname = data.nickname;
        users[socket.nickname] = socket;
        var userObj = {
            nickname: data.nickname,
            socketId: socket.id
        }

        users.push(userObj);

        io.emit('all-users', users);
    })

    socket.on('disconnect', function() {
        console.log("disconnected");
        users = users.filter((user) => user.socketId != socket.id);
        io.emit('all-users', users);
    })
    socket.on('sendMessage', function(data) {
        // socket.broadcast.emit("message-received", data);
        io.emit("message-received", data);
    })

    socket.on('sendLikes', function(data) {
        // socket.broadcast.emit("message-received", data);
        console.log(data);
        socket.broadcast.to(data.like).emit("user-liked", data);
    });

    socket.on('join-private', function(data) {
        socket.join("private");
        console.log(data.nickname + 'Joined Private');
    })


    socket.on('private-chat', function(data) {
        socket.broadcast.to('private').emit("show-message", data.message)
    })

    socket.on('getUsers', function() {
        socket.emit('all-users', users);
    })
});

server.listen(port, function() {
    console.log("Listening on port " + port);
});
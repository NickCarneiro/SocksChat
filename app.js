var express = require('express')
  , app = express.createServer()
  , io = require('socket.io').listen(app);

io.set('log level', 1);
module.exports = require('./config.js').configure(app, express);


if (!module.parent) {

  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);

}

var users = [];
io.sockets.on('connection', function (socket) {
	socket.emit('greeting', { greeting: 'Welcome to SocksChat!' });

	socket.on('enterchat', function (data){
		socket.set('username', data.username);
		users.push(data.username);
		socket.broadcast.emit('userlist', JSON.stringify(users));
		socket.emit('userlist', JSON.stringify(users));
	});
 	
 	
 	socket.on('clientmessage', function (data) {
		
		if(data.message.length < 500){	
			console.log(data.username + ": " + data.message);
			socket.broadcast.emit('servermessage', { username: data.username, message: data.message });
			socket.emit('servermessage', { username: data.username, message: data.message });
		} else {
			socket.emit('servermessage', { username: "Server", message: "Your message was too long." });		
		}
	});

	socket.on('disconnect', function(){
		socket.get('username', function(err, username){
			console.log(username + " disconnected");
			//remove logged out user from users array
			for(var i = 0; i < users.length; i++){
				if(users[i] == username){
					users.splice(i,1);				
				}
			}
			socket.broadcast.emit('userlist', JSON.stringify(users));		
		});
			
	});
	

 
});


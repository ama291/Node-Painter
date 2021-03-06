//hapi server creation
var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ port: 8888 });

//server routing
server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		reply.file('public/client.html');
	}
});
server.route({
	method: 'GET',
	path: '/{param*}',
	handler: {
		directory: {
			path: 'public'
		}
	}
});

//painter vars
var rectarray = [];
function rect(xpos, ypos, width, height, color) {
	this.x = xpos;
	this.y = ypos;
	this.w = width;
	this.h = height;
	this.col = color;
}
var recnum = 0;

//socketio
var io = require('socket.io')(server.listener);

//socket listeners
io.sockets.on('connection', function(socket) {
	console.log("Client " + socket.id + " connected.");
	socket.emit('array', rectarray);
	socket.on('mouseupdate', function (data) {
		rectarray[recnum] = new rect(data.x, data.y, 10, 10, data.col);
		io.sockets.emit('rect', new rect(data.x, data.y, 10, 10, data.col));
		recnum += 1;
	});
	socket.on('clear', function(data) {
		rectarray = [];
		recnum = 0;
		io.sockets.emit('array', rectarray);
	});
	socket.on('auth', function (data) {
		rectarray = [];
		recnum = 0;
		socket.emit('authresponse', true);
			io.sockets.emit('array', rectarray);
	});
});

//start hapi server
server.start(function () {
	console.log('Server running at:', server.info.uri);
});

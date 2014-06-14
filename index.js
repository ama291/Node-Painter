var express = require("express");
var app = express();
var port = 8888;
var rectarray = [];
function rect(xpos, ypos, width, height, color) {
	this.x = xpos;
	this.y = ypos;
	this.w = width;
	this.h = height;
	this.col = color;
}
var recnum = 0;

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

app.get("/", function(req, res){
    res.render("page");
});

app.use(express.static(__dirname + '/public')); 

var io = require('socket.io').listen(app.listen(port));

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
		if (data == "36ae704936b705888b40723ac7ff11b3c0181b83f86ec2a0efa91a14d601082c") {
			rectarray = [];
			recnum = 0;
			socket.emit('authresponse', true);
			io.sockets.emit('array', rectarray);
		}
		else {
			socket.emit('authresponse', false);
		}
	});
});

console.log("Server started on port " + port);

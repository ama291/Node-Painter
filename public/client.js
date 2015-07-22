window.onload = function() {
	canvasApp();
};

function canvasApp() {
	//socketio socket
	var socket = io.connect();

	//canvas variables
	var displayCanvas = document.getElementById("game");
	var context = displayCanvas.getContext("2d");

	//mouse listener
	displayCanvas.addEventListener("mousemove", onMouseMove, false);
	displayCanvas.addEventListener("mousedown", onMouseDown, false);
	window.addEventListener("mouseup", onMouseUp, false);

	//painter vars
	var exportBut = document.getElementById('export');
	var yellowBut = document.getElementById("yellow");
	var blueBut = document.getElementById("blue");
	var greenBut = document.getElementById("green");
	var redBut = document.getElementById("red");
	var eraseBut = document.getElementById("eraser");
	var clearBut = document.getElementById("clear");
	var blackBut = document.getElementById("black");
	var drawColor = "#000000";
	function mouse(mx, my, color) {
		this.x = mx;
		this.y = my;
		this.col = color;
	}
	var rectarray;
	var clicking = false;
	var displayWidth = displayCanvas.width;
	var displayHeight = displayCanvas.height;

	//Credits to Dr. Gries http://rectangleworld.com
	//off screen canvas used only when exporting image
	var exportCanvas = document.createElement('canvas');
	exportCanvas.width = displayWidth;
	exportCanvas.height = displayHeight;
	var exportCanvasContext = exportCanvas.getContext("2d");
	//var exportImage = document.createElement('img');
	//buttons
	var bgColor, urlColor;
	exportBut.onclick = function() {
		//background - otherwise background will be transparent.
		exportCanvasContext.fillStyle = bgColor;
		exportCanvasContext.fillRect(0,0,displayWidth,displayHeight);

		//draw
		exportCanvasContext.drawImage(displayCanvas, 0,0,displayWidth,displayHeight,0,0,displayWidth,displayHeight);

		//add printed url to image
		exportCanvasContext.fillStyle = urlColor;
		exportCanvasContext.font = 'bold italic 16px Helvetica, Arial, sans-serif';
		exportCanvasContext.textBaseline = "top";

		//we will open a new window with the image contained within:
		//retrieve canvas image as data URL:
		var dataURL = exportCanvas.toDataURL("image/png");
		//open a new window of appropriate size to hold the image:
		var imageWindow = window.open("", "fractalLineImage", "left=0,top=0,width="+displayWidth+",height="+displayHeight+",toolbar=0,resizable=0");
		//write some html into the new window, creating an empty image:
		imageWindow.document.write("<title>Export Image</title>");
		imageWindow.document.write("<img id='exportImage'"
			+ " alt=''"
			+ " height='" + displayHeight + "'"
			+ " width='"  + displayWidth  + "'"
			+ " style='position:absolute;left:0;top:0'/>");
		imageWindow.document.close();
		//copy the image into the empty img in the newly opened window:
		var exportImage = imageWindow.document.getElementById("exportImage");
		exportImage.src = dataURL;
	};

	//button click listeners
	yellowBut.onclick = function() {
		drawColor = "#FFFF00";
	};
	blueBut.onclick = function() {
		drawColor = "#0000FF";
	};
	greenBut.onclick = function() {
		drawColor = "#00FF00";
	};
	redBut.onclick = function() {
		drawColor = "#FF0000";
	};
	blackBut.onclick = function() {
		drawColor = "#000000";
	};
	eraseBut.onclick = function() {
		drawColor = "#FFFFFF";
	};
	clearBut.onclick = function() {
		socket.emit('auth', null);
	};

	//mouse listeners
	function onMouseDown(evt) {
		clicking = true;
	}
	function onMouseUp(evt) {
		clicking = false;
	}
	//fix drawing algorithm, two mouses.x = eachother????
	function onMouseMove(evt) {
		if (clicking == true) {
			var bRect = displayCanvas.getBoundingClientRect();
			var mouseX = (evt.clientX - bRect.left)*(displayCanvas.width/bRect.width);
			var mouseY = (evt.clientY - bRect.top)*(displayCanvas.height/bRect.height);
			socket.emit('mouseupdate', new mouse(mouseX, mouseY, drawColor));
		}
	}

	//io listeners
	socket.on('array', function (data) {
		rectarray = data;
		context.fillStyle = "#FFFFFF";
		context.fillRect(0,0, 750, 500);
		for (var i=0; i<rectarray.length; i++) {
			context.fillStyle = rectarray[i].col;
			context.fillRect(rectarray[i].x,rectarray[i].y,rectarray[i].w,rectarray[i].h);
		}
	});
	socket.on('rect', function (data) {
		rectarray.push(data);
		context.fillStyle = data.col;
		context.fillRect(data.x,data.y,data.w,data.h);
	});
}

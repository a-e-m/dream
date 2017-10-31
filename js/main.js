var main = {
	state: {width: 600, height: 600, gamepad: null, joyX: 0, joyY: 0},
	mouse: {x: 100, y: 200, relX: 0, relY: 0, down: false, mousedown: false},
	colors: [[0, 100, 50], [60, 100, 50], [240, 100, 50], [0, 0, 0]],
	metrics: {timesDown: 0, timesUp: 0, ballsCaught: 0},
	rect: function(x, y, w, h, color) {
		main.context.fillStyle = color;
		main.context.fillRect(x, y, w, h);
	},
	clear: function() {
		main.context.clearRect(0, 0, main.state.width, main.state.height);
	},
	start: function() {
		var jCanvas = $('#canvas').css({width: main.state.width, height: main.state.height});
		var canvas = jCanvas[0];
		canvas.width = main.state.width;
		canvas.height = main.state.height;
		main.context = canvas.getContext('2d');
		
		$(window).mousemove(function(e) {
			main.mouse.relX = e.originalEvent.movementX || main.mouse.x - (e.screenX - canvas.offsetLeft);
			main.mouse.relY = e.originalEvent.movementY || main.mouse.y - (e.screenY - canvas.offsetTop);
			main.mouse.x = e.screenX - canvas.offsetLeft;
			main.mouse.y = e.offsetY - canvas.offsetTop;
		});
		
		$(window).mousedown(function(e) {
			main.mouse.mousedown = true;
		});
		
		$(window).mouseup(function(e) {
			main.mouse.mousedown = false;
		});
		
		main.game = new Game();
		
		main.timer = setInterval(function() {handleGamepad(); main.game.update();}, 33);
	},
	recordMetrics() {
		localStorage.setItem('last', JSON.stringify(main.metrics));
	}
};

(function() {	
	main.start();
})();
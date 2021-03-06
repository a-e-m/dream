var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

var main = {
	textKey: "intro",
	stage: 0
};

main.start = function(game) {
}

main.start.prototype = {
	preload: function() {
		game.load.image('title', './img/title.png');
	},
	create: function() {
		game.add.image(0, 0, 'title');
		this.cursors = game.input.keyboard.addKeys({
		'enter': Phaser.KeyCode.ENTER,
		'space': Phaser.KeyCode.SPACE });
	},
	update: function() {
		if (this.cursors.enter.justDown || this.cursors.space.justDown) {
			game.state.start('level');
		}
		
	},
	render: function () {
		
	}
};


main.level = function(game) {
	this.player;
	this.platforms;
	this.cursors;

	this.textbox;
	this.textboxText;
	this.textIndex = 0;
	this.textboxContinue;

	this.score = 0;
	this.scoreText;
	this.constants = {speed: 300, jump: 300, mass: 50, swimSpeed: 200, swimAccel: 10, dive: 100};

	this.lavaLevel = 950;

	this.entities;
	this.lang;
}

main.level.prototype = {
	preload: function() {
		if (main.stage === 5) {
			game.load.image('sky', './img/cityscape_turned.png');
		} else if (main.stage === 6) {
			game.load.image('sky', './img/garden.png');
		} else {
			game.load.image('sky', './img/cityscape.png');
		}
		
		if (main.stage !== 3) {
			game.load.image('ground', './img/platform.png');
		}
		game.load.image('alarm', './img/alarm.png');
		if (main.stage !== 3) {
			game.load.image('water', './img/water.png');
		}
		game.load.image('textbox', './img/textbox.png');
		game.load.image('placeholder', './img/placeholder.png');
		game.load.image('house', './img/house.png');
		game.load.image('boss', './img/boss.png');
		game.load.image('tree', './img/tree.png');
		game.load.image('end', './img/end.png');
		if (main.stage === 1) {
			game.load.image('bus', './img/sub.png');
		} else {
			game.load.image('bus', './img/bus.png');
		}
		game.load.image('chair', './img/chair.png');
		if (main.stage === 3) {
			game.load.spritesheet('lava', './img/lava.png', 384, 432);
		}
		if (main.stage % 2 === 0) {
			game.load.audio('music', ['img/day.ogg']);
		} else {
			game.load.audio('music', ['img/dream_fast.ogg']);
		}
		game.load.audio('clock', ['img/clock.ogg']);

		this.objects = {'house': 1, 'tree': 2, 'bus': 3};

		if (main.stage === 1) {
			game.load.spritesheet('dude', './img/swim.png', 297, 132);
		} else {
			game.load.spritesheet('dude', './img/bennett.png', 110, 184);
		}
		
		if (main.stage === 0) {
			game.load.tilemap('map', './img/day2.json', null, Phaser.Tilemap.TILED_JSON);
		} else if (main.stage === 1) {
			game.load.tilemap('map', './img/water2.json', null, Phaser.Tilemap.TILED_JSON);
		} else if (main.stage === 2) {
			game.load.tilemap('map', './img/nextday.json', null, Phaser.Tilemap.TILED_JSON);
			main.textKey = "waterAlarm";
		} else if (main.stage === 3) {
			game.load.tilemap('map', './img/lava.json', null, Phaser.Tilemap.TILED_JSON);
		} else if (main.stage === 4) {
			game.load.tilemap('map', './img/thirdday.json', null, Phaser.Tilemap.TILED_JSON);
		} else if (main.stage === 5) {
			game.load.tilemap('map', './img/sideways.json', null, Phaser.Tilemap.TILED_JSON);
		} else if (main.stage === 6) {
			game.load.tilemap('map', './img/end.json', null, Phaser.Tilemap.TILED_JSON);
		}
		
		if (main.stage === 1) {
			game.load.image('tiles', './img/oceantiles.png');
		} else if (main.stage === 5) {
			game.load.image('tiles', './img/tiles_turned.png');
		} else {
			game.load.image('tiles', './img/tiles.png');
		}

		game.load.json('lang', './lang/en-US.json');
	},
	create: function() {
		if (main.music) main.music.destroy();
		main.music = game.add.audio('music', 0.05, true);
		main.music.play();
		
		game.debug.dirty = true;
		lang = game.cache.getJSON('lang');
		textbox = game.add.image(game.camera.width / 2, game.camera.height - 10, 'textbox');
		textbox.fixedToCamera = true;
		textbox.anchor.setTo(0.5, 1);
		textboxText = game.add.text();
		textboxContinue = game.add.text(0, 0, "Enter >>");
		textboxContinue.anchor.setTo(1, 1);
		textbox.addChild(textboxText);
		textbox.addChild(textboxContinue);
		
		this.sky = game.add.tileSprite(0, 0, 800, 600, 'sky');

		if (main.clock) main.clock.destroy();
		if (main.stage % 2 === 1) {
			main.clock = game.add.audio('clock', 0.05, true);
			main.clock.play();
		}

		
		map = game.add.tilemap('map');

		map.addTilesetImage('Basic', 'tiles');
		map.setCollisionBetween(6, 9);
		map.setCollisionBetween(27, 29);
		map.setCollisionBetween(48, 120);
		map.setCollisionBetween(221, 245);
		layer = map.createLayer('Tile Layer 1');

		layer.resizeWorld();

		game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.gravity.y = 300;
		game.physics.p2.world.defaultContactMaterial.friction = 0.2;
		game.physics.p2.restitution = 0.2;
		//game.physics.p2.world.setGlobalRelaxation(1);
		game.physics.p2.convertTilemap(map, layer);
		
		var entities = this.entities = game.add.group();
		var objects = {};
		var that = this;
		map.objects['Object Layer 1'].forEach(function(element) {
			var type = element.name;
			var entity = game.add.sprite(element.x, element.y, type);
			objects[type] = entity;
			if (element.properties) {
				if (element.properties.physics) {
				game.physics.p2.enable(entity);
				entity.body.mass = element.properties.mass || 1;
				entity.body.motionState = element.properties.motionState || 1;
				if (element.properties.contact) {
					entity.body.onBeginContact.add(function(body, bodyB){
						if (body && body.sprite) {
							if (body.sprite.key === 'dude') {
								eval(element.properties.contact);
							}
						}}, that);
					}
				}
				
				if (element.properties.setup) {
					eval(element.properties.setup);
				}
				
				if (element.properties.update) {
					entity.data.update = element.properties.update;
				}
			}
			
			if (main.stage === 5) {
				entity.rotation = 90;
			}
			entities.add(entity);
		}, this); 
		this.objects = objects;

		// The player and its settings
		player = game.add.sprite(250, 550, 'dude', 0, entities);
		if (main.stage === 5) {
			player.x = 600;
			player.y = 200;
		} else 	if (main.stage === 6) {
			player.x = 100;
			player.y = 200;
		}
		game.physics.p2.enable(player);
		player.body.clearShapes();
		if (main.stage === 1) {
			player.body.addRectangle(140, 60, 0, 0, 0);
		} else {
			player.body.addRectangle(40, 145, 0, 0, 0);
			player.body.addRectangle(70, 20, 0, 60, 0);
		}
		player.body.mass = this.constants.mass;
		player.body.fixedRotation = true;
		player.body.damping = 0.3;
		player.body.angularDamping = 0.99;
		player.body.data.ccdSpeedThreshold = 0.01;
		player.body.data.ccdIterations = 5;
		
		player.data.water = false;
		//player.body.debug = true;

		var spriteMaterial = game.physics.p2.createMaterial('spriteMaterial', player.body);
		var worldMaterial = game.physics.p2.createMaterial('worldMaterial');
		var boxMaterial = game.physics.p2.createMaterial('worldMaterial');

		//  4 trues = the 4 faces of the world in left, right, top, bottom order
		game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);
		//  Here is the contact material. It's a combination of 2 materials, so whenever shapes with
		//  those 2 materials collide it uses the following settings.

		var groundPlayerCM = game.physics.p2.createContactMaterial(spriteMaterial, worldMaterial, { friction: 0.0 });
		var groundBoxesCM = game.physics.p2.createContactMaterial(worldMaterial, boxMaterial, { friction: 0.3 });
		game.physics.p2.createContactMaterial(boxMaterial, boxMaterial, { friction: 0.2 });

		//  Our two animations, walking left and right.
		if (main.stage === 1) {
			player.animations.add('walk', null, 32, true);
			player.animations.add('swim', null, 16, true);
		} else {
			player.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 32, true);
			player.animations.add('swim', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 16, true);
			player.animations.add('sit', [22], 15, true);
		}
		player.animations.add('jump', [2], 15, true);
		player.anchor.setTo(0.5, 0.5);
		
		var waterLevel = 300;
		// Create "water surface"
		if (main.stage === 1) {
			this.water = game.add.tileSprite(0, waterLevel - 80, 800, 1500, 'water');
			var bodies = _.map([this.objects.alarm, this.objects.bus], function(s) {return s.body.data;});
			bodies.push(player.body.data);
			this.setupBuoyancy(bodies, p2.vec2.fromValues(0, game.physics.p2.pxmi(waterLevel)));
		}
		
		//  The this.score
		this.scoreText = game.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });
		this.scoreText.fixedToCamera = true;
		player.body.onBeginContact.add(this.hitObject, this);
		
		if (main.stage === 3) {
			this.lava = game.add.tileSprite(0, this.lavaLevel, 800, 600, 'lava');
			this.lava.animations.add('lava', null);
			this.lava.animations.play('lava', 5, true);
		}
		
		//  Our controls.
		this.cursors = game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP,
			'down': Phaser.KeyCode.DOWN,
			'left': Phaser.KeyCode.LEFT,
			'right': Phaser.KeyCode.RIGHT,
			'enter': Phaser.KeyCode.ENTER,
			'space': Phaser.KeyCode.SPACE });
		game.camera.follow(player);
	},
	update: function() {
		if (main.textKey != null)
		{
			game.physics.p2.pause();
			if (this.cursors.enter.justDown || this.cursors.space.justDown)
			{
				this.textIndex++;
			}
			if (this.textIndex < lang[main.textKey].length)
			{
				textboxText.x = -textbox.width / 2 + 16;
				textboxText.y = -textbox.height + 16;
				textboxText.text = lang[main.textKey][this.textIndex]
				textboxContinue.x = textbox.width / 2 - 16;
				textboxContinue.y = -16;
			}
			else
			{
				main.textKey = null;
				this.textIndex = 0;
			}
			textbox.bringToTop();
			textbox.visible = true;
			return;
		}
		else
		{
			textbox.visible = false;
			game.physics.p2.resume();
		}

		this.sky.x = game.camera.x;
		this.sky.y = game.camera.y;
		this.sky.tilePosition.x = -game.camera.x;
		this.sky.tilePosition.y = -game.camera.y;

		if (main.stage === 1) {
			this.water.x = game.camera.x;
			//this.water.y = this.lavaLevel;
			this.water.tilePosition.x = -game.camera.x;
		}
		else if (main.stage === 3) {
			this.lavaLevel -= 0.1;
			this.lava.x = game.camera.x;
			this.lava.y = this.lavaLevel;
			this.lava.tilePosition.x = -game.camera.x;
			
			if (player.y > (this.lavaLevel + 10)) {
				console.log('death');
				this.lavaLevel = 950;
				game.state.start('level');
			}

		}

		if (this.objects.alarm) {
			var volume = 1.0 / (Math.abs(this.objects.alarm.body.x - player.body.x, 2) / 800);
			main.clock.volume = Math.max(0.05, Math.min(1.0, volume));
		}

		var leftTouch = this.checkSide(p2.vec2.fromValues(-1, 0)), 
			rightTouch = this.checkSide(p2.vec2.fromValues(1, 0)),
			downTouch = this.checkSide(p2.vec2.fromValues(0, 1));
		if (leftTouch || rightTouch) {
			player.body.y += 1;
		}

		player.body.velocity.x = player.data.water ? 0.98 * player.body.velocity.x : 0;
		var speed = player.data.water ? this.constants.swimAccel : this.constants.speed;
		if (this.cursors.left.isDown && !leftTouch)
		{
			//player.body.moveLeft(speed);
			speed *= -1;
			if (player.data.water) {
				speed += player.body.velocity.x;
				if (speed > this.constants.swimSpeed) {
					speed = this.constants.swimSpeed;
				}
			}
			player.body.velocity.x = speed;
			player.scale.x = main.stage === 1 ? 1 : -1;
			//  Move to the left
			if (player.data.water)
				player.animations.play('swim');
			else if (this.checkSide(p2.vec2.fromValues(0, 1)))
				player.animations.play('walk');
			else
				player.animations.play('jump');
		}
		else if (this.cursors.right.isDown && !rightTouch)
		{
			//  Move to the right
			//player.body.moveRight(speed);
			if (player.data.water) {
				speed += player.body.velocity.x;
				if (speed < -this.constants.swimSpeed) {
					speed = -this.constants.swimSpeed;
				}
			}
			player.body.velocity.x = speed;
			player.scale.x = main.stage === 1 ? -1 : 1;
			if (player.data.water)
				player.animations.play('swim');
			else if (this.checkSide(p2.vec2.fromValues(0, 1)))
				player.animations.play('walk');
			else
				player.animations.play('jump');
		}
		else
		{
			//  Stand still
			if (player.animations.currentAnim.name !== 'sit' || main.stage % 2 === 1)
				player.animations.stop();
		}

		//  Allow the player to jump if they are touching the ground.
		if (player.data.water) {
			if (main.stage != 1) {
				player.body.fixedRotation = false;
			}
			if (this.cursors.up.isDown) {
				player.body.moveUp(this.constants.dive);
			}
			else if (this.cursors.down.isDown) {
				player.body.moveDown(this.constants.dive);
			}
		}
		else {
			if (this.cursors.up.isDown && downTouch) {
				player.body.moveUp(this.constants.jump);
				player.animations.play('jump');
			}
		}
		
		var that = this;
		_.each(this.entities.children, function(entity) {eval(entity.data.update);});
	},
	render: function () {
		game.debug.body(player);
		game.debug.bodyInfo(player, 32, 32);
		_.each(this.entities.children, function(entity) {game.debug.body(entity);});
	},
	hitObject: function (body, bodyB, shapeA, shapeB, equation) {
		if (body && body.sprite)
		{
			if (body.sprite.key === 'alarm') {
				body.sprite.kill();
				result = 'You last hit: ' + body.sprite.key;
				this.score += 10;
				this.scoreText.text = 'this.score: ' + this.score;
			}
		}
	},
	checkSide: function(axis) {

		var result = false;
		var c, d;

		for (var i=0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++)
		{
			c = game.physics.p2.world.narrowphase.contactEquations[i];

			if (c.bodyA === player.body.data || c.bodyB === player.body.data)
			{
				d = p2.vec2.dot(c.normalA, axis);

				if (c.bodyA === player.body.data)
				{
					d *= -1;
				}

				if (d > 0.5)
				{
					result = true;
				}
			}
		}
		return result;
	},
	setupBuoyancy: function(bodies, plane) {
		game.physics.p2.world.on('postStep', function(){
			for (var i = 0; body = bodies[i]; ++i) {
				applyAABBBuoyancyForces(body, plane, k, c);
			}
		});

		var shapePosition = [0,0];
		var centerOfBouyancy = [0,0];
		var liftForce = [0,0];
		var viscousForce = [0,0];
		var shapeAngle = 0;
		k = 8; // up force per submerged "volume"
		c = 50; // viscosity
		var v = [0,0];
		var aabb = new p2.AABB();
	
	function applyAABBBuoyancyForces(body, planePosition, k, c){
			player.data.water = false;
			for (var i = 0; i < body.shapes.length; i++) {

				var shape = body.shapes[i];

				// Get shape world transform
				body.vectorToWorldFrame(shapePosition, shape.position);
				p2.vec2.add(shapePosition, shapePosition, body.position);
				shapeAngle = shape.angle + body.angle;

				// Get shape AABB
				shape.computeAABB(aabb, shapePosition, shapeAngle);

				var areaUnderWater;
				if(aabb.upperBound[1] < planePosition[1]){
					// Fully submerged
					p2.vec2.copy(centerOfBouyancy,shapePosition);
					areaUnderWater = shape.area;
				} else if(aabb.lowerBound[1] < planePosition[1]){
					// Partially submerged
					var width = aabb.upperBound[0] - aabb.lowerBound[0];
					var height = 0 - aabb.lowerBound[1];
					areaUnderWater = width * height;
					p2.vec2.set(centerOfBouyancy, aabb.lowerBound[0] + width / 2, aabb.lowerBound[1] + height / 2);
				} else {
					continue;
				}
				
				player.data.water = true;


				// Compute lift force
				p2.vec2.subtract(liftForce, planePosition, centerOfBouyancy);
				p2.vec2.scale(liftForce, liftForce, areaUnderWater * k);
				liftForce[0] = 0;

				// Make center of bouycancy relative to the body
				p2.vec2.subtract(centerOfBouyancy,centerOfBouyancy,body.position);

				// Viscous force
				body.getVelocityAtPoint(v, centerOfBouyancy);
				p2.vec2.scale(viscousForce, v, -c);

				// Apply forces
				body.applyForce(viscousForce,centerOfBouyancy);
				body.applyForce(liftForce,centerOfBouyancy);
				
				//console.log(body.force,liftForce, viscousForce);
			}
		}
	}
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('sky', './img/sky.png');
    game.load.image('ground', './img/platform.png');
    game.load.image('star', './img/star.png');
	game.load.image('water', './img/water.png');

    game.load.spritesheet('dude', './img/bennett.png', 110, 184);
	
	game.load.tilemap('map', './img/level.json', null, Phaser.Tilemap.TILED_JSON);

    game.load.image('tiles', './img/tiles.png');
}

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;
var constants = {speed: 300, jump: 300, mass: 10, swim: 400, dive: 200};

function create() {
	game.debug.dirty = true;
	game.add.tileSprite(0, 0, 4000, 800, 'sky');
		var waterLevel = 600;

		//game.add.tileSprite(0, waterLevel, 1920, 600, 'water');

	
	map = game.add.tilemap('map');

    map.addTilesetImage('Basic', 'tiles');
	map.setCollisionBetween(6, 8);
    map.setCollisionBetween(48, 120);

    layer = map.createLayer('Tile Layer 1');

    layer.resizeWorld();

	// game.world.setBounds(0, 0, 1920, 600);
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.gravity.y = 300;
    game.physics.p2.world.defaultContactMaterial.friction = 0.3;
    game.physics.p2.world.setGlobalStiffness(1e5);
	game.physics.p2.convertTilemap(map, layer);

    // The player and its settings
    player = game.add.sprite(100, 200, 'dude');

    //  Enable if for physics. This creates a default rectangular body.
    game.physics.p2.enable(player);
	
	    //  Player physics properties. Give the little guy a slight bounce.
	//player.body.setSize(51, 152, 23, 0);
	player.body.clearShapes();
	//var rect = new Phaser.Rectangle(0, 0, 51, 152);
	
	player.body.addRectangle(40, 150, 0, 0, 0);
	//player.body.addRectangle(70, 20, 0, 60, 0);
	
	 legs = game.add.sprite(120, 200, null);
	 game.physics.p2.enable(legs);
	 	 legs.body.mass = 90;

	//legs = game.physics.p2.createBody(player.x, player.y, 10);
	legs.body.clearShapes();
	legs.body.addRectangle(100, 50);
	var lock = game.physics.p2.createLockConstraint(player, legs, [0, -60]);
	lock.collideConnected = false;

	game.physics.p2.addConstraint(lock);
	legs.body.debug = true;
	legs.body.fixedRotation = true;
	//player.body.fixedRotation = true;

	player.body.mass = constants.mass;
    
    player.body.damping = 0.3;
	legs.body.damping = 0.3;
	player.body.angularDamping = 0.99;
	legs.body.angularDamping = 0.99;
	
	player.data.water = false;
	player.body.debug = true;

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
    player.animations.add('walk', null, 32, true);
	player.animations.add('jump', [2], 15, true);
	player.anchor.setTo(0.5, 0.5);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    //stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 4; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(900 + i * 100, 300, 'star');
        //  Let gravity do its thing
        //star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        //star.body.bounce.y = 0.2 + Math.random() * 0.1;

        game.physics.p2.enable(star);
        star.body.mass = 6;
        // box.body.static = true;
        star.body.setMaterial(boxMaterial);
    }
	
	// Create "water surface"
	var bodies = _.map(stars.children, function(s) {return s.body.data;});
	bodies.push(player.body.data);
	//setupBuoyancy(bodies, p2.vec2.fromValues(0, game.physics.p2.pxmi(waterLevel)));

    //  The score
    //scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
	game.camera.follow(player);
    
}

function update() {

    //  Collide the player and the stars with the platforms
    //game.physics.arcade.collide(player, platforms);
    //game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    //game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
		if (checkIfCanJump() || player.data.water)
			player.animations.play('walk');
		else
			player.animations.play('jump');
		legs.body.moveLeft(constants.speed);
		player.body.moveLeft(constants.speed);
		player.scale.x = -1;
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        legs.body.moveRight(constants.speed);
		player.body.moveRight(constants.speed);
		player.scale.x = 1;
		if (checkIfCanJump() || player.data.water)
			player.animations.play('walk');
		else
			player.animations.play('jump');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        //player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
	if (player.data.water) {
		player.body.fixedRotation = false;
		if (cursors.up.isDown)
			player.body.moveUp(constants.swim);
		else if (cursors.down.isDown)
			player.body.moveDown(constants.swim);
	}
    else {
		if (cursors.up.isDown && checkIfCanJump()) {
			legs.body.moveUp(constants.jump);
			player.body.moveUp(constants.jump);
			player.animations.play('jump');
		}
		//player.body.data.angle = 0
		//player.body.setZeroRotation();
		//player.body.fixedRotation = true;
	}


}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}

function render () {
	
            game.debug.body(player);
            game.debug.bodyInfo(player, 32, 32);
			game.debug.body(legs);
	
}

var yAxis = p2.vec2.fromValues(0, 1);
function checkIfCanJump() {

    var result = false;
	var c, d;

    for (var i=0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++)
    {
        c = game.physics.p2.world.narrowphase.contactEquations[i];

        if (c.bodyA === legs.body.data || c.bodyB === legs.body.data)
        {
            d = p2.vec2.dot(c.normalA, yAxis);

            if (c.bodyA === legs.body.data)
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

}


function setupBuoyancy(bodies, plane) {
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
	k = 1.6; // up force per submerged "volume"
	var c = 0.7; // viscosity
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
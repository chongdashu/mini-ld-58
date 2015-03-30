/**
 * Mini LD #58 Game
 * 
 * Copyright (c) 2015 chongdashu
 * http://github.com/chongdashu/mini-ld-58
 */

(function() {
    "use strict";

/**
 * GameState
 * @class GameState
 * @constructor
 **/
var GameState = function() {
  this.initialize();
};
var p = GameState.prototype;
GameState.prototype.constructor = GameState;
    
    // Constants
    // ---------
    GameState.GAME_WIDTH = 480;
    GameState.GAME_HEIGHT = 320;

    GameState.GAME_HALF_WIDTH = GameState.GAME_WIDTH/2;
    GameState.GAME_HALF_HEIGHT = GameState.GAME_HEIGHT/2;

    GameState.STATE_START = "start";
    GameState.STATE_PLAY = "play";
    GameState.STATE_GAMEOVER = "gameover";



    // Variables
    // --------------
    p.gameState = GameState.STATE_START;
    p.heroMaxSpeed = 250;
    p.bulletSpeed = 800;
    p.shotDelay = 500;
    p.lastShotTime = null;
    p.paddleMargin = 32;
    p.paddleSpeedDefault = 100;
    p.autoPaddles = true;
    p.jumpSpeed = 400;
    p.enemiesKilled = 0;
    p.retries = 0;
    p.lives = 0;
    p.maxLives = 3;
    p.isMusicEnabled = true;
    p.isSoundEnabled = true;

    // Timers 
    // ------
    p.enemySpawnTimer = 0;

    // Sprites
    // -------
    p.hero = null;
    p.backgroundSky = null;
    p.backgroundMountain = null;
    p.rightPaddle = null;
    p.leftPaddle = null;

    // Text
    // ----

    // Groups
    // ------
    p.background = null;
    p.ground = null;
    p.bullets = null;
    p.paddles = null;
    p.enemies = null;
    p.hud = null;
    p.platforms = null;

    // Audio
    // -----
    p.music = null;

    // Emitters
    // --------
    p.paddleEmitter = null;

    // Bitmaps
    // -------
    p.heightMarkers = null;


    p.initialize = function() {
        console.log("[GameState], initialize()");
    };

    // @phaser
    p.preload = function() {
        console.log("[GameState], preload()");

        // Bounds
        // ------
        this.game.world.setBounds(
            -GameState.GAME_HALF_WIDTH,
            -GameState.GAME_HALF_HEIGHT,
            GameState.GAME_WIDTH, GameState.GAME_HEIGHT);

        // Sprites
        // -------
        this.game.load.image("sky", "assets/sky.png");
        this.game.load.image("mountain", "assets/mountain.png");
        this.game.load.image("tile", "assets/tile.png");
        this.game.load.image("paddle", "assets/paddle.png");
        this.game.load.image("tile-platform", "assets/tile-platform.png");
        this.game.load.image('paddle-particle-1', 'assets/paddle-particle-1.png');
        this.game.load.image('paddle-particle-2', 'assets/paddle-particle-2.png');

        // Audio
        // -----
        this.game.load.audio("shoot-1", "assets/shoot1.wav");
        this.game.load.audio("shoot-2", "assets/shoot2.wav");
        this.game.load.audio("shoot-3", "assets/shoot3.wav");
        this.game.load.audio("music", "assets/music-digital-voyage.mp3");
        
        // spritesheets
        // ------------
        this.game.load.spritesheet("hero", "assets/hero.png", 32, 46);
        this.game.load.spritesheet("cowboy", "assets/cowboy-lg.png", 64, 64, 26);
        this.game.load.spritesheet("bullet", "assets/projectile.png", 16,16);
        this.game.load.spritesheet("enemy-blue", "assets/enemy-blue.png", 32, 32);

        
    };

    p.doGameOver = function() {
        this.lives = 0;
        this.music.pause();
        this.hero.body.velocity.y = -500;
        this.hero.body.collideWorldBounds = false;
        this.hero.body.angularVelocity = Phaser.Math.degToRad(7200);

        this.paddles.forEach(function (paddle) {
            paddle.body.reset();
        });

        this.gameState = GameState.STATE_GAMEOVER;

        
    };

    // -----------------------------------------


    // @phaser
    p.create = function() {
        console.log("[GameState], create()");

        this.createMusic();
        this.createPhysics();
        this.createKeyCapture();
        this.createBackground();
        this.createGround();
        this.createPlatforms();
        this.createHero();
        this.createEnemies();
        this.createBullets();
        this.createPaddles();
        this.createEmitters();
        this.createHud();

        this.reset();

        // this.createHeightMarkers();
    };




    p.createMusic = function() {
        this.music = this.game.sound.add("music",0.3,true);
    };

    p.reset = function() {
        this.hero.body.reset();
        this.hero.visible = false;
        this.gameState = GameState.STATE_START;
        this.lives = 3;
        this.maxLives = 3;

        this.enemies.removeAll();

        this.rightPaddle.position.set (GameState.GAME_HALF_WIDTH, 0);
        this.leftPaddle.position.set (-GameState.GAME_HALF_WIDTH, 0);

        this.rightPaddle.position.x -= this.rightPaddle.width;
        this.leftPaddle.position.x += this.leftPaddle.width;

    };

    p.doStart = function() {
        console.log("[GameState], start();");
        this.rightPaddle.body.velocity.y = this.paddleSpeedDefault;
        this.leftPaddle.body.velocity.y = this.paddleSpeedDefault;
       

        this.gameState = GameState.STATE_PLAY;
        this.hero.reset(0,0);
        this.hero.rotation = 0;
        this.hero.position.set(0,-100);
        this.music.play();

    };

    p.resetEnemySpawnTimer = function() {
        this.enemySpawnTimer = 10000 - this.enemiesKilled*100;
    };

    p.createHud = function() {
        this.hud = this.game.add.group();

        this.hud.add(this.livesText=this.game.make.text(-GameState.GAME_HALF_WIDTH+64,-GameState.GAME_HALF_HEIGHT+32+this.hud.length*32, "Lives: ", { font: "8pt Monaco" }));
        this.hud.add(this.enemiesKilledText=this.game.make.text(-GameState.GAME_HALF_WIDTH+64,-GameState.GAME_HALF_HEIGHT+32+this.hud.length*16, "Enemies Killed: ", { font: "8pt Monaco" }));

        this.hud.add(this.startText=this.game.make.text(0,96, "Press Space To Start", { font: "16pt Monaco", align: "center"}));
        this.hud.add(this.gameOverText=this.game.make.text(0,96, "Game Over!", { font: "16pt Monaco", align: "center"}));
        
        this.startText.anchor.set(0.5);
        this.gameOverText.anchor.set(0.5);
    };

    // This function draws horizontal lines across the stage
    p.createHeightMarkers = function() {
        // Create a bitmap the same size as the stage
        this.heightMarkers = this.game.add.bitmapData(this.game.width, this.game.height);

        // These functions use the canvas context to draw lines using the canvas API
        var y=0;
        for(y = this.game.height; y >= 0; y -= 32) {
            this.heightMarkers.context.beginPath();
            this.heightMarkers.context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            this.heightMarkers.context.moveTo(-GameState.GAME_WIDTH*2, y);
            this.heightMarkers.context.lineTo(GameState.GAME_WIDTH, y);
            this.heightMarkers.context.stroke();
        }

        this.game.add.image(-GameState.GAME_HALF_WIDTH, -GameState.GAME_HALF_HEIGHT, this.heightMarkers);
    };


    p.createEmitters = function() {
        this.paddleEmitter= this.game.add.emitter(0, 0, 50);
        this.paddleEmitter.makeParticles(["paddle-particle-1", "paddle-particle-2"]);
        this.paddleEmitter.gravity = this.game.physics.arcade.gravity.y;
    };

    p.createPaddles = function() {
        console.log("[GameState], createPaddles()");

        this.paddles =  this.game.add.group();
        this.paddles.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        this.rightPaddle = this.paddles.create(GameState.GAME_HALF_WIDTH, 0, "paddle");
        this.leftPaddle = this.paddles.create(-GameState.GAME_HALF_WIDTH, 0, "paddle");

        this.rightPaddle.position.x -= this.rightPaddle.width;
        this.leftPaddle.position.x += this.leftPaddle.width;

        this.paddles.forEach(function (paddle) {
            paddle.body.allowGravity = false;
            paddle.body.immovable = true;
            paddle.anchor.set(0.5);
            paddle.body.mass = 10000;
            paddle.hitTimer = 0;
        });



    };

    p.createKeyCapture = function() {
        // Capture certain keys to prevent their default actions in the browser.
        // This is only necessary because this is an HTML5 game. Games on other
        // platforms may not need code like this.
        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN,
            Phaser.Keyboard.SPACEBAR,
            Phaser.Keyboard.Z,
        ]);
    };

    p.createBullets = function() {
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    };

    p.createPhysics = function() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 800;
    };

    p.createBackground = function() {
        console.log("[GameState], createBackground()");

        this.background = this.game.add.group();

        this.backgroundSky = this.background.create(0, 0, "sky");
        this.backgroundSky.anchor.set(0.5, 0.5);

        this.backgroundMountain = this.background.create(0, 0, "mountain");
        this.backgroundMountain.anchor.set(0.5, 0.5);
    };

    p.createPlatforms = function() {
        this.platforms = this.game.add.group();
        this.platforms.enableBody = true;
        this.platforms.physicsBodyType = Phaser.Physics.ARCADE;

        var map = [
            1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ];

        var platform = null;
        for (var i = 0; i < map.length; i++) {
            if (map[i] == 1) {
                var x = i % 15;
                var y = Math.floor(i / 15);

                console.log ("tile at [%s,%s]", x, y);
                platform = this.platforms.create(-GameState.GAME_HALF_WIDTH + x*32 + 16, -GameState.GAME_HALF_HEIGHT + y*32+16, "tile-platform");
                platform.anchor.set(0.5);
                platform.name = "platform_" + i;
                platform.body.allowGravity = false;
                platform.body.immovable = true;



            }
        }

    };

    p.createGround = function() {
        this.ground = this.game.add.group();
        this.ground.enableBody = true;
        this.ground.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < GameState.GAME_WIDTH/32; i++) {
            var ground = this.ground.create(16+ -GameState.GAME_HALF_WIDTH+32*i, GameState.GAME_HALF_HEIGHT-16, "tile");
            ground.anchor.set(0.5);
            ground.name = "ground_" + i;
            ground.body.setSize(32, 32, 0, 16);
        }



        // this.platform = this.ground.create(0,32, "tile-platform");
        // this.platform.name = "platform";
        // this.platform.anchor.set(0.5);

        this.ground.setAll("body.allowGravity", false);
        this.ground.setAll("body.immovable", true);



           
    };

    p.createEnemies = function() {
        this.enemies = this.game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
    };

    p.createEnemy = function(key,x,y, velocityX, velocityY) {
        x = x === null ? 0.0 : x;
        y = y === null ? 0.0 : y;
        velocityX = velocityX === null ? 0.0 : velocityX;
        velocityY = velocityY === null ? 0.0 : velocityY;

        var enemy = this.enemies.create(x,y,key);
        enemy.animations.add("walk", [0,1,2,3,4,5], 8, true);
        enemy.animations.play("walk");
        enemy.body.velocity.set(velocityX, velocityY);
        enemy.body.collideWorldBounds = true;
        enemy.body.bounce.set(1,0);
        enemy.body.setSize(16, 16, 0, 8);
        enemy.anchor.set(0.5);
        enemy.defaultVelocityX = velocityX;

    };

    p.createHero = function() {
        this.hero = this.game.add.sprite(0,0,"cowboy");
        this.hero.anchor.set(0.25);

        // this.hero.animations.add("idle", [0,1], 2, true);
        // this.hero.animations.add("jump-up", [2], 1, true);
        // this.hero.animations.add("jump-down", [3], 1, true);

        this.hero.animations.add("idle", [0,1,2,3], 4, true);
        this.hero.animations.add("shoot", [4,5,6,7], 10).onComplete.add(this.onAnimationShootComplete, this);
        this.hero.animations.add("walk", [8,9,10,11], 10, true);
        this.hero.animations.add("jump-shoot", [12,13,14,15], 10, false);
        this.hero.animations.add("jump-up", [16], 1, true);
        this.hero.animations.add("jump-down", [16], 1, true);

        this.game.physics.enable(this.hero, Phaser.Physics.ARCADE);
        this.hero.body.setSize(32, 48, -8, + 12);
        this.hero.body.collideWorldBounds = true;
        this.hero.hurtTimer = 0;
        this.hero.shootTimer = 0;
        // this.hero.animations.play("jump-down");
        
    };

    p.createBullet = function(x,y,velocityX,velocityY) {
        
        this.lastShotTime = this.game.time.now;

        x = x === null ? 0.0 : x;
        y = y === null ? 0.0 : y;
        velocityX = velocityX === null ? 0.0 : velocityX;
        velocityY = velocityY === null ? 0.0 : velocityY;

        var bullet = this.bullets.create(x, y, "bullet");
        bullet.anchor.set(0.5);
        bullet.body.allowGravity = false;
        bullet.body.velocity.set(velocityX, velocityY);
        // bullet.body.collideWorldBounds = true;
        bullet.body.bounce.set(1);  // 100% energy return
        bullet.animations.add("default", [0,1,2,3,4], 10, false);


    };

    p.onAnimationShootComplete = function(sprite) {
        // console.log("onAnimationShootComplete(), o=%o", o);
        sprite.animations.play("idle");

    };


    // -----------------------------------------

    // @phaser
    p.update = function() {
        // console.log("[GameState], update()");

        // console.log(this.gameState);
        
        this.updateCollisions();
        if (this.gameState == GameState.STATE_PLAY) {

            this.updateTimers();
            // this.updatePlatform();
            this.updateHero();
            this.updateEnemies();
            this.updatePaddles();
            
            this.updateInput();
        }

        else if (this.gameState == GameState.STATE_START) {
            if (this.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, 1)) {
                this.doStart();
            }
        }

        else if (this.gameState == GameState.STATE_GAMEOVER) {
            if (this.hero.position.y > GameState.GAME_HALF_HEIGHT) {
                this.reset();

            }
        }

        this.updateHud();
    
    };

    p.updatePlatform = function() {
        
        // if (this.platform.body.touching.up) {
        //     this.platform.isPlayerTouching = true;
            
        // }
        // else if (this.platform.isPlayerTouching && !this.platform.body.touching.up) {
        //     this.platform.kill();
        // }
    };

    p.updateTimers = function() {
        this.enemySpawnTimer -= this.game.time.elapsed;
        if (this.enemySpawnTimer <= 0) {
            this.createEnemy(
                this.game.rnd.pick(["enemy-blue"]),
                this.game.rnd.pick([-32,32]), -GameState.GAME_HALF_HEIGHT, // position
                this.game.rnd.pick([-120,120]), 0); // velocity
            this.resetEnemySpawnTimer();
        }
    };

    p.updateHud = function() {
        this.livesText.text = "Lives: " + this.lives + "/" + this.maxLives;
        this.enemiesKilledText.text = "Enemies Killed: " + this.enemiesKilled;
        
        this.startText.visible = (this.gameState == GameState.STATE_START);
        this.gameOverText.visible = (this.gameState == GameState.STATE_GAMEOVER);

    };

    p.updateEnemies = function() {
        this.enemies.forEach(function(enemy) {
            if (enemy.body.velocity.x > 0) {
                enemy.scale.x = -1;
            }
            else {
                enemy.scale.x = 1;
            }
        });
    };

    p.updatePaddles = function() {
        var _this = this;
        this.paddles.forEach(function(paddle) {

            paddle.hitTimer = Math.max(0, paddle.hitTimer - _this.game.time.elapsed);

            

            if (paddle.hitTimer > 0 ) {
                paddle.body.velocity.y=0;
                return;
            }
            else {
                if (paddle.storedVelocityY) {

                    paddle.body.velocity.y = Math.sign(paddle.storedVelocityY)*_this.paddleSpeedDefault;
                    paddle.storedVelocityY = null;
                }
            
            }

            if (paddle.position.y - paddle.height/2 <= -GameState.GAME_HALF_HEIGHT) {
                paddle.body.velocity.y = 100;
            }
            if (paddle.position.y + paddle.height/2 >= GameState.GAME_HALF_HEIGHT +48) {
                paddle.body.velocity.y = -100;
            }

            if (paddle.storedVelocityY) {
                if (!paddle.body.wasTouching.up) {
                    paddle.body.velocity.y = Math.sign(paddle.storedVelocityY)*_this.paddleSpeedDefault;
                    console.log(paddle.body.velocity.y);
                    paddle.storedVelocityY = null;
                }

            }

  
       
        });
    };

    p.updateInput = function() {
        
        if (this.leftInputIsActive()) {
            // If the LEFT key is down, set the player velocity to move left
            this.hero.body.velocity.x = -this.heroMaxSpeed;
        } else if (this.rightInputIsActive()) {
            // If the RIGHT key is down, set the player velocity to move right
             this.hero.body.velocity.x = this.heroMaxSpeed;
        } else {
            // Stop the player from moving horizontally
            var hurtOrShoot = this.hero.hurtTimer > 0 || this.hero.shootTimer > 0;
            this.hero.body.velocity.x = hurtOrShoot ? this.hero.body.velocity.x : 0;
        }

        if (this.shootInputIsActive()) {
            this.doPlayerShoot();
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.O)) {
            this.autoPaddles = false;
            this.paddles.forEach(function(paddle) {
                paddle.body.velocity.y = 0;
                paddle.position.y++;
            });
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.P)) {
            this.autoPaddles = false;
            this.paddles.forEach(function(paddle) {
                paddle.body.velocity.y = 0;
                paddle.position.y--;
            });
        }

        // Jump logic
        // ----------
    
        // Jump!
        if (this.jumps > 0 && this.upInputIsActive(5)) {
            
            this.hero.body.velocity.y = -this.jumpSpeed;
            this.jumping = true;
        }

        // Reduce the number of available jumps if the jump input is released
        if (this.jumping && this.upInputReleased()) {
            this.jumps--;
            this.jumping = false;
        }

        // Debug 
        // -----
        if (this.input.keyboard.downDuration(Phaser.Keyboard.E, 1)) {
            this.createEnemy("enemy-blue", 0, 0, -120, 0);
        }

        if (this.input.keyboard.downDuration(Phaser.Keyboard.G, 1)) {
            this.doGameOver();
        }

        

    };

    // This function returns true when the player releases the "jump" control
    p.upInputReleased = function() {
        var released = false;

        released = this.input.keyboard.upDuration(Phaser.Keyboard.UP);
        released |= this.game.input.activePointer.justReleased();

        return released;
    };

    // This function should return true when the player activates the "jump" control
    // In this case, either holding the up arrow or tapping or clicking on the center
    // part of the screen.
    p.upInputIsActive = function(duration) {

        var isActive = false;

        isActive = this.input.keyboard.downDuration(Phaser.Keyboard.UP, duration);
        isActive |= (this.game.input.activePointer.justPressed(duration + 1000/60) &&
            this.game.input.activePointer.x > this.game.width/4 &&
            this.game.input.activePointer.x < this.game.width/2 + this.game.width/4);

        

        return isActive;
    };

    p.doPlayerShoot = function() {
        if (this.game.time.now - this.lastShotTime < this.shotDelay) {
            return;
        }

        this.hero.animations.play("shoot");
        this.createBullet(this.hero.x, this.hero.body.center.y, this.hero.scale.x*this.bulletSpeed,0);
        this.game.sound.play(this.game.rnd.pick(["shoot-1", "shoot-2", "shoot-3"]), 0.2);

        this.hero.body.velocity.x = -this.hero.scale.x * 300;
        this.hero.shootTimer = 100;

    };

    // This function should return true when the player activates the "jump" control
    // In this case, either holding the up arrow or tapping or clicking on the center
    // part of the screen.
    p.shootInputIsActive = function(duration) {
        var isActive = false;

        duration = 1;

        isActive = this.input.keyboard.downDuration(Phaser.Keyboard.Z, duration);
        isActive = this.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, duration);
        isActive |= (this.game.input.activePointer.justPressed(duration + 1000/60) &&
            this.game.input.activePointer.x > this.game.width/4 &&
            this.game.input.activePointer.x < this.game.width/2 + this.game.width/4);

        return isActive;
    };

    // This function should return true when the player activates the "go left" control
    // In this case, either holding the right arrow or tapping or clicking on the left
    // side of the screen.
    p.leftInputIsActive = function() {
        var isActive = false;

        isActive = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
        isActive |= this.input.keyboard.isDown(Phaser.Keyboard.A);
        isActive |= (this.game.input.activePointer.isDown &&
            this.game.input.activePointer.x < this.game.width/4);

        return isActive;
    };

    // This function should return true when the player activates the "go right" control
    // In this case, either holding the right arrow or tapping or clicking on the right
    // side of the screen.
    p.rightInputIsActive = function() {
        var isActive = false;

        isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
        isActive |= this.input.keyboard.isDown(Phaser.Keyboard.D);
        isActive |= (this.game.input.activePointer.isDown &&
            this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

        return isActive;
    };

    p.updateHero = function() {

        this.hero.isOnGround = this.hero.body.touching.down;
        this.hero.hurtTimer = Math.max(0,this.hero.hurtTimer-this.game.time.elapsed);
        this.hero.shootTimer = Math.max(0,this.hero.shootTimer-this.game.time.elapsed);

        // console.log(this.hero.shootTimer);


        if (this.hero.hurtTimer > 0 ) {
            this.hero.tint = 0xff0000 * (this.hero.hurtTimer/3000);
        }
        else {
            this.hero.tint = 0xffffff;
        }
        

        // Jumping
        // -------
        if (this.hero.isOnGround) {
            this.jumps = 2;
            this.jumping = false;
        }

        // Animation
        // ---------
        if (this.hero.animations.currentAnim.name=="shoot") {
            return;
        }
        if (this.hero.body.velocity.x > 0) {
            if (this.hero.hurtTimer === 0) {
                this.hero.scale.x = 1;
            }
        }
        else if (this.hero.body.velocity.x < 0) {
            if (this.hero.hurtTimer === 0) {
                this.hero.scale.x = -1;
            }
        }
        

        if (this.hero.isOnGround) {
            if (this.hero.body.velocity.x === 0) {
                this.hero.animations.play("idle");
            }
            else {
                this.hero.animations.play("walk");
            }

        }
        else {
            if (this.hero.body.velocity.y > 0) {
                
                this.hero.animations.play("jump-down");
            }
            else if (this.hero.body.velocity.y < 0) {
                
                this.hero.animations.play("jump-up");
            }

        }
        
    };

    p.updateCollisions = function() {
        this.game.physics.arcade.collide(this.hero, this.ground, this.onHeroGroundCollide, this.onHeroGroundProcess, this);
        this.game.physics.arcade.collide(this.hero, this.paddles, this.onHeroPaddleCollide, this.onHeroPaddleProcess, this);
        this.game.physics.arcade.collide(this.hero, this.enemies, this.onHeroEnemyCollide, this.onHeroEnemyProcess, this);
        this.game.physics.arcade.collide(this.hero, this.platforms);
        this.game.physics.arcade.collide(this.paddles, this.ground, this.onPaddleGroundCollide, null, this);
        this.game.physics.arcade.collide(this.bullets, this.paddles, this.onBulletPaddleCollide, null, this);
        this.game.physics.arcade.collide(this.bullets, this.enemies, this.onBulletEnemyCollide, null, this);
        this.game.physics.arcade.collide(this.enemies, this.ground);
        this.game.physics.arcade.collide(this.enemies, this.platforms);
        
        // this.game.physics.arcade.collide(this.bullets, this.ground, this.onBulletGroundCollide, null, this);
    };

    p.onHeroEnemyProcess = function() {
        return this.lives > 0;
    };

    p.onHeroPaddleProcess = function() {
        return this.lives > 0;
    };

    p.onHeroEnemyCollide = function(hero, enemy) {
        hero.position.y -= 1;
        
        hero.body.velocity.y = 200*-Math.sin(Phaser.Math.degToRad(45));

        
        if (hero.body.touching.left) {
            hero.body.velocity.x = 200*Math.cos(Phaser.Math.degToRad(45));
            enemy.body.velocity.x = -120;
            if (hero.hurtTimer === 0){
                hero.hurtTimer += 1000;
                this.lives--;
            }
            
        }
        
        else if (hero.body.touching.right) {
            hero.body.velocity.x = -200*Math.cos(Phaser.Math.degToRad(45));
            enemy.body.velocity.x = 120;
            if (hero.hurtTimer === 0){
                hero.hurtTimer += 1000;
                this.lives--;
            }
            
        }

        else if (hero.body.touching.up) {
            hero.body.velocity.x = -200*Math.cos(Phaser.Math.degToRad(45));
            enemy.body.velocity.x = 120;
            if (hero.hurtTimer === 0){
                hero.hurtTimer += 1000;
                this.lives--;
            }
        }

        if (this.lives <= 0) {
            this.doGameOver();
        }

        
        // console.log(enemy.body.velocity.x);
    };

    p.onHeroPaddleCollide = function(hero, paddle) {
        if (paddle.body.touching.up) {
            // console.log("touch.");
            paddle.storedVelocityY = paddle.body.velocity.y;
            paddle.body.velocity.y = paddle.storedVelocityY * 0.95;
        }
    };

    p.onBulletEnemyCollide = function(bullet, enemy) {
        if (bullet.isActivated) {
            this.enemies.remove(enemy, true);
            this.enemiesKilled++;
            // enemy.body = null;
            // enemy.kill();

        }
        else {
            if (enemy.body.touching.left) {
                enemy.body.velocity.x = 120;
            }
            else if (enemy.body.touching.right) {
                enemy.body.velocity.x = -120;
            }
        }

        bullet.body = null;
        bullet.play("default", null, false, true);
        bullet.tint = 0xffffff;
        
    };

    p.onBulletGroundCollide = function(bullet, ground) {
        var relativeIntersectY = ground.y - bullet.y;
        var normalizedRelativeIntersectY = (relativeIntersectY) / bullet.height/2;
        var angleInDeg = normalizedRelativeIntersectY * 90;


        bullet.body.velocity.x = this.bulletSpeed*xMod*Math.cos(Phaser.Math.degToRad(angleInDeg));
        bullet.body.velocity.y = this.bulletSpeed*-Math.sin(Phaser.Math.degToRad(angleInDeg));
    };

    p.onBulletPaddleCollide = function(bullet, paddle) {
        console.log("[GameState] onBulletPaddleCollide()");

        var relativeIntersectY = bullet.y - paddle.y;
        var normalizedRelativeIntersectY = (relativeIntersectY) / (paddle.height/2);
        var angleInDeg = normalizedRelativeIntersectY * 90;

        console.log("relativeIntersectY=%s", relativeIntersectY);
        console.log("normalizedRelativeIntersectY=%s", normalizedRelativeIntersectY);
        console.log("angleInDeg=%s", angleInDeg);

        var xMod = bullet.x > paddle.x ? 1 : -1;
        console.log("xMod=%s", xMod);

        bullet.body.velocity.x = this.bulletSpeed*xMod*Math.cos(Phaser.Math.degToRad(angleInDeg));
        bullet.body.velocity.y = this.bulletSpeed*Math.sin(Phaser.Math.degToRad(angleInDeg));

        console.log("bullet.body.velocity=(%s,%s(", bullet.body.velocity.x, bullet.body.velocity.y);
        
        this.paddleEmitter.x = (bullet.x + paddle.x)/2;
        this.paddleEmitter.y = (bullet.y + paddle.y)/2;

        console.log("this.paddleEmitter=(%s,%s)", this.paddleEmitter.x, this.paddleEmitter.y);

        this.paddleEmitter.start(true, 2000, null, 5);

        bullet.isActivated = true;
        bullet.tint = 0xff0000;

        if (paddle.hitTimer === 0) {
            paddle.storedVelocityY = paddle.body.velocity.y;
        }
        paddle.hitTimer = Math.min(3000, paddle.hitTimer += 750);
        
    };

    p.onPaddleGroundCollide = function(paddle, ground) {
        console.log("[GameState], onPaddleGroundCollide, paddle=%o", paddle);
        paddle.body.velocity.x = -this.paddleSpeedDefault;
        return false;
    };

    p.onHeroGroundProcess = function(hero, ground) {
        return this.lives > 0;
    };

    p.onHeroGroundCollide = function(hero, ground) {
        // console.log("%o", ground);
        hero.isOnGround = true;
        if (hero.hurtTimer > 0) {
            hero.body.velocity.x = 0;
        }

    };

    // @phaser
    p.render = function() {
        // console.log("[GameState], render()");
        // this.renderDebug();
    };

    p.renderDebug = function() {
        this.game.debug.body(this.hero);

        var _this = this;
        
        this.bullets.forEach(function (bullet) {
            _this.game.debug.body(bullet);
        });

        this.ground.forEach(function (tile) {
            _this.game.debug.body(tile);
        });

        this.paddles.forEach(function (paddle) {
            _this.game.debug.body(paddle);
        });

        this.enemies.forEach(function (enemy) {
            _this.game.debug.body(enemy);
        });

        this.game.debug.spriteInfo(this.leftPaddle, 32, 32);
        this.game.debug.spriteInfo(this.rightPaddle, 32, 132);

    };


   
// link 
window.GameState = GameState;

}());



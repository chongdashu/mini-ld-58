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
    GameState.GAME_WIDTH = 800;
    GameState.GAME_HEIGHT = 600;

    GameState.GAME_HALF_WIDTH = GameState.GAME_WIDTH/2;
    GameState.GAME_HALF_HEIGHT = GameState.GAME_HEIGHT/2;

    // Variables
    // --------------
    p.heroMaxSpeed = 250;
    p.bulletSpeed = 500;
    p.shotDelay = 1000;
    p.lastShotTime = null;
    p.paddleMargin = 32;
    p.paddleSpeedDefault = 100;

    // Sprites
    // -------
    p.hero = null;
    p.backgroundSky = null;
    p.backgroundMountain = null;
    p.rightPaddle = null;
    p.leftPaddle = null;

    // Groups
    // ------
    p.background = null;
    p.ground = null;
    p.bullets = null;
    p.paddles = null;


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
        
        // spritesheets
        // ------------
        this.game.load.spritesheet("hero", "assets/hero.png", 32, 46);
        this.game.load.spritesheet("cowboy", "assets/cowboy-lg.png", 64, 64, 26);
        this.game.load.spritesheet("bullet", "assets/projectile.png", 16,16);
        
    };

    // -----------------------------------------


    // @phaser
    p.create = function() {
        console.log("[GameState], create()");

        this.createPhysics();
        this.createKeyCapture();
        this.createBackground();
        this.createGround();
        this.createHero();
        this.createBullets();
        this.createPaddles();

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
        });

        this.rightPaddle.body.velocity.y = this.paddleSpeedDefault;
        this.leftPaddle.body.velocity.y = this.paddleSpeedDefault;


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
            Phaser.Keyboard.SPACEBAR
        ]);
    };

    p.createBullets = function() {
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    };

    p.createPhysics = function() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 500;
    };

    p.createBackground = function() {
        console.log("[GameState], createBackground()");

        this.background = this.game.add.group();

        this.backgroundSky = this.background.create(0, 0, "sky");
        this.backgroundSky.anchor.set(0.5, 0.5);

        this.backgroundMountain = this.background.create(0, 0, "mountain");
        this.backgroundMountain.anchor.set(0.5, 0.5);
    };

    p.createGround = function() {
        this.ground = this.game.add.group();
        this.ground.enableBody = true;
        this.ground.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < 30; i++) {
            var ground = this.ground.create(-400+32*i, 300-16, "tile");
            ground.anchor.set(0.5);
            ground.name = "ground_" + i;
            ground.body.setSize(32, 32, 0, 16);
        }

        this.ground.setAll("body.allowGravity", false);
        this.ground.setAll("body.immovable", true);
           
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
        this.updateInput();
        this.updateHero();
        this.updatePaddles();
        this.updateCollisions();
    };

    p.updatePaddles = function() {
        var _this = this;
        this.paddles.forEach(function(paddle) {
            if (paddle.position.y - paddle.height/2 <= -GameState.GAME_HALF_HEIGHT) {
                paddle.body.velocity.y = 100;
            }
            if (paddle.position.y + paddle.height/2 >= GameState.GAME_HALF_HEIGHT - _this.ground.height) {
                paddle.body.velocity.y = -100;
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
            this.hero.body.velocity.x = 0;
        }

        if (this.shootInputIsActive()) {
            this.doPlayerShoot();
        }
    };

    p.doPlayerShoot = function() {
        if (this.game.time.now - this.lastShotTime < this.shotDelay) {
            return;
        }

        this.hero.animations.play("shoot");
        this.createBullet(this.hero.x, this.hero.body.center.y, this.hero.scale.x*this.bulletSpeed,0);
    };

    // This function should return true when the player activates the "jump" control
    // In this case, either holding the up arrow or tapping or clicking on the center
    // part of the screen.
    p.shootInputIsActive = function(duration) {
        var isActive = false;

        duration = 1;

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
        // console.log(this.hero.body.velocity.y, this.hero.onGround, this.hero.animations.currentAnim.name);
        if (this.hero.animations.currentAnim.name=="shoot") {
            return;
        }
        if (this.hero.onGround) {
            // this.hero.animations.play("idle");
            if (this.hero.body.velocity.x > 0) {
                this.hero.animations.play("walk");
                this.hero.scale.x = 1;
            }
            else if (this.hero.body.velocity.x < 0) {
                this.hero.animations.play("walk");
                this.hero.scale.x = -1;
            }
            else {
                this.hero.animations.play("idle");
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
        this.game.physics.arcade.collide(this.hero, this.ground, this.onHeroGroundCollide, null, this);
        this.game.physics.arcade.collide(this.paddles, this.ground, this.onPaddleGroundCollide, null, this);
        this.game.physics.arcade.collide(this.bullets, this.paddles, this.onBulletPaddleCollide, this.onBulletPaddleJustCollide, this);
    };

    p.onBulletPaddleJustCollide = function(bullet, paddle) {
        console.log("[GameState] onBulletPaddleJustCollide()");
        console.log("bullet.body.velocity=%s", bullet.body.velocity.x);
        bullet.body.velocity.x *= -1.1;
        return false;

    };

    p.onBulletPaddleCollide = function(bullet, paddle) {
        console.log("[GameState] onBulletPaddleCollide()");
        
    };

    p.onPaddleGroundCollide = function(paddle, ground) {
        console.log("[GameState], onPaddleGroundCollide, paddle=%o", paddle);
        paddle.body.velocity.x = -this.paddleSpeedDefault;
        return false;
    };

    p.onHeroGroundCollide = function(hero, ground) {
        // console.log("%o", ground);
        this.hero.onGround = true;
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

        this.game.debug.spriteInfo(this.leftPaddle, 32, 32);
        this.game.debug.spriteInfo(this.rightPaddle, 32, 132);

    };


   
// link 
window.GameState = GameState;

}());



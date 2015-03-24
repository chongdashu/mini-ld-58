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

    p.heroMaxSpeed = 250;
    
    p.background = null;
    p.backgroundSky = null;
    p.backgroundMountain = null;

    p.ground = null;

    p.hero = null;

    p.initialize = function() {
        console.log("[GameState], initialize()");
    };

    // @phaser
    p.preload = function() {
        console.log("[GameState], preload()");

        // bounds
        this.game.world.setBounds(-400, -300, 800, 600);

        // assets
        this.game.load.image("sky", "assets/sky.png");
        this.game.load.image("mountain", "assets/mountain.png");
        this.game.load.image("tile", "assets/tile.png");

        // hero
        this.game.load.spritesheet("hero-idle", "assets/hero-idle.png", 32, 46);
        this.game.load.spritesheet("hero-jump", "assets/hero-jump.png", 32, 46);
        this.game.load.spritesheet("hero", "assets/hero.png", 32, 46);
        // this.game.load.spritesheet("cowboy", "assets/cowboy.png", 32, 32, 26);
        this.game.load.spritesheet("cowboy", "assets/cowboy-lg.png", 64, 64, 26);
        
    };

    // -----------------------------------------


    // @phaser
    p.create = function() {
        console.log("[GameState], create()");

        this.createPhysics();
        this.createBackground();
        this.createGround();
        this.createHero();
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
        this.hero.animations.add("jump-shoot", [12,13,15,15], 10, false);
        this.hero.animations.add("jump-up", [16], 1, true);
        this.hero.animations.add("jump-down", [16], 1, true);


        
        this.game.physics.enable(this.hero, Phaser.Physics.ARCADE);
        this.hero.body.setSize(16, 28, -2, 4);
        // this.hero.animations.play("jump-down");
        
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
        this.updateCollisions();
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
            console.log("yoyoyo");
            this.hero.animations.play("shoot");
        }
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
            console.log("whoa!");
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
    };


   
// link 
window.GameState = GameState;

}());



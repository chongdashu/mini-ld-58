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
        this.hero = this.game.add.sprite(0,0,"hero");
        this.hero.anchor.set(0.5);
        this.hero.animations.add("idle", [0,1], 2, true);
        this.hero.animations.add("jump-up", [2], 1, true);
        this.hero.animations.add("jump-down", [3], 1, true);
        
        this.game.physics.enable(this.hero, Phaser.Physics.ARCADE);
        // this.hero.animations.play("jump-down");
        

    };



    // -----------------------------------------

    // @phaser
    p.update = function() {
        // console.log("[GameState], update()");
        this.updateHero();
        this.updateCollisions();
    };

    p.updateHero = function() {
        console.log(this.hero.body.velocity.y, this.hero.onGround);
        if (this.hero.onGround) {
            // this.hero.animations.play("idle");
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
        this.hero.animations.play("idle");

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



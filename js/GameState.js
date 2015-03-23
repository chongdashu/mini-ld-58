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
    
    p.initialize = function() {
        console.log("[GameState], initialize()");
    };

    // @phaser
    p.preload = function() {
        console.log("[GameState], preload()");

    };

    // @phaser
    p.create = function() {
        console.log("[GameState], create()");
    };

    // @phaser
    p.update = function() {
        // console.log("[GameState], update()");
    };

    // @phaser
    p.render = function() {
        // console.log("[GameState], render()");
    };


   
// link 
window.GameState = GameState;

}());



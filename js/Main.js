var game = null;

$(document).ready(function() {
    game = new Phaser.Game(800, 600, Phaser.AUTO, $(".game").get(0));
    game.state.add("GameState", GameState, true);
});
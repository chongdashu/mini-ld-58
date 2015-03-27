var game = null;



$(document).ready(function() {
    game = new Phaser.Game(GameState.GAME_WIDTH, GameState.GAME_HEIGHT, Phaser.AUTO, $(".game").get(0));
    game.state.add("GameState", GameState, true);
});
// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(590, 332, Phaser.AUTO, 'game_div');
var game_state = {};
var npcGroup;
var player;
var cursors;

//NPC
var graphicArray;
var greetings;
var questions;

// Creates a new 'main' state that wil contain the game
game_state.main = function() { };  
game_state.main.prototype = {

    preload: function() { 
    	game.load.image('background', '/assets/background_lights.jpg');
    	game.load.bitmapFont('gem', '/assets/gem.png', '/assets/gem.xml');
        game.load.spritesheet('healer_m', '/assets/healer_m.png', 32, 36);
        game.load.spritesheet('healer_f', '/assets/healer_f.png', 32, 36);
        game.load.spritesheet('townfolk_f', '/assets/townfolk_f.png', 32, 36);
        game.load.spritesheet('townfolk_m', '/assets/townfolk_m.png', 32, 36);
        game.load.spritesheet('ninja_m', '/assets/ninja_m.png', 32, 36);
        game.load.spritesheet('ninja_f', '/assets/ninja_f.png', 32, 36);
        game.load.spritesheet('ranger_f', '/assets/ranger_f.png', 32, 36);
        game.load.spritesheet('ranger_m', '/assets/ranger_m.png', 32, 36);
        game.load.spritesheet('warrior_f', '/assets/warrior_f.png', 32, 36);
        game.load.spritesheet('warrior_m', '/assets/warrior_m.png', 32, 36);
        game.load.spritesheet('mage_m', '/assets/mage_m.png', 32, 36);
        game.load.spritesheet('mage_f', '/assets/mage_f.png', 32, 36);
        graphicArray = ['healer_f', 'townfolk_f', 'townfolk_m', 'ninja_m',
         				'ninja_f', 'ranger_f', 'ranger_m', 'warrior_f',
         				'warrior_m', 'mage_m', 'mage_f'];
        greetings = ['howdy ho!', 'yellow', 'THERES BEEN A MURDER'];
        questions = ['what is your name?', 'Why are you here?', 'would you like to go on an adventure?'];
    },

    create: function() { 
    	game.physics.startSystem(Phaser.Physics.ARCADE); 
    	game.add.tileSprite(0, 0, 590, 332, 'background');
		player = game.add.sprite(200, 250, 'healer_m');
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;

	    npcGroup = game.add.physicsGroup();
	    for (var i = 0; i < 6; i++) {
	    	var rnd = game.rnd.integerInRange(0, 11);
	        var c = npcGroup.create(game.world.randomX,  game.world.randomY, graphicArray[i], rnd);
	        c.name = 'townfolk_f' + i;
	        c.body.mass = -100;
	        c.body.onOverlap = new Phaser.Signal();
	        c.body.customConversation = 'greetings';
	        c.body.onOverlap.addOnce(converse, this);
	    }

        cursors = game.input.keyboard.createCursorKeys();

        //Text
        var bpmText;
		var text = "Oh no! A murder!";
		bmpText = game.add.bitmapText(32, 32, 'gem', text, 16);
		bmpText.maxWidth = 400;

		//Animations
        player.animations.add('walkUp', [0,1,2,1], 6, true);
        player.animations.add('walkRight',[3,4,5,4], 6, true);	
        player.animations.add('walkDown', [6,7,8,7], 6, true);
        player.animations.add('walkLeft',  [9,10,11,10], 6, true);
},
    
    update: function() {
    	//physics
      game.physics.arcade.overlap(player, npcGroup, collisionHandler, processHandler, this);
    
        if (cursors.up.isDown) {
	        if(player.body.velocity.y != -200) {
		         player.body.velocity.y = -200;
		         player.body.velocity.x = 0;
	         }
	       	player.animations.play('walkUp');
	    } else if (cursors.down.isDown) {
	        if(player.body.velocity.y != 200) {
	        	player.body.velocity.y = 200;
	         	player.body.velocity.x = 0;
	        }
	       	player.animations.play('walkDown');
	       	if(player.body.y == 50 && converseTextA){
	       		converseTextA.text = "";
	       		converseTextA.purgeGlyphs();
	       	}
	    } else if (cursors.left.isDown) {
	        if(player.body.velocity.x != -200) {
	        	player.body.velocity.x = -200;
	         	player.body.velocity.y = 0;

	        }
	       	player.animations.play('walkLeft');
	    } else if (cursors.right.isDown) {
	        if(player.body.velocity.x != 200) {
	        	player.body.velocity.x = 200;
	         	player.body.velocity.y = 0;
	     }
	       	player.animations.play('walkRight');
	    } else {
	    	player.animations.stop();
	    	player.body.velocity.x = 0;
	    	player.body.velocity.y = 0;

	    }
	},
	render: function() {
    // Sprite debug info
    //game.debug.spriteInfo(player, 52, 52);
},
};

function collisionHandler(player, npcs) { return true; }

function processHandler() { return true; }

function converse (sprite1, sprite2) { 
	var displayTextArray;
	if(sprite1.customConversation == 'greetings' && greetings.length > 0) {
		displayTextArray = greetings;
	}else if (sprite1.customConversation == 'questions' && questions.length > 0) {
		displayTextArray = questions;
	}
	var bpmText;
  	var rand = Math.floor(Math.random() * displayTextArray.length);
	var text = displayTextArray[rand];
	bmpText = game.add.bitmapText(sprite1.body.x , sprite1.body.y - sprite1.body.halfHeight, 'gem', text, 16);
	bmpText.maxWidth = 400;
	displayTextArray.splice(rand, 1);
	game.time.events.add(Phaser.Timer.SECOND * 2, textEffect, this, bmpText);
	
}

function textEffect (conversation) {
	var tweenFadeOut = game.add.tween(conversation).to( { alpha: 0 }, 2000, Phaser.Easing.Bounce.Out, true).loop(true);
	 game.time.events.add(Phaser.Timer.SECOND * 4, garbageText, this, conversation);
}

function garbageText (conversation) {
	conversation.text = "";
	conversation.purgeGlyphs();
}

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 






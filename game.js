// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(590, 332, Phaser.AUTO, 'game_div');
var game_state = {};
var npcGroup;
var player;
var cursors;

//NPC
var graphicArray;
var conversation;

// Creates a new 'main' state that wil contain the game
game_state.main = function() { };  
game_state.main.prototype = {

    preload: function() { 
    	 game.load.image('background', '/assets/background_lights.jpg');
    	 game.load.bitmapFont('gem', '/assets/gem.png', '/assets/gem.xml');
         game.load.spritesheet('healer_m', '/assets/healer_m.png', 32, 36);
         //NPC array of graphic name's
        graphicArray = ['healer_f', 'townfolk_f', 'townfolk_m', 'ninja_m',
         				'ninja_f', 'ranger_f', 'ranger_m', 'warrior_f',
         				'warrior_m', 'mage_m', 'mage_f'];
        //NPC quick load
        graphicArray.forEach( function (graphic) {
        	game.load.spritesheet(graphic, '/assets/' + graphic + '.png', 32, 36);
        }); 
        //NPC's dialogue

        conversation = {
	        dialogue: ['howdy ho!', 'yellow',
	        			 'THERES BEEN A MURDER'],
	        questionGeneral: ['what is your name?',
				         'Why are you here?',
				         'would you like to go on an adventure?'],
	        questionOptions: [{
	        	question: 'I have valueable information about this case, do you want to hear more?',
	        	options: ['Yes', 'No'],
	        	}, {
	         	question: 'I\'d like for us to make this work in both our favors, dont you?',
	         	options: ['Yes', 'No'],
	         },],
    	};
	},

    create: function() { 
    	game.physics.startSystem(Phaser.Physics.ARCADE); 
    	//Background
    	game.add.tileSprite(0, 0, 590, 332, 'background');
    	//Main Character + Physics
		player = game.add.sprite(200, 250, 'healer_m');
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;

        //NPC group
	    npcGroup = game.add.physicsGroup();

	    //Setting up NPC's 
	    for (var i = 0; i < 6; i++) {
	    	var rnd = game.rnd.integerInRange(0, 11);
	        var c = npcGroup.create(game.world.randomX,  game.world.randomY, graphicArray[i], rnd);
	        c.name = graphicArray[i] + i;
	        c.body.mass = -100;
	        c.body.onOverlap = new Phaser.Signal();
	        c.body.onOverlap.addOnce(converse, this);
	        c.customConversation = anyConversationType();
	    }

	    //Keyboard Input
        cursors = game.input.keyboard.createCursorKeys();

        //Screen Text
        var bpmText;
		var text = "Murder! RPG";
		bmpText = game.add.bitmapText(10, 10, 'gem', text, 16);
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

//TODO: needs work to display/accept different kinds of conversation
function converse (sprite1, sprite2) { 
	var displayTextArray = getConversation(sprite1.customConversation);
  	var rand = Math.floor(Math.random() * displayTextArray.length);
	var text = displayTextArray[rand];
	displayTextArray.splice(rand, 1);
	npcTalk(text, sprite1.body.x, sprite1.body.y, sprite1.body.halfHeight);
}

function getConversation (talkType) {
	if(talkType == 'dialogue' && conversation.dialogue.length > 0) {
		return dialogue();
	} else if (talkType == 'questionGeneral' && conversation.questionGeneral.length > 0) {
		return questionGeneral();
	} else if (talkType == 'questionOptions' && conversation.questionOptions.length > 0) {
		return questionOptions();
	}
	return [];
}

function questionGeneral () {
	return conversation.questionGeneral;
}

function questionOptions () {
	return conversation.questionOptions;
}

function dialogue () {
	return conversation.dialogue;
}

function npcTalk (text, x, y, halfHeight) {
	var bpmText;
	bmpText = game.add.bitmapText(x, y - halfHeight, 'gem', text, 16);
	bmpText.maxWidth = 400;
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

function anyConversationType () {
	var keys = Object.keys(conversation);
    return keys[Math.floor(Math.random() * keys.length)];
}

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 






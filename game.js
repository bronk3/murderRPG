// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(590, 332, Phaser.AUTO, 'game_div');
var game_state = {};
var npcGroups;
var player;
var cursors;

//NPC
var graphicArray;
var conversations;

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

        conversations = {
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

        //NPC groups
	    npcGroups = {
		    dialogue : game.add.physicsGroup(),
		    questionGeneral : game.add.physicsGroup(),
		    questionOptions : game.add.physicsGroup(),
	    }

Object.keys(conversations).forEach(function(key) {
    console.log(key, conversations[key]);
    for (var i = conversations[key].length; i > 0; i--) {
		var rnd = game.rnd.integerInRange(0, 11);
        var c = npcGroups[key].create(game.world.randomX,  game.world.randomY, graphicArray[i], rnd);
        c.name = graphicArray[i] + i;
        c.body.mass = -100;
        c.body.onOverlap = new Phaser.Signal();
        c.body.onOverlap.addOnce(eval(key), this);
        c.customconversations = key;
    }
});


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
    	Object.keys(npcGroups).forEach(function(key) {
      		game.physics.arcade.overlap(player, npcGroups[key], collisionHandler, processHandler, this);
  		});
    
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

//TODO: needs work to display/accept different kinds of conversations
function converse (sprite1, sprite2) { 
	var displayTextArray = getconversations(sprite1.customconversations);
  	var rand = Math.floor(Math.random() * displayTextArray.length);
	var text = displayTextArray[rand];
	displayTextArray.splice(rand, 1);
	npcTalk(text, sprite1.body.x, sprite1.body.y, sprite1.body.halfHeight);
}

function getconversations (talkType) {
	if(talkType == 'dialogue' && conversations.dialogue.length > 0) {
		return dialogue();
	} else if (talkType == 'questionGeneral' && conversations.questionGeneral.length > 0) {
		return questionGeneral();
	} else if (talkType == 'questionOptions' && conversations.questionOptions.length > 0) {
		return questionOptions();
	}
	return [];
}

function questionGeneral () {
	console.log('question General');
	return conversations.questionGeneral;
}

function questionOptions () {
	console.log('question Options');
	return conversations.questionOptions;
}

function dialogue () {
	console.log('dialog');
	return conversations.dialogue;
}

function npcTalk (text, x, y, halfHeight) {
	var bpmText;
	bmpText = game.add.bitmapText(x, y - halfHeight, 'gem', text, 16);
	bmpText.maxWidth = 400;
	game.time.events.add(Phaser.Timer.SECOND * 2, textEffect, this, bmpText);
}

function textEffect (conversations) {
	var tweenFadeOut = game.add.tween(conversations).to( { alpha: 0 }, 2000, Phaser.Easing.Bounce.Out, true).loop(true);
	 game.time.events.add(Phaser.Timer.SECOND * 4, garbageText, this, conversations);
}

function garbageText (conversations) {
	conversations.text = "";
	conversations.purgeGlyphs();
}

function anyconversationsType () {
	var keys = Object.keys(conversations);
    return keys[Math.floor(Math.random() * keys.length)];
}

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 






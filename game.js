// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(590, 332, Phaser.AUTO, 'game_div');
var game_state = {};
var npcGroup;
var player;
var cursors;
var keyboard;
var characterStatus = 100;
var inConversation = false;

var score = 0;


//Talking
var conversationText;
var responseText;
var currentNPC;

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


        conversations = [
        {
        	question: 'Would you like some more coffee',
        	options: {'100': 'yes', '-10': 'no'}
        },
        {
        	question: 'Can I go now',
        	options: {'-200': 'yes', '5': 'no'}
        },
        {
        	question: 'theres been a murder',
        },
        ];
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
	    for (var i = 0; i <= conversations.length; i++) {
	    	var rnd = game.rnd.integerInRange(0, 11);
	        var c = npcGroup.create(game.world.randomX,  game.world.randomY, graphicArray[i], rnd);
	        c.name = graphicArray[i] + i;
	        c.body.mass = -100;
	        c.body.onOverlap = new Phaser.Signal();
	        c.body.onOverlap.addOnce(converse, this);
	        c.conversation = assignConversation();
	    }



	    //Keyboard Input
        cursors = game.input.keyboard.createCursorKeys();
		keyboard = game.input.keyboard;
		keyboard.addCallbacks(this, null, null, reply);
		keyboard.addKey(13).processKeyDown = checkResponse;

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
    
      	if(inConversation) {	    	
      		player.animations.stop();
	    	player.body.velocity.x = 0;
	    	player.body.velocity.y = 0;
	    	return;
	    } 

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

function reply(char) {
	if(inConversation) {
		responseText.text = responseText.text + char;
	}
}

function checkResponse (event) {
	var options = currentNPC.conversation.options;
	if(inConversation && options) {
		Object.keys(options).forEach(function(key) {
			if(responseText.text == options[key]) {
				advancePlot(key);
				textByeBye();
			}
		});
	}
}


function advancePlot(points) {
	score = score + parseInt(points);
}

//TODO: needs work to display/accept different kinds of conversation
function converse (sprite1, sprite2) { 
	inConversation = true;
	currentNPC = sprite1;
	conversationText = game.add.bitmapText(
		sprite1.body.x ,
		sprite1.body.y - sprite1.body.halfHeight,
	 	'gem',
	  	conversationSnipet(sprite1.conversation),
	  	16);
	conversationText.maxWidth = 400;
	responseText = game.add.text(sprite2.body.x , sprite2.body.y + sprite2.body.halfHeight, "", { fontSize: '14px', fill: '#fff' });
	if (!sprite1.conversation.options) game.time.events.add(Phaser.Timer.SECOND * 2, textByeBye, this); 
}


function textByeBye () {
	var tweenFadeOut = game.add.tween(conversationText)
	.to( { alpha: 0 }, 500, Phaser.Easing.Bounce.Out, true);
	tweenFadeOut.onComplete = garbageConversation;
}

function garbageConversation (one, two) {
	conversationText.text = "";
	conversationText.purgeGlyphs();
	responseText.destroy();
	inConversation = false;
}

function conversationSnipet(snipet) {
	var options = '';
	if(snipet && snipet['options']) {
		options = Object.values(snipet.options).join(' /');
	}
	return snipet.question + '\n' + options;
}

function assignConversation() {  	
	var rand = Math.floor(Math.random() * conversations.length);
	var conversationSnipet = conversations[rand];
	conversations.splice(rand, 1);
	return conversationSnipet;
}

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 






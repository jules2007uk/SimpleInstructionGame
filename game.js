goog.provide('evasion.Game');

goog.require('lime.GlossyButton');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.Spawn');
goog.require('lime.CanvasContext');
goog.require('evasion.dialogs');

evasion.Game = function(level) {
    lime.Scene.call(this);
	lime.Renderer.CANVAS;
	
	this.setRenderer(lime.Renderer.CANVAS);	
	this.WIDTH = 600;      
	this.level = level;	
	this.bestScore = 0;
	
	this.mask = new lime.Sprite().setFill(new lime.fill.LinearGradient().addColorStop(0.5, 256, 256, 256, .5).addColorStop(0.8, 230, 230, 230, .5)).setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);	
	this.mask = new lime.Sprite().setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);	
	this.layer = new lime.Layer();    
    this.appendChild(this.layer);
    this.layer.setMask(this.mask);
    this.layer.setOpacity(.5);	
	this.cover = new lime.Layer().setPosition(evasion.director.getSize().width / 2, 0);
    this.appendChild(this.cover);	
	
	// create an empty label to hold the score
	lblScore = new lime.Label().setText('').setFontSize(44).setPosition(50, 0).setFontColor('#EFEFEF').setAlign('right').setAnchorPoint(0, 0);
    this.appendChild(lblScore);
	
	// create an empty label to hold the user's best score
	lblUserHighScore = new lime.Label().setText('').setFontSize(44).setPosition(500, 0).setFontColor('#EFEFEF').setAlign('right').setAnchorPoint(0, 0);
	this.appendChild(lblUserHighScore);
	
	// set the movement boundary for the balls (e.g. the main game area)	
	this.ballMovementBounds = new goog.math.Box(130, this.mask.size_.width, this.mask.size_.height + 130, 0);
	
	// game config properties	
	this.score = 0;
	this.configLevelNumber = 0; // to hold the config level (e.g. difficulty)
	this.topConfigLevel = 20;	// specify the top config level (e.g. difficulty)
	this.isRoundOver = false;
	this.targetColour;
	this.correctObjectId;
	
	// define label to hold the target colour
	this.lblTargetColour = new lime.Label().setFontSize(50).setPosition(125, 175).setFontColor('#000000').setAlign('center').setAnchorPoint(0, 0).setSize(500,150).setFontWeight(700);
	this.appendChild(this.lblTargetColour);
	
	// define objects which user will be able to choose from
	this.object1 = new lime.Sprite().setSize(500,150).setPosition(125, 275).setAnchorPoint(0,0);
	this.object2 = new lime.Sprite().setSize(500,150).setPosition(123, 475).setAnchorPoint(0,0);
	this.object3 = new lime.Sprite().setSize(500,150).setPosition(125, 675).setAnchorPoint(0,0);
	this.appendChild(this.object1);
	this.appendChild(this.object2);
	this.appendChild(this.object3);
	
	// divide the level number by the top config level to ascertain the remainder, which we then use as the configLevel value
	var remainder = this.level % this.topConfigLevel;
	
	// if the remainder is 0
	if(remainder == 0){
		// this means that the current level is the top level achievable, therefore set config level to 
		this.configLevelNumber = this.topConfigLevel;
	}
	else{
		// else set the config level number to be the remainder value
		// (e.g. remainder would be 6 if level was 26 and top config level was 20)
		this.configLevelNumber = remainder;
	}	
		
	
	if(this.configLevelNumber <= 10){
		
	}
	else{
		
	}
	
    // the level number tells us to display either the level, the how to play, or global leaderboard screens respectively
	if(this.level == 0){
		this.showHowToPlay();
	}
	else if (this.level == -1) {
	    this.showGlobalLeaderboard();
	}
	else if (this.level > 0) {
		this.start();
	}
	
}

goog.inherits(evasion.Game,lime.Scene);

// retrieve best score stored in local storage
evasion.Game.prototype.getBestScore = function(){
	var scoreRetrieved = localStorage.getItem("UserBestScore");
	
	if(scoreRetrieved != null){
		return scoreRetrieved;
	}
	else{
		return 0;
	}
}

// set best score in local storage
evasion.Game.prototype.setBestScore = function(scoreToAdd){	
	localStorage.setItem("UserBestScore", scoreToAdd);
}

// start the game
evasion.Game.prototype.start = function() {	
	
	// get user's high score from localStorage
	this.bestScore = this.getBestScore();

	// set user high score to label text if found in local storage
	lblUserHighScore.setText('Best: ' + this.bestScore);		
	
	// set label text for score
	lblScore.setText('Score: ' + this.score);
	
	// call function to add the level objects
	this.renderLevelObjects();	
};

evasion.Game.prototype.renderLevelObjects = function(){	
	// degrees of difficulty:
	// ** Neutral coloured instruction text [level 1-5]
	// ** Correctly coloured instruction text with easy colours [level 6-10]
	// ** Correctly coloured instruction text with easy + medium colours [level 11-20]
	// ** Correctly coloured instruction text with easy + medium + hard colours [level 21-30]
	// ** Wrongly coloured instruction text with easy + medium + difficult colours [level 31-40]
	// * Objects with correct colour written as text on object [level 41-45]
	// * Objects with incorrect colour written as text on object [level 46-55]
	// * Occassions where correct answer is click nothing (e.g. colour does not exist amongst objects) [level 55+]
	
	// define a colour palette array with the available object colours
	var colourPalette = [];
	var targetColourIndex;
	var incorrectColourIndex1;
	var incorrectColourIndex2;
	
	// define easy colours
	colourPalette.push(['Red', '#FF0000']);
	colourPalette.push(['Green', '#00FF00']);
	colourPalette.push(['Blue', '#0000FF']);
	// define medium colours
	colourPalette.push(['White','#FFFFFF']);
	colourPalette.push(['Black', '#000000']);
	colourPalette.push(['Yellow', '#FFFF00']);
	// define difficult colours
	colourPalette.push(['Grey', '#808080']);		
	colourPalette.push(['Maroon', '#800000']);		
	colourPalette.push(['Pink', '#FF00FF']);
	colourPalette.push(['Purple', '#800080']);	
			
	// set target colour label text	
	// set font colour of target colour label
	if(this.level <= 5){		
		// pick random target colour from first 3 array items and make it the correct answer colour
		targetColourIndex = Math.floor(Math.random() * 3);
		this.targetColour = colourPalette[targetColourIndex];
		
		// set text of target colour label
		this.lblTargetColour.setText(this.targetColour[0]);		
	}	
	else if(this.level > 5 && this.level <= 10){
		// pick random target colour from first 3 array items and make it the correct answer colour
		targetColourIndex = Math.floor(Math.random() * 3);
		this.targetColour = colourPalette[targetColourIndex];
		
		// set text of target colour label
		this.lblTargetColour.setText(this.targetColour[0]);
		
		// set colour of target colour label to match the colour instructed by the label
		this.lblTargetColour.setFontColor(this.targetColour[1]);
	}
	else if(this.level > 10 && this.level <= 20){
		// pick random target colour from first 6 array items and make it the correct answer colour
		targetColourIndex = Math.floor(Math.random() * 6);
		this.targetColour = colourPalette[targetColourIndex];
		
		// set text of target colour label
		this.lblTargetColour.setText(this.targetColour[0]);
		
		// set colour of target colour label to match the colour instructed by the label
		this.lblTargetColour.setFontColor(this.targetColour[1]);
	}
	else if(this.level > 20 && this.level <= 30){
		// pick random target colour from first 10 array items and make it the correct answer colour
		targetColourIndex = Math.floor(Math.random() * 10);
		this.targetColour = colourPalette[targetColourIndex];
		
		// set text of target colour label
		this.lblTargetColour.setText(this.targetColour[0]);
		
		// set colour of target colour label to match the colour instructed by the label
		this.lblTargetColour.setFontColor(this.targetColour[1]);
	}
	else if(this.level > 30 && this.level <= 40){
		// pick random target colour from first 10 array items and make it the correct answer colour
		targetColourIndex = Math.floor(Math.random() * 10);
		this.targetColour = colourPalette[targetColourIndex];
		
		// set text of target colour label
		this.lblTargetColour.setText(this.targetColour[0]);
		
		// set colour of target colour label to match the colour instructed by the label
		this.lblTargetColour.setFontColor(colourPalette[Math.floor(Math.random() * 10)][1]);
	}
	
	// remove target colour from colour palette array so that we can then pick 2 incorrect colours at random to assign to the other 2 interactive objects
	colourPalette.splice(targetColourIndex, 1);
	
	// pick 2 incorrect colour indexes so that we can select 2 colours from the colour palette array which are not the target colour
	incorrectColourIndex1 = Math.floor(Math.random() * 9);
	incorrectColourIndex2 = Math.floor(Math.random() * 9);

	// TODO: Ensure that incorrectColourIndex1 and incorrectColourIndex2 cannot be the same value
	
	// randomly choose the correct object of the 3 user-interactive objects
	this.correctObjectId = (Math.floor(Math.random() * 3) + 1);
	
	// now that we know which objects will be correct/incorrect, go about customising the colours used, and click events attached to each object
	switch(this.correctObjectId){
		case 1: // object 1 will be the correct answer			
			
			// assign background colours to objects
			this.object1.setFill(this.targetColour[1]);
			this.object2.setFill(colourPalette[incorrectColourIndex1][1]);
			this.object3.setFill(colourPalette[incorrectColourIndex2][1]);
			
			// assign click events to objects
			goog.events.listen(this.object1, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked, false, this);
			goog.events.listen(this.object2, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked, false, this);
			goog.events.listen(this.object3, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked, false, this);
			
			break;
		case 2: // object 2 will be the correct answer
			
			// assign background colours to objects
			this.object1.setFill(colourPalette[incorrectColourIndex1][1]);
			this.object2.setFill(this.targetColour[1]);
			this.object3.setFill(colourPalette[incorrectColourIndex2][1]);
			
			// assign click events to objects
			goog.events.listen(this.object1, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked, false, this);
			goog.events.listen(this.object2, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked, false, this);
			goog.events.listen(this.object3, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked, false, this);
		
			break;
		case 3: // object 3 will be the correct answer
			
			// assign background colours to objects
			this.object1.setFill(colourPalette[incorrectColourIndex1][1]);
			this.object2.setFill(colourPalette[incorrectColourIndex2][1]);
			this.object3.setFill(this.targetColour[1]);
			
			// assign click events to objects
			goog.events.listen(this.object1, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked, false, this);
			goog.events.listen(this.object2, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked, false, this);
			goog.events.listen(this.object3, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked, false, this);
		
			break;
	}	
};

evasion.Game.prototype.correctObjectClicked = function(e){
	e.event.stopPropagation();
	
	// now remove the click events attached to the objects
	this.object1.eventTargetListeners_.listeners.keydown = [];
	this.object1.eventTargetListeners_.listeners.mousedown = [];
	this.object1.eventTargetListeners_.listeners.touchstart = [];
	this.object1.eventHandlers_.keydown = [];
	this.object1.eventHandlers_.touchstart = [];
	
	this.object2.eventTargetListeners_.listeners.keydown = [];
	this.object2.eventTargetListeners_.listeners.mousedown = [];
	this.object2.eventTargetListeners_.listeners.touchstart = [];
	this.object2.eventHandlers_.keydown = [];
	this.object2.eventHandlers_.touchstart = [];
	
	this.object3.eventTargetListeners_.listeners.keydown = [];
	this.object3.eventTargetListeners_.listeners.mousedown = [];
	this.object3.eventTargetListeners_.listeners.touchstart = [];
	this.object3.eventHandlers_.keydown = [];
	this.object3.eventHandlers_.touchstart = [];
	
	// now remove the click events attached to the objects - commented out as not working
	/*if(this.correctObjectId == 1){			
		goog.events.unlisten(this.object1, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked);
		goog.events.unlisten(this.object2, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
		goog.events.unlisten(this.object3, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
	}
	else if(this.correctObjectId == 2){
		goog.events.unlisten(this.object1, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
		goog.events.unlisten(this.object2, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked);
		goog.events.unlisten(this.object3, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
	}
	else if(this.correctObjectId == 3){
		goog.events.unlisten(this.object1, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
		goog.events.unlisten(this.object2, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
		goog.events.unlisten(this.object3, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked);
	}*/
	
	// increment level number
	this.level += 1;
	
	// increment score
	this.score += 1;
	
	this.start();
	
};

evasion.Game.prototype.incorrectObjectClicked = function(e){
	e.event.stopPropagation();
	
	// now remove the click events attached to the objects
	this.object1.eventTargetListeners_.listeners.keydown = [];
	this.object1.eventTargetListeners_.listeners.mousedown = [];
	this.object1.eventTargetListeners_.listeners.touchstart = [];
	this.object1.eventHandlers_.keydown = [];
	this.object1.eventHandlers_.touchstart = [];
	
	this.object2.eventTargetListeners_.listeners.keydown = [];
	this.object2.eventTargetListeners_.listeners.mousedown = [];
	this.object2.eventTargetListeners_.listeners.touchstart = [];
	this.object2.eventHandlers_.keydown = [];
	this.object2.eventHandlers_.touchstart = [];
	
	this.object3.eventTargetListeners_.listeners.keydown = [];
	this.object3.eventTargetListeners_.listeners.mousedown = [];
	this.object3.eventTargetListeners_.listeners.touchstart = [];
	this.object3.eventHandlers_.keydown = [];
	this.object3.eventHandlers_.touchstart = [];
	
	// now remove the click events attached to the objects - commented out as not working	
	/*if(this.correctObjectId == 1){
		goog.events.unlisten(this.object1, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked);
		goog.events.unlisten(this.object2, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
		goog.events.unlisten(this.object3, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
	}
	else if(this.correctObjectId == 2){
		goog.events.unlisten(this.object1, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
		goog.events.unlisten(this.object2, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked);
		goog.events.unlisten(this.object3, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
	}
	else if(this.correctObjectId == 3){
		goog.events.unlisten(this.object1, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
		goog.events.unlisten(this.object2, ['mousedown', 'touchstart', 'keydown'], this.incorrectObjectClicked);
		goog.events.unlisten(this.object3, ['mousedown', 'touchstart', 'keydown'], this.correctObjectClicked);
	}*/
	
	// game over
	this.gameOver();
	
	// reload main menu*/
};

evasion.Game.prototype.gameOver = function(){
	// remove the objects from the game	
	this.removeChild(this.lblTargetColour);
	this.removeChild(this.object1);
	this.removeChild(this.object2);
	this.removeChild(this.object3);
	
	// show game over screen
	var gameOverDialog = evasion.dialogs.box4(this.score);								
	this.cover.appendChild(gameOverDialog);
	evasion.dialogs.appear(gameOverDialog);
					
	// 4 sceond timer
	lime.scheduleManager.callAfter(function(){
		
		// restart the game which will kick the player back to the main menu
		location.reload();
						
	}, this, 4000);
}

evasion.Game.prototype.showHowToPlay = function(){
	var show = new lime.animation.MoveBy(0, 50).setDuration(2);
	var box = evasion.dialogs.box1();
	this.cover.appendChild(box);
	var that = this;    
	
	//goog.events.listen(show, lime.animation.Event.STOP, function() {
        evasion.dialogs.appear(box);

        var box2 = evasion.dialogs.box2();
        evasion.dialogs.hide(box, function() {
            that.cover.removeChild(box);
            that.cover.appendChild(box2);
            evasion.dialogs.appear(box2);

            var box3 = evasion.dialogs.box3(that);
            evasion.dialogs.hide(box2, function() {
                that.cover.removeChild(box2);
                that.cover.appendChild(box3);
                evasion.dialogs.appear(box3);

                evasion.dialogs.hide(box3, function() {
                    that.cover.removeChild(box3);
                    that.cover.removeChild(lblScore);
                    location.reload();
                }, 11);

            }, 7);

        }, 11);				
    //});
}

// function to show the global leaderboard popup screen
evasion.Game.prototype.showGlobalLeaderboard = function () {
    var show = new lime.animation.MoveBy(0, 50).setDuration(2);
    var box = evasion.dialogs.box5();
    this.cover.appendChild(box);
    var that = this;
    
    // show the box
    evasion.dialogs.appear(box);
	
	evasion.dialogs.hide(box, function() {
		that.cover.removeChild(box);		
		location.reload();
	}, 12);
	
	// add listner to listen for tap event to close leaderboard box on tap
	goog.events.listen(that, ['touchstart', 'mousedown'], function(e) {
		e.event.stopPropagation();		
				
		// reload back to the main menu (effectively close the popup)
		location.reload();
	});
}

// update the player's score
evasion.Game.prototype.updateScore = function(){
	// each non-captured ball is worth 5pts, and catching all balls is worth an extra 25pts	
	var totalNumberBalls = this.balls.length;
	var actualNumberLiveBalls = 0;	
	
	for(i = 0; i < totalNumberBalls; i++){		
		if(!this.balls[i].isCaught){
			actualNumberLiveBalls += 1;
		}
	}
	
	// add 5pts for each live ball
	this.score += (actualNumberLiveBalls * 50);
	
	// if player has caught all available balls then add an extra 25pts
	if(totalNumberBalls == actualNumberLiveBalls){
		this.score += 25;
	}
	
	runningScore += this.score;
	
}

evasion.Game.prototype.addModalMessage = function(doAddCloseHandler, message, title, message2, message3){
		
	// add transparent background to capture tap event - used for closing the modal
	var modalBackground = new lime.Sprite().setSize(gameObj.width, gameObj.height).setFill(menuHexColour).setAnchorPoint(0,0).setOpacity(0.5);
	
	// modal popup box, title, and primary message
	var modalPopup = new lime.Sprite().setSize(gameObj.width * 0.8,gameObj.height * 0.5).setFill(modalBackgroundHexColour).setPosition(gameObj.width/2,gameObj.height/2);
	var lblTitle = new lime.Label().setText(title).setPosition(0, - ((modalPopup.size_.height/2) - 20)).setFontColor(modalTextHexColour).setSize((modalPopup.size_.width * 0.9), 10).setFontWeight(600);
	var lblMessage = new lime.Label().setText(message).setPosition(0, (lblTitle.position_.y + lblTitle.size_.height) + 20).setFontColor(modalTextHexColour).setSize((modalPopup.size_.width * 0.9), 10).setAlign('center');
	
	modalPopup.appendChild(lblTitle);
	modalPopup.appendChild(lblMessage);
	
	// only add further messages to modal if parameters are defined
	if(message2 != undefined){
		var lblMessage2 = new lime.Label().setText(message2).setPosition(0, (lblMessage.position_.y + lblMessage.size_.height) + 30).setFontColor(modalTextHexColour).setSize((modalPopup.size_.width * 0.9), 10).setAlign('center');
		modalPopup.appendChild(lblMessage2);
	}	
	if(message3 != undefined){
		var lblMessage3 = new lime.Label().setText(message3).setPosition(0, (lblMessage2.position_.y + lblMessage2.size_.height) + 30).setFontColor(modalTextHexColour).setSize((modalPopup.size_.width * 0.9), 10).setAlign('center');
		modalPopup.appendChild(lblMessage3);
	}
	
	// add popup and background
	this.appendChild(modalPopup);
	this.appendChild(modalBackground);
	
	// do we want to add a tap handler to allow user to close the modal?
	if(doAddCloseHandler){
		// add event listener to capture any click on the modal background
		goog.events.listen(modalBackground, ['touchstart', 'mousedown'], function(e, gameScene) {
			e.event.stopPropagation();		
					
			// remove popup and background
			this.removeChild(modalPopup);
			this.removeChild(modalBackground);
		});
	}
}

// quick function to determine if a number passed in is odd or even
isOdd = function(num){ 
	return num % 2;
}
 

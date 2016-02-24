goog.provide('rapidreflexes.Game');
goog.require('lime.GlossyButton');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.MoveTo');
goog.require('lime.CanvasContext');
goog.require('rapidreflexes.dialogs');

rapidreflexes.Game = function(level) {
    lime.Scene.call(this);
	lime.Renderer.DOM;
	
	this.setRenderer(lime.Renderer.DOM);	
	this.WIDTH = 600;      
	this.level = level;	
	this.bestScore = 0;
	
	this.mask = new lime.Sprite().setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);	
	this.mask = new lime.Sprite().setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);	
	this.layer = new lime.Layer();    
    this.appendChild(this.layer);
    this.layer.setMask(this.mask);
    this.layer.setOpacity(0.5);	
	this.cover = new lime.Layer().setPosition(rapidreflexes.director.getSize().width / 2, 0);
    this.appendChild(this.cover);
	
	this.progressBarLimit = new lime.Sprite().setSize(768, 20).setPosition(0, 100).setAnchorPoint(0,0).setFill('#20A2D6').setHidden(true);
	this.appendChild(this.progressBarLimit);
	
	// add progress bar
	this.progressBar = new lime.Sprite().setSize(768, 20).setPosition(-768, 100).setAnchorPoint(0,0).setFill(new lime.fill.LinearGradient().addColorStop(0.5, 205, 244, 85, .5).addColorStop(0.8, 166, 220, 0, .5));
	this.appendChild(this.progressBar);
	
	// create an empty label to hold the score
	lblScore = new lime.Label().setText('').setFontSize(64).setPosition(50, 0).setFontColor('#EFEFEF').setAlign('left').setAnchorPoint(0, 0).setFontFamily('AmaticBold').setSize(500,100);
    this.appendChild(lblScore);
	
	// create an empty label to hold the user's best score
	lblUserHighScore = new lime.Label().setText('').setFontSize(64).setPosition(550, 0).setFontColor('#EFEFEF').setAlign('left').setAnchorPoint(0, 0).setFontFamily('AmaticBold').setSize(200,100);
	this.appendChild(lblUserHighScore);
	
	// set the movement boundary for the balls (e.g. the main game area)	
	this.ballMovementBounds = new goog.math.Box(130, this.mask.size_.width, this.mask.size_.height + 130, 0);
	
	// game config properties	
	this.score = 0;	
	this.targetColour;
	this.correctObjectId;
	
	// define label to hold the target colour
	this.lblTargetColour = new lime.Label().setFontSize(70).setPosition(125, 175).setFontColor('#000000').setAlign('center').setAnchorPoint(0, 0).setSize(500,150).setFontWeight(700).setFontFamily('AmaticBold').setText('');
	this.appendChild(this.lblTargetColour);
	
	// define objects which user will be able to choose from
	this.object1 = new lime.Sprite().setSize(500,150).setPosition(125, 275).setAnchorPoint(0,0).setStroke(5, '#444A4E');
	this.object2 = new lime.Sprite().setSize(500,150).setPosition(123, 475).setAnchorPoint(0,0).setStroke(5, '#444A4E');
	this.object3 = new lime.Sprite().setSize(500,150).setPosition(125, 675).setAnchorPoint(0,0).setStroke(5, '#444A4E');
		
	// create objects overlay which adds a transparent reflection image to the objects
	this.objectsOverlay = new lime.Sprite().setFill('images/objects-reflection-overlay.png').setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    		
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

goog.inherits(rapidreflexes.Game,lime.Scene);

// retrieve best score stored in local storage
rapidreflexes.Game.prototype.getBestScore = function(){
	var scoreRetrieved = localStorage.getItem("UserBestScore");
	
	if(scoreRetrieved != null){
		return scoreRetrieved;
	}
	else{
		return 0;
	}
}

// set best score in local storage
rapidreflexes.Game.prototype.setBestScore = function(){	
	localStorage.setItem("UserBestScore", this.score);
}

// start the game
rapidreflexes.Game.prototype.start = function() {	
	
	// get user's high score from localStorage
	this.bestScore = this.getBestScore();

	// set user high score to label text if found in local storage
	lblUserHighScore.setText('Best: ' + this.bestScore);		
	
	// set label text for score
	lblScore.setText('Score: ' + this.score);
	
	// reset progress bar
	this.progressBar.setPosition(-768, 100);	
	this.progressBarLimit.setHidden(false);
	
	// call function to add the level objects
	this.renderLevelObjects();	
};

rapidreflexes.Game.prototype.renderLevelObjects = function(){	
	// degrees of difficulty:
	// ** Neutral coloured instruction text [level 1-15]
	// ** Wrongly coloured instruction text with easy + medium + difficult colours [level 16-40]
	
	// TODO: Not yet implemented difficult levels
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
	if(this.level <= 15){		
		// pick random target colour from first 3 array items and make it the correct answer colour
		targetColourIndex = Math.floor(Math.random() * 3);
		this.targetColour = colourPalette[targetColourIndex];
		
		// set text of target colour label
		this.lblTargetColour.setText(this.targetColour[0]);		
	}
	else if(this.level > 15){
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

	// ensure that incorrectColourIndex1 and incorrectColourIndex2 cannot be the same value
	while(incorrectColourIndex1 == incorrectColourIndex2){
		incorrectColourIndex2 = Math.floor(Math.random() * 9);
	}
	
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
	
	// add the game objects
	this.appendChild(this.object1);
	this.appendChild(this.object2);
	this.appendChild(this.object3);
	
	// add objects overlay transparent reflection image
	this.appendChild(this.objectsOverlay);
	
	// now add a 1 second timer for the round, except for the first round
	if(this.level > 1){
		lime.scheduleManager.scheduleWithDelay(this.gameOver, this, 1000);
		
		// animate progress bar
		this.progressBar.runAction(new lime.animation.MoveBy(768, 0).setDuration(1));
	}		
};

rapidreflexes.Game.prototype.correctObjectClicked = function(e){
	e.event.stopPropagation();
	
	// cancel the round timer
	lime.scheduleManager.unschedule(this.gameOver, this);
	
	// remove click event handlers
	this.removeObjectHandlers();
	
	// increment level number
	this.level += 1;
	
	// increment score
	this.score += 1;
	
	// start the next level
	this.start();	
};

rapidreflexes.Game.prototype.incorrectObjectClicked = function(e){
	e.event.stopPropagation();
	
	// cancel the round timer
	lime.scheduleManager.unschedule(this.gameOver, this);
	
	// remove click event handlers
	this.removeObjectHandlers();
	
	// game over
	this.gameOver();
};

rapidreflexes.Game.prototype.removeObjectHandlers = function(){
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
	
	// commented out as not working	
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
}

rapidreflexes.Game.prototype.gameOver = function(){
	// remove the objects from the game	
	this.removeChild(this.lblTargetColour);
	this.removeChild(this.object1);
	this.removeChild(this.object2);
	this.removeChild(this.object3);
	this.removeChild(this.objectsOverlay);
	
	// show game over screen
	var gameOverDialog = rapidreflexes.dialogs.box4(this.score);								
	this.cover.appendChild(gameOverDialog);
	rapidreflexes.dialogs.appear(gameOverDialog);
	
	// if the current score is better than the best score stored in local storage
	if(this.score > this.bestScore){
		// update the best score in local storage
		this.setBestScore();
	}
					
	// 4 sceond timer
	lime.scheduleManager.callAfter(function(){
		
		// restart the game which will kick the player back to the main menu
		location.reload();
						
	}, this, 4000);
}

rapidreflexes.Game.prototype.showHowToPlay = function(){
	var show = new lime.animation.MoveBy(0, 50).setDuration(2);
	var box = rapidreflexes.dialogs.box3();
	this.cover.appendChild(box);
	var that = this;  
	
	rapidreflexes.dialogs.appear(box);	
	rapidreflexes.dialogs.hide(box, function() {		
		location.reload();
	}, 10);	  
}

// function to show the global leaderboard popup screen
rapidreflexes.Game.prototype.showGlobalLeaderboard = function () {
    var show = new lime.animation.MoveBy(0, 50).setDuration(2);
    var box = rapidreflexes.dialogs.box5();
    this.cover.appendChild(box);
    var that = this;
    
    // show the box
    rapidreflexes.dialogs.appear(box);
	
	rapidreflexes.dialogs.hide(box, function() {
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

rapidreflexes.Game.prototype.addModalMessage = function(doAddCloseHandler, message, title, message2, message3){
		
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
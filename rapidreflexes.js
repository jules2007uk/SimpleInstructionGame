//set main namespace
goog.provide('rapidreflexes');

//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');  
goog.require('lime.GlossyButton');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');
goog.require('lime.transitions.MoveInUp');
goog.require('lime.transitions.Dissolve');
	
// pull in custom js files
goog.require('rapidreflexes.Game');

var director;
var runningScore = 0;

rapidreflexes.WIDTH = 768;
rapidreflexes.HEIGHT = 1004;
rapidreflexes.UserBestScore;
rapidreflexes.DeviceGUID;

// entrypoint
rapidreflexes.start = function(){
	var gameScene;
	var mainMenuScene;
										
	rapidreflexes.director = new lime.Director(document.body,rapidreflexes.WIDTH, rapidreflexes.HEIGHT);
	rapidreflexes.director.makeMobileWebAppCapable();

	// check localstorage to see if a device GUID has been created for this device
	rapidreflexes.DeviceGUID = localStorage.getItem('DeviceGUID');
	
	// if no GUID found then create one and store it in localstorage
	if(rapidreflexes.DeviceGUID == null){
		
		// set device GUID property
		this.DeviceGUID = this.generateGuid();
		
		// store GUID in localstorage
		localStorage.setItem('DeviceGUID', this.DeviceGUID);		
	}	
	
	// build the main menu scene
	rapidreflexes.loadMenuScene();	
}

rapidreflexes.loadMenuScene = function(opt_transition){
	var scene = new lime.Scene();
    rapidreflexes.director.replaceScene(scene, opt_transition ? lime.transitions.MoveInDown : undefined);

    var layer = new lime.Layer().setPosition(rapidreflexes.WIDTH * .5, 0);
    scene.appendChild(layer);

    var menuLogo = new lime.Sprite().setPosition(0, 250).setFill('images/512x512.png');
    layer.appendChild(menuLogo);
	
	var btnStart = new lime.GlossyButton().setText('Start').setPosition(0, 625).setColor('#EFEFEF').setSize(500,100).setFontSize(30);
	btnStart.upstate.label.setSize(600,30);
	btnStart.downstate.label.setSize(600,30);
	layer.appendChild(btnStart);
	
	var btnHowToPlay = new lime.GlossyButton().setText('How to play').setPosition(0, 750).setColor('#EFEFEF').setSize(500,100).setFontSize(30);
	btnHowToPlay.upstate.label.setSize(600,30);
	btnHowToPlay.downstate.label.setSize(600,30);
	layer.appendChild(btnHowToPlay);
	
	var btnGlobalLeaderboard = new lime.GlossyButton().setText('Global leaderboard').setPosition(0, 875).setColor('#EFEFEF').setSize(500,100).setFontSize(30);
    btnGlobalLeaderboard.upstate.label.setSize(600,30);
	btnGlobalLeaderboard.downstate.label.setSize(600,30);
	layer.appendChild(btnGlobalLeaderboard);	
		
    var mask = new lime.Sprite().setSize(620, 560).setFill('#c00').setAnchorPoint(0.5, 0).setPosition(0, 410);
    layer.appendChild(mask);

    var contents = new lime.Layer().setPosition(0, 280);
    layer.appendChild(contents);

    contents.setMask(mask); 

    var levels = new lime.Layer().setPosition(0, 690);
    contents.appendChild(levels);

    var lbl_levels = new lime.Label().setText(('Pick level:').toUpperCase()).setFontSize(30).setAnchorPoint(.5, 0).setPosition(0, 0).setFontColor('#fff');
    levels.appendChild(lbl_levels);

    var btns_layer = new lime.Layer().setPosition(-250, 110);
    levels.appendChild(btns_layer);
	
	// get this person's highest score from local storage
	rapidreflexes.UserBestScore = rapidreflexes.getBestScore();
	
	// submit this person's highest score to scoreboard API just incase it has never been uploaded before
	//scoreboard.SubmitScore(rapidreflexes.UserBestScore, this.DeviceGUID, 'StickyBalls');
	   
	// add listen to how to play button
	goog.events.listen(btnHowToPlay, ['touchstart', 'mousedown'], function(e) {
		e.event.stopPropagation();
		
		// pass in level 0 which means show the how to play screen
		rapidreflexes.loadGame(0);
	});
	
	// add listener to background for game start action
	goog.events.listen(btnStart, ['touchstart', 'mousedown'], function(e) {
		e.event.stopPropagation();
		
		rapidreflexes.loadGame(1);
	});
	
	// add listener to background for global leaderboard action
	goog.events.listen(btnGlobalLeaderboard, ['touchstart', 'mousedown'], function(e) {
		e.event.stopPropagation();
		
		// pass in level -1 which means show the global leaderboard screen
		rapidreflexes.loadGame(-1);
	});
}

rapidreflexes.loadGame = function(level){	
	rapidreflexes.activeGame = new rapidreflexes.Game(level);
	rapidreflexes.director.replaceScene(rapidreflexes.activeGame, lime.transitions.Dissolve);
}

// retrieve best score stored in local storage
rapidreflexes.getBestScore = function(){
	var scoreRetrieved = localStorage.getItem("UserBestScore");
	
	if(scoreRetrieved != null){
		return scoreRetrieved;
	}
	else{
		return 0;
	}
}

// generates a unique ID for the device
rapidreflexes.generateGuid = function(){
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('rapidreflexes.start', rapidreflexes.start);
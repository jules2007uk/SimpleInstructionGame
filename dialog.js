goog.provide('evasion.dialogs');

evasion.dialogs.blank = function() {
    var dialog = new lime.RoundedRect().setFill(255, 255, 255, .6).
        setRadius(40).setSize(680, 550).setPosition(0, 270).setAnchorPoint(.5, 0).setOpacity(0);
    return dialog;
};

evasion.dialogs.box1 = function() {
    var b = evasion.dialogs.blank();

    var txt = new lime.Label().setText('How to play').setFontSize(40).setPosition(0, 70);
    b.appendChild(txt);

    var descr = new lime.Label().setText('Catch the target number of balls to progress to the next round').setSize(450, 50).setPosition(0, 130).setFontSize(24).setFontColor('#333');
    b.appendChild(descr);

    var tutorial1 = new lime.Sprite().setFill('images/how-to-play/howtoplay-1.png').setPosition(-150, 400).setScale(.8);
    b.appendChild(tutorial1);

    var tutorial2 = new lime.Sprite().setFill('images/how-to-play/howtoplay-2.png').setPosition(150, 400).setScale(.8);
    b.appendChild(tutorial2);

    var hint1 = new lime.Label().setFontSize(22).setFontColor('#5e8d0c').setText('Tap in the game area to place a sticky ball').setSize(250, 50).setPosition(-150, 210);
    b.appendChild(hint1);

    var hint1 = new lime.Label().setFontSize(22).setFontColor('#5e8d0c').setText('Place in the path of other balls to force a catch').setSize(250, 50).setPosition(150, 210);
    b.appendChild(hint1);

    return b;
};

evasion.dialogs.box2 = function() {
    var b = evasion.dialogs.blank();

    var txt = new lime.Label().setText('How to play').setFontSize(40).setPosition(0, 70);
    b.appendChild(txt);

    var descr = new lime.Label().setText('Each caught ball becomes sticky and can be used to catch more balls').setSize(450, 50).setPosition(0, 130).setFontSize(24).setFontColor('#333');
    b.appendChild(descr);

    var tutorial1 = new lime.Sprite().setFill('images/how-to-play/howtoplay-3.png').setPosition(0, 360);
    b.appendChild(tutorial1);

    return b;
};

evasion.dialogs.box3 = function(game) {
    var b = evasion.dialogs.blank();

    var txt = new lime.Label().setText('How to play').setFontSize(40).setPosition(0, 70);
	  b.appendChild(txt);

	  var descr = new lime.Label().setText('Each ball expires after 3 seconds. When all balls expire the round is over.').setSize(450, 50).setPosition(0, 130).setFontSize(24).setFontColor('#333');
	  b.appendChild(descr);
	  
	  var descr2 = new lime.Label().setText('Each caught ball is worth 50pts, with a 25pts bonus for catching all balls.').setSize(450, 50).setPosition(0, 230).setFontSize(24).setFontColor('#333');
	  b.appendChild(descr2);
	  
	  var descr3 = new lime.Label().setText('Points are awarded once a level is passed.').setSize(450, 50).setPosition(0, 330).setFontSize(24).setFontColor('#333');
	  b.appendChild(descr3);
	  
    return b;
};

evasion.dialogs.box4 = function(score) {
    var b = evasion.dialogs.blank();

    var txt = new lime.Label().setText('Game Over').setFontSize(40).setPosition(0, 70);
    b.appendChild(txt);

    var descr = new lime.Label().setText('You scored ' + score + 'pts').setSize(450, 50).setPosition(0, 130).setFontSize(34).setFontColor('#333');
    b.appendChild(descr);

    var tutorial1 = new lime.Sprite().setFill('#FF0000').setPosition(0, 360);
    b.appendChild(tutorial1);

    return b;
};

evasion.dialogs.box5 = function (game) {
    var b = evasion.dialogs.blank();

    var txt = new lime.Label().setText('Global Leaderboard').setFontSize(40).setPosition(0, 70);
    b.appendChild(txt);
	
	var lblLoading = new lime.Label().setText('Loading scores...').setSize(450, 50).setPosition(0, 130).setFontSize(24).setFontColor('#333');
	b.appendChild(lblLoading);
	
	// call the scoreboard api to get the high score and append to the label supplied via parameter
	/*
	scoreboard.GetHighScores().then(function(response) {
		b.removeChild(lblLoading);
		
		if(response[0] != undefined){
			var lblScore1 = new lime.Label().setText('1. ' + response[0].PlayerScore + 'pts').setSize(450, 50).setPosition(0, 180).setFontSize(28).setFontColor('#333');
			b.appendChild(lblScore1);
		}
		
		if(response[1] != undefined){
			var lblScore2 = new lime.Label().setText('2. ' + response[1].PlayerScore + 'pts').setSize(450, 50).setPosition(0, 230).setFontSize(28).setFontColor('#333');
			b.appendChild(lblScore2);
		}
		
		if(response[2] != undefined){
			var lblScore3 = new lime.Label().setText('3. ' + response[2].PlayerScore + 'pts').setSize(450, 50).setPosition(0, 280).setFontSize(28).setFontColor('#333');
			b.appendChild(lblScore3);
		}
		
		if(response[3] != undefined){
			var lblScore4 = new lime.Label().setText('4. ' + response[3].PlayerScore + 'pts').setSize(450, 50).setPosition(0, 330).setFontSize(28).setFontColor('#333');
			b.appendChild(lblScore4);
		}
		
		if(response[4] != undefined){
			var lblScore5 = new lime.Label().setText('5. ' + response[4].PlayerScore + 'pts').setSize(450, 50).setPosition(0, 380).setFontSize(28).setFontColor('#333');
			b.appendChild(lblScore5);
		}		
		
	});
	*/
	
	return b;
};

evasion.dialogs.appear = function(b,callback) {
    var appear = new lime.animation.FadeTo(1).setDuration(.3);
    b.runAction(appear);
    if (callback) goog.events.listen(appear, lime.animation.Event.STOP, callback);
};

evasion.dialogs.hide = function(b,callback, delay) {
    var hide = new lime.animation.Sequence(new lime.animation.Delay().setDuration(delay), new lime.animation.FadeTo(0).setDuration(.3));
    b.runAction(hide);
    if (callback) goog.events.listen(hide, lime.animation.Event.STOP, callback);
};


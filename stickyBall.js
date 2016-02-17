goog.provide('evasion.stickyBall');
goog.require('lime.Circle');
 
evasion.stickyBall = function(x, y, ballInstance, stickyBallNumber) {
    goog.base(this);
	
	this.width = 100;
	this.height = 100;
	this.position_.x = x;
	this.position_.y = y;
	this.setSize(this.height, this.width);
	this.radius = (this.width/2); // radius is half of width
	this.deployedTime = new Date().getTime();
	this.isExpired = false;
	this.stickyBallNumber = stickyBallNumber; // the number which corresponds to the order of when the stickyBall was caught
	
	if(ballInstance != null){
		
		// set background color according to ball background colour		
		var b = ballInstance.fill_.colors_[0][1].b;
		var g = ballInstance.fill_.colors_[0][1].g;
		var r = ballInstance.fill_.colors_[0][1].r;
		
		// fill background 
		var gradient = new lime.fill.LinearGradient()
			.setDirection(0,0,1,1) // 45' angle 
			.addColorStop(0, r, g, b ,.5) // add colour			
		this.setFill(gradient);
	}
	else{
		// set default background colour
		this.setFill('#0A0F0F');
	}
	
	if(stickyBallNumber != undefined){
		// create new labels to hold the stickyBall number and points value respectively
		var numberLabel = new lime.Label().setText(this.stickyBallNumber).setFontWeight(600).setFontColor('#FCE9A4').setFontSize('20').setOpacity(0);
		var pointsLabel = new lime.Label().setText('+50pts').setFontWeight(600).setFontColor('#5e8d0c').setFontSize('30');
		
		// define animation actions (hide and appear respectively
		var hide = new lime.animation.Sequence(new lime.animation.Delay().setDuration(0.5), new lime.animation.FadeTo(0).setDuration(.5));
		var appear = new lime.animation.FadeTo(1).setDuration(1);
				
		// add labels
		this.appendChild(numberLabel);
		this.appendChild(pointsLabel);
		
		// run animation on labels
		numberLabel.runAction(appear);
		pointsLabel.runAction(hide);
	}	
	
}
 
goog.inherits(evasion.stickyBall,lime.Circle);

evasion.stickyBall.prototype.expirestickyBall = function(ctx) {	

	// mark the stickyBall as expired
	this.isExpired = true;

	// remove the stickyBall from the UI (actually could do with some nice animation)
	ctx.removeChild(this);
}
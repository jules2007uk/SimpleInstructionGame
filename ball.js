goog.provide('evasion.ball');
goog.require('lime.Circle');
goog.require('lime.fill.LinearGradient');
 
evasion.ball = function(isCaught, movementBounds) {
    goog.base(this);
	
	// define the properties of the ball	
	this.isCaught = isCaught; // is the ball caught in the stickyBall?
	this.height = 20; //gameObj.height/50;
	this.width = 20; //gameObj.height/50;
	
	this.setSize(this.width, this.height);	// the size of the ball
	this.radius = (this.width/2); // because the shape is circular, radius is half of width
		
	// set the starting coordinates for the ball before animation
	this.positionX = Math.floor(Math.random() * movementBounds.right) + 1;
	this.positionY = Math.floor(Math.random() * movementBounds.bottom) + 1;
	
	// set the X and Y vectors
	this.positionVX = Math.floor(Math.random() * 2) + 1;
	this.positionVY = Math.floor(Math.random() * 3) + 1;
	
	// set the boundaries within which the ball can move
	this.movementBounds = movementBounds;		
	
	//var randomHexColour = Math.floor(Math.random()*16777215).toString(16);
	
	// define RGB of this ball radomnly
	var r = Math.floor(Math.random() * 256) + 1;
	var g = Math.floor(Math.random() * 256) + 1;
	var b = Math.floor(Math.random() * 256) + 1;
	
	// fill background with gradient
	var gradient = new lime.fill.LinearGradient()
        .setDirection(0,0,1,1) // 45' angle 
        .addColorStop(0, r, g, b ,1) // colour 1
        .addColorStop(1, r, g, b ,.5); // colour 2
	this.setFill(gradient);	
}
 
goog.inherits(evasion.ball,lime.Circle);


/**
 * Start new ball animation
 **/
 
 evasion.ball.prototype.animateball = function(stickyBalls) {
 
	// cycle through all stickyBalls and check if the current ball has collided with it	
	for(i=0; i < stickyBalls.length; i++){
		
		if(stickyBalls[i].isExpired == false){
			// the following code detects collision between this ball and the currently iterated stickyBall
			// this needs to be moved into a function
			var stickyBallInstance = stickyBalls[i];	

			var offset = 0;
			
			// if this is the main stickyBall then we have to set an offset to accurately calculate the collision
			// to cut a long story short, this is because the position of the main stickyBall is offset by 50px on the x and y axis
			// so that the stickyBall appears at the centre of the tap/click, else the circle would start drawing at the position, and appear down and right 
			// of the coordinate
			if(i==0){
				offset = 50;
			}
			
			var distance_squared = ((this.positionX - (stickyBallInstance.position_.x +offset)) * (this.positionX - (stickyBallInstance.position_.x +offset))) + ((this.positionY - (stickyBallInstance.position_.y + offset)) * (this.positionY - (stickyBallInstance.position_.y+offset)));
			var radii_squared = (this.radius + stickyBallInstance.radius) * (this.radius + stickyBallInstance.radius);
			var hasCollided = (distance_squared < radii_squared);
						
			// if the ball has collided with the stickyBall
			if(hasCollided){				
				this.isCaught = true;
			}			
		}
	}
	
	// only need to detect collision with the wall, or change position of the ball if it hasn't been caught
	if(! this.isCaught){
		
		// set new position for ball
		this.positionX += this.positionVX;
		this.positionY += this.positionVY;
		this.setPosition(this.positionX, this.positionY);
		
		// logic to determine what to do when the ball hits a wall
		if(this.positionX >= this.movementBounds.right){
			// ball has hit right wall
			this.positionVX = (-this.positionVX);
			this.positionX = this.movementBounds.right;
		}
		else if(this.positionX <= this.movementBounds.left){
			// ball has hit left wall
			this.positionVX = (-this.positionVX);
			this.positionX = this.movementBounds.left;
		}
		
		if(this.positionY >= this.movementBounds.bottom){
			// ball has hit bottom wall
			this.positionVY = (-this.positionVY);
			this.positionY = this.movementBounds.bottom;
		}
		else if(this.positionY < this.movementBounds.top){
			// ball has hit top wall
			this.positionVY = (-this.positionVY);
			this.positionY = this.movementBounds.top;		
		}
	}
	
	return this;
 };
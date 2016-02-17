goog.provide('evasion.Wall');
// inherits from lime.Sprite which allows creation of rectangles, images, etc.
goog.require('lime.Sprite');
 
evasion.Wall = function() {
    goog.base(this);
	
	//this.setFill('#FF2200').setSize(20,20);
}
 
goog.inherits(evasion.Wall,lime.Sprite);
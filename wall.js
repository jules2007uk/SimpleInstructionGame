goog.provide('rapidreflexes.Wall');
// inherits from lime.Sprite which allows creation of rectangles, images, etc.
goog.require('lime.Sprite');
 
rapidreflexes.Wall = function() {
    goog.base(this);
	
	//this.setFill('#FF2200').setSize(20,20);
}
 
goog.inherits(rapidreflexes.Wall,lime.Sprite);
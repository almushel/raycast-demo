function Sprite(img, x, y, ang, width, height) {
	this.x = x;
	this.y = y;
	this.ang = ang;
	this.src = img;
	this.width = width;
	this.height = height;
	
	this.rotationFrames = 0;
	this.animFrames = 0;
	this.currentRotation = 1;
	this.currentAnimFrame = 1;
	
	this.pic = document.createElement('canvas');
	this.pic.width = width;
	this.pic.height = height;
	
	this.ctx = this.pic.getContext('2d');
}

Sprite.prototype.init = function() {
	this.animFrames = Math.floor(this.src.width / this.width);
	this.rotationFrames = Math.floor(this.src.height / this.height);
	
	if (this.rotationFrames > 1) {
		this.rotationDivision = (Math.PI * 2)/this.rotationFrames;
		this.updateSpriteRotation(Math.PI);
	}
	
	this.updateAnimFrame(0);
}

Sprite.prototype.updateAnimFrame = function(newFrame) {
	if (this.currentAnimFrame != newFrame) {
		this.currentAnimFrame = newFrame;
		this.drawBuffer();
	}
}

Sprite.prototype.updateSpriteRotation = function(whatAng) {
	var deltaAng, newRotation;
	if (this.rotationFrames == 1) {
		newRotation = 0;
	} else {
		deltaAng = whatAng - this.ang + this.rotationDivision/2;
		while (deltaAng < 0) {
			deltaAng += Math.PI*2;
		} 
		while (deltaAng > Math.PI*2) {
			deltaAng -= Math.PI*2;
		}
		newRotation = Math.floor((deltaAng)/this.rotationDivision);
	}
	
	if (this.currentRotation != newRotation) { //Only update rotation if it has changed
		this.currentRotation = newRotation;
		this.drawBuffer();
	}
}

Sprite.prototype.drawBuffer = function() {
	this.ctx.clearRect(0,0, this.width, this.height);
	this.ctx.drawImage(this.src, this.currentAnimFrame * this.width, this.currentRotation * this.height, this.width, this.height, 0, 0, this.width, this.height);
}
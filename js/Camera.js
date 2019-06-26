function Camera(xPos, yPos, xDir, yDir, fov) {
    this.posX = xPos; 
	this.posY = yPos;
	this.dirX = xDir; 
	this.dirY = yDir;
    this.planeX = rotateVector(this.dirX, this.dirY, -Math.PI/2).x * fov;
    this.planeY = rotateVector(this.dirX, this.dirY, -Math.PI/2).y * fov;
}

Camera.prototype.move = function(moveX, moveY, whichMap, whichDoorStates) {

    if (whichMap[Math.floor(this.posX + moveX)][Math.floor(this.posY)] <= 0 ||
    whichDoorStates[Math.floor(this.posX + moveX)][Math.floor(this.posY)] == 2) {
        this.posX += moveX;
    }
    if (worldMap[Math.floor(this.posX)][Math.floor(this.posY + moveY)] <= 0 ||
    whichDoorStates[Math.floor(this.posX)][Math.floor(this.posY + moveY)] == 2) {
        this.posY += moveY;
    }
}

Camera.prototype.rotate = function(angle) { //Rotates camera direction and plane by given angle
    var rDir = rotateVector(this.dirX, this.dirY, angle);
    this.dirX = rDir.x;
    this.dirY = rDir.y;

    var rPlane = rotateVector(this.planeX, this.planeY, angle);
    this.planeX = rPlane.x;
    this.planeY = rPlane.y;
}
function TransparentWall(whichCamera, mapX, mapY, side, screenX) {
    this.mapX = mapX;
    this.mapY = mapY;
    this.side = side;
    this.screenX = [screenX];
    this.camera = whichCamera;//The camera that needs to draw this wall
}

TransparentWall.prototype.getRayDir = function(x, side) {
    if (side == 1) {
       return this.camera.dirY + this.camera.planeY * cameraXCoords[x];
    } else {
        return this.camera.dirX + this.camera.planeX * cameraXCoords[x];
    }      
}

TransparentWall.prototype.getPerpDist = function(x) {
    var step = 1;
    var rayDir = this.getRayDir(x, this.side);
    if (rayDir < 0) {
        step = -1;
    }
    
    if (this.side == 1) {
        return (this.mapY - this.camera.posY + (0.5 * step) + (1 - step) / 2) / rayDir;
    } else {
        return (this.mapX - this.camera.posX + (0.5 * step) + (1 - step) / 2) / rayDir;
    }
}

TransparentWall.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (var x=this.screenX[0]; x<this.screenX[0] + this.screenX.length; x++) {
        var perpDist = this.getPerpDist(x);
        var lineHeight = Math.round(h / perpDist);
        var drawStart = -lineHeight / 2 + canvas.height/2;

        var wallX;
        if (this.side == 0) wallX = this.camera.posY + perpDist * this.getRayDir(x, 1);
        else if (this.side == 1) wallX = this.camera.posX + perpDist * this.getRayDir(x, 0);
        wallX -= Math.floor(wallX);
        
        var texX = Math.floor(wallX * mapForceFieldPic.width);
        ctx.drawImage(mapForceFieldPic, texX, 0, 1, mapForceFieldPic.height, x, drawStart, 1, lineHeight);
    }
    ctx.restore();
}
function drawSkyBox(whichCamera, skyColor, groundColor, pLayer1, pLayer2, pLayer3) {
	//Draw sky
	//Background color
	ctx.fillStyle = skyColor;
	ctx.fillRect(0,0, canvas.width, hHalf)
	
	var distFromEdge = 0;
	
	//Vector distance from camera position to center of the map
	var xDelta = 12 - whichCamera.posX;
	var yDelta = 12 - whichCamera.posY;
	
	//Camera direction vector with scalar circle radius
	var rvX = 12 * whichCamera.dirX;
	var rvY = 12 * whichCamera.dirY;
	
	//Vector from camera position to edge of circle in camera direction
	var edgeVectorX = rvX + xDelta;
	var edgeVectorY = rvY + yDelta;
	
	//Circle intersection point defined by previous vector
	var edgeX = whichCamera.posX + edgeVectorX;
	var edgeY = whichCamera.posY + edgeVectorY;
	
	//Distance from camera position to circle intersect point
	distFromEdge =  Math.sqrt((edgeX - whichCamera.posX)*(edgeX - whichCamera.posX) + (edgeY - whichCamera.posY)*(edgeY - whichCamera.posY));
	edgeDist2 = distFromEdge + distFromEdge;
	
	//Skybox rotation
	var dirOffset = (Math.atan2(whichCamera.dirY, whichCamera.dirX) + Math.PI)/ Math.PI;//Skybox offset based on angle of whichCamera.dirX and whichCamera.dirY
	var foreOffset = Math.floor(dirOffset * canvas.width); //Foreground dimensions: canvas.width x canvas.height/2
	var midOffset = Math.floor(foreOffset/1.5); //Midground width: 2/3 canvas width or canvas.width/1.5
	var backOffset = Math.floor(foreOffset/2); //Background width: 1/2 canvas width

	var midWidth = canvas.width / 1.5;
	var midHeight = hHalf / 1.5;
	var midYPos = (hHalf / 3 - mapWidth) + distFromEdge;//mapWidth is roughly the max value of distFromEdge.
	var backWidth = canvas.width / 2;
	var backHeight = hHalf / 2;
	
	//Rear layer
	ctx.drawImage(pLayer3, 0,0, pLayer3.width, pLayer3.height, backOffset, backHeight, backWidth, backHeight);
	ctx.drawImage(pLayer3, 0,0, pLayer3.width, pLayer3.height, backOffset - backWidth, backHeight, backWidth, backHeight);
	if (dirOffset > 1) {
		ctx.drawImage(pLayer3, 0,0, pLayer3.width, pLayer3.height, backOffset - canvas.width, backHeight, backWidth, backHeight);
	}
	if (dirOffset < 1) {	
		ctx.drawImage(pLayer3, 0,0, pLayer3.width, pLayer3.height, backOffset + backWidth, backHeight, backWidth, backHeight);
	}
	
	//Mid layer
	if (dirOffset < 1.5) {
		ctx.drawImage(pLayer2, 0,0, pLayer2.width, pLayer2.height, midOffset, midYPos, midWidth, midHeight);
	}
	ctx.drawImage(pLayer2, 0,0, pLayer2.width, pLayer2.height, midOffset - midWidth, midYPos, midWidth, midHeight);
	if (dirOffset < 0.5) {
		ctx.drawImage(pLayer2, 0,0, pLayer2.width, pLayer2.height, midOffset + midWidth, midYPos, midWidth, midHeight);
	}
	if (dirOffset > 1) {
		ctx.drawImage(pLayer2, 0,0, pLayer2.width, pLayer2.height, midOffset - midWidth*2, midYPos, midWidth, midHeight);
	}
	
	//Front layer
	if (dirOffset < 1) {
		ctx.drawImage(pLayer1, 0,0, pLayer1.width, pLayer1.height, foreOffset, -46 + edgeDist2, canvas.width, hHalf);	
	}
		ctx.drawImage(pLayer1, 0,0, pLayer1.width, pLayer1.height, foreOffset - canvas.width, -46 + edgeDist2, canvas.width, hHalf);
	if (dirOffset > 1) {
		ctx.drawImage(pLayer1, 0,0, pLayer1.width, pLayer1.height, foreOffset - canvas.width*2, -46 + edgeDist2, canvas.width, hHalf);
	}

	//Draw ground
	ctx.fillStyle = groundColor;
	ctx.fillRect(0, hHalf, canvas.width, hHalf);
}// End of drawSkyBox
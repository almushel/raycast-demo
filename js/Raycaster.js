//Based on https://lodev.org/cgtutor/raycasting.html

const UPDATE_INTERVAL = 1000/60;

const MOVE_SPEED = 0.125;
const TURN_SPEED = 0.03;

var moveSpeed;//MOVE_SPEED * deltaTime;
var turnSpeed;//TURN_SPEED * deltaTime;

var cameraXCoords = [];

var zBuffer = [];//Distance of every wall hit
var tpWalls = [];//Array of visible transparent walls

function generateLookups() {
	for (var x=0; x<w; x++) {
		var cameraX = 2 * x / w - 1; //x-coordinate in camera space
		cameraXCoords.push(cameraX);
	}
}

function drawWall(whichCamera, whichMap, whichDoorStates, whichDoorOffsets, x) {
	//calculate ray position and direction	
	rayDirX = whichCamera.dirX + whichCamera.planeX * cameraXCoords[x];
	rayDirY = whichCamera.dirY + whichCamera.planeY * cameraXCoords[x];
		
	//which box of the map we're in
	var mapX = Math.floor(whichCamera.posX);
	var mapY = Math.floor(whichCamera.posY);

	//length of ray from current position to next x or y-side
	var sideDistX;
	var sideDistY;

	//length of ray from one x or y-side to next x or y-side
	var deltaDistX = Math.abs(1 / rayDirX); //Tile width divided by direction vector x
	var deltaDistY = Math.abs(1 / rayDirY); // Tile height divided by direction vector y
	var perpWallDist;

	//what direction to step in x or y-direction (either +1 or -1)
	var stepX;
	var stepY;

	var hit = 0; //was there a wall hit?
	var side; //was a NS or a EW wall hit?
	
	var wallXOffset = 0;
	var wallYOffset = 0;
		
	//calculate step and initial sideDist
	if (rayDirX < 0) {
		stepX = -1;
		sideDistX = (whichCamera.posX - mapX) * deltaDistX;
	} else {
		stepX = 1;
		sideDistX = (mapX + 1.0 - whichCamera.posX) * deltaDistX;
	}
	if (rayDirY < 0) {
		stepY = -1;
		sideDistY = (whichCamera.posY - mapY) * deltaDistY;
	} else {
		stepY = 1;
		sideDistY = (mapY + 1.0 - whichCamera.posY) * deltaDistY;
	}

	//perform DDA
	while (hit == 0) {
		//jump to next map square, OR in x-direction, OR in y-direction
		if (sideDistX < sideDistY) {
			sideDistX += deltaDistX;
			mapX += stepX;
			side = 0;
		} else {
			sideDistY += deltaDistY;
			mapY += stepY;
			side = 1;
		}
		
		//Check if ray has hit a wall
		var rayTex = whichMap[mapX][mapY];
		var wallX; //Where exactly the wall was hit
		var angleSide = 0; //Which side of angled wall was hit
		if (rayTex != 0) {
			if (rayTex == 3 && whichDoorStates[mapX][mapY] != 2) { //Closed, opening, or closing doors
				hit = 1;
				if (side == 1) {
					wallYOffset = 0.5 * stepY;
					perpWallDist = (mapY - whichCamera.posY + wallYOffset + (1 - stepY) / 2) / rayDirY;
					wallX = whichCamera.posX + perpWallDist * rayDirX;
					wallX -= Math.floor(wallX);
					if (sideDistY - (deltaDistY/2) < sideDistX) { //If ray hits offset wall
						if (1.0 - wallX <= whichDoorOffsets[mapX][mapY]){
							hit = 0; //Continue raycast for open/opening doors
							wallYOffset = 0;
						}
					} else {
						mapX += stepX;
						side = 0;
						rayTex = 4; //Draw door frame instead
						wallYOffset = 0;
					}
				} else { //side == 0
					wallXOffset = 0.5 * stepX;
					perpWallDist  = (mapX - whichCamera.posX + wallXOffset + (1 - stepX) / 2) / rayDirX;
					wallX = whichCamera.posY + perpWallDist * rayDirY;
					wallX -= Math.floor(wallX);
					if (sideDistX - (deltaDistX/2) < sideDistY) {
						if (1.0 - wallX < whichDoorOffsets[mapX][mapY]) {
							hit = 0;
							wallXOffset = 0;
						}
					} else {
						mapY += stepY;
						side = 1;
						rayTex = 4;
						wallXOffset = 0;
					}
				}
			} else if (rayTex == 5 && whichDoorStates[mapX][mapY] != 2) { //Push Walls
				if (side == 1 && sideDistY - (deltaDistY*(1-whichDoorOffsets[mapX][mapY])) < sideDistX) {
					hit = 1;
					wallYOffset = whichDoorOffsets[mapX][mapY] * stepY;
				} else if (side == 0 && sideDistX - (deltaDistX*(1-whichDoorOffsets[mapX][mapY])) < sideDistY) {
					hit = 1;
					wallXOffset = whichDoorOffsets[mapX][mapY] * stepX;
				}
			} else if (rayTex == 6) { //Circular column
				var intersectDist = RayCircle({x: whichCamera.posX, y: whichCamera.posY}, {x: whichCamera.posX + rayDirX, y: whichCamera.posY + rayDirY}, {x: mapX + 0.5, y: mapY + 0.5}, 0.5);
				if (intersectDist != false) {
					hit = 1;
					side = 3;
					var intersect = {x: whichCamera.posX + rayDirX * intersectDist.b, y: whichCamera.posY + rayDirY * intersectDist.b};//We always need the second value
					perpWallDist = ((intersect.x - whichCamera.posX + intersect.y - whichCamera.posY) / 2) / ((rayDirX + rayDirY)/2);
					wallX = Math.atan2(mapY + 0.5 - intersect.y, mapX + 0.5 - intersect.x) / (Math.PI * 2);
					wallX += wallX;
				}
			} else if (rayTex == 7) { //45 degree angle wall 1, -1
				//diagonal line containing points (mapX, mapY + 1) and (mapX + 1, mapY)
				var wallX1 = mapX;
				var wallY1 = mapY + 1;
				var wallX2 = mapX + 1;
				var wallY2 = mapY;
				//Find the intersection of the ray and the line segment
				var intersect = lineIntersect (whichCamera.posX, whichCamera.posY, whichCamera.posX + rayDirX, whichCamera.posY + rayDirY, wallX1, wallY1, wallX2, wallY2);
				if (intersect.x >= mapX & intersect.x <= mapX + 1 &&
					intersect.y >= mapY && intersect.y <= mapY + 1) { //Check that intersect point is on wall line segment
					
					if (side == 1 && stepY < 0 || side == 0 && stepX < 0) angleSide = 1;
					hit = 1;
					side = 2;
					perpWallDist = ((intersect.x - whichCamera.posX + intersect.y - whichCamera.posY) / 2) / ((rayDirX + rayDirY)/2);
				}
			} else if (rayTex == 8) { //45 degree angle wall 1, 1
				//diagonal line containing points (mapX, mapY) and (mapX + 1, mapY)
				var wallX1 = mapX;
				var wallY1 = mapY;
				var wallX2 = mapX + 1;
				var wallY2 = mapY + 1;
				//Find the intersection of the ray and the line segment
				var intersect = lineIntersect (whichCamera.posX, whichCamera.posY, whichCamera.posX + rayDirX, whichCamera.posY + rayDirY, wallX1, wallY1, wallX2, wallY2);
				if (intersect.x >= mapX & intersect.x <= mapX + 1 &&
					intersect.y >= mapY && intersect.y <= mapY + 1) { //Check that intersect point is on wall line segment
						
					if (side == 1 && stepY > 0 || side == 0 && stepX < 0) angleSide = 1;
					side = 2;
					hit = 1;
					perpWallDist = ((intersect.x - whichCamera.posX + intersect.y - whichCamera.posY) / 2) / ((rayDirX + rayDirY)/2);
				}
			} else if (rayTex == 9) { //Transparent walls
				if (side == 1) {
					if (sideDistY - (deltaDistY/2) < sideDistX) { //If ray hits offset wall
						var wallDefined = false;
						for (var i=0; i<tpWalls.length; i++) {
							if (tpWalls[i].mapX == mapX && tpWalls[i].mapY == mapY) {
								tpWalls[i].screenX.push(x);
								wallDefined = true;
								break;
							}
						}
						if (!wallDefined) {
							var tpWall = new TransparentWall(whichCamera, mapX, mapY, side, x);
							tpWalls.push(tpWall);
						}
					}
				} else { //side == 0
					if (sideDistX - (deltaDistX/2) < sideDistY) {
						var wallDefined = false;
						for (var i=0; i<tpWalls.length; i++) {
							if (tpWalls[i].mapX == mapX && tpWalls[i].mapY == mapY) {
								tpWalls[i].screenX.push(x);
								wallDefined = true;
								break;
							}
						}
						if (!wallDefined) {
							var tpWall = new TransparentWall(whichCamera, mapX, mapY, side, x);
							tpWalls.push(tpWall);
						}
					}
				}
		 	} else if (rayTex != 3 && rayTex != 5) {
				if (side == 1 && whichMap[mapX][mapY - stepY] == 3) rayTex = 4;//Draw doorframes on X sides of Y-side walls	
				else if (side == 0 && whichMap[mapX - stepX][mapY] == 3) rayTex = 4;//Draw doorframes on Y sides of X-side walls
				hit = 1;
			}
		}
	} //End of while loop
		
	//Calculate distance projected on camera direction
	if (side == 0) 		perpWallDist = (mapX - whichCamera.posX + wallXOffset + (1 - stepX) / 2) / rayDirX;
	else if (side == 1) perpWallDist = (mapY - whichCamera.posY + wallYOffset + (1 - stepY) / 2) / rayDirY;

	//Calculate height of line to draw on screen
	var lineHeight = Math.round(h / perpWallDist);

	//calculate stripe height
	var drawStart = -lineHeight / 2 + hHalf;
	var drawEnd = drawStart + lineHeight;

	//calculate value of wallX
	if (side == 0) wallX = whichCamera.posY + perpWallDist * rayDirY;
	else if (side == 1 || side == 2) wallX = whichCamera.posX + perpWallDist * rayDirX;
	wallX -= Math.floor(wallX);
	
	if (rayTex == 3) wallX += whichDoorOffsets[mapX][mapY];//Offset door textures
	
	var wallTex;
	switch(rayTex) {
		case 1: 
			wallTex = mapWallPic1;
			break;
		case 2:
			wallTex = mapWallPic2;
			break
		case 3: 
			wallTex = mapDoorPic;
			break;
		case 4:
			wallTex = mapDoorFramePic;
			break;
		case 6:
			wallTex = mapPillarPic;
			break;
		case 9:
			wallTex = mapForceFieldPic;
			break;
		default: 
			wallTex = mapWallPic1;
			break;
	}
		
	//x coordinate on the texture
	var texX = Math.floor(wallX * wallTex.width);
	if(side == 0 && rayDirX > 0) texX = wallTex.width - texX - 1;
	else if(side == 1 && rayDirY < 0) texX = wallTex.width - texX - 1;

	//draw wall texture
	ctx.drawImage(wallTex, texX, 0, 1, wallTex.height, x, drawStart, 1, lineHeight);

	if (side == 1 && rayTex != 3) { //Darken y-side walls
		ctx.strokeStyle = 'rgba(0,0,0,0.5)';
		ctx.beginPath();
		ctx.moveTo(x, drawStart);
		ctx.lineTo(x, drawEnd);
		ctx.stroke();
	} else if (side == 2) { //Shade 45 degree walls
		if (angleSide == 0) var shadeOpacity = 0.6 * wallX;
		else var shadeOpacity = 0.6 * (1 - wallX);
		
		ctx.strokeStyle = 'rgba(0,0,0,'+shadeOpacity+')';
		ctx.beginPath();
		ctx.moveTo(x, drawStart);
		ctx.lineTo(x, drawEnd);
		ctx.stroke();
	}
	
	zBuffer[x] = perpWallDist;
}//End of drawWalls

function drawSpritesAndTransparentWalls(whichCamera, whichZBuffer, whichSprites, whatOrder) {
	//SPRITE CASTING
	if (frameCount == 1 || frameCount % 4 == 0) {
		for (var i=0; i<whichSprites.length; i++) { //Calculate sprite distances and reset order
			whatOrder[i] = i;
			spriteDistance[i] = ((whichCamera.posX - whichSprites[i].x) * (whichCamera.posX - whichSprites[i].x)) + ((whichCamera.posY - whichSprites[i].y) * (whichCamera.posY - whichSprites[i].y));
		}
		combSort(whatOrder, spriteDistance, whichSprites.length); //Sort sprites by distance from the camera
	}
	
	var tp = -1;
	if (tpWalls.length > 0) {
		tp = tpWalls.length - 1;
	}
	for (var i=0; i<whichSprites.length; i++) {
		var spriteX = whichSprites[whatOrder[i]].x - whichCamera.posX;
		var spriteY = whichSprites[whatOrder[i]].y - whichCamera.posY;
		
		var invDet = 1.0 / (whichCamera.planeX * whichCamera.dirY - whichCamera.dirX * whichCamera.planeY);
		var transformX = invDet * (whichCamera.dirY * spriteX - whichCamera.dirX * spriteY);
		var transformY = invDet * (-whichCamera.planeY * spriteX + whichCamera.planeX * spriteY);

		if (transformY > 0) { //No need for the rest if the sprite is behind the player
			for (tp; tp>=0; tp--) {
				var tpDist = ((whichCamera.posX - tpWalls[tp].mapX)*(whichCamera.posX - tpWalls[tp].mapX)) + ((whichCamera.posY - tpWalls[tp].mapY) * (whichCamera.posY - tpWalls[tp].mapY));
				if (spriteDistance[i] < tpDist) {
					tpWalls[tp].draw();
				} else {
					break;
				}
			}

			var spriteHeight = Math.abs(Math.floor(h/transformY));
			var drawStartY = -spriteHeight / 2 + hHalf;

			var spriteScreenX = Math.floor(w/2) * (1 + transformX / transformY);
			var spriteWidth = Math.abs(Math.floor(h / transformY));
			var drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
			var drawEndX = drawStartX + spriteWidth;
			
			var clipStartX = drawStartX;
			var clipEndX = drawEndX;

			if (drawStartX < -spriteWidth) {
				drawStartX = -spriteWidth;
			}
			if (drawEndX > w + spriteWidth) {
				drawEndX = w + spriteWidth;
			}

			for (var stripe=drawStartX; stripe<=drawEndX; stripe++) {
				if (transformY > whichZBuffer[stripe]) {
					if (stripe - clipStartX <= 1) { //Detect leftmost obstruction
						clipStartX = stripe;
					} else {
						clipEndX = stripe; //Detect rightmost obstruction
						break;
					}
				}	
			}
			
			if (clipStartX != clipEndX && clipStartX < w && clipEndX > 0) { //Make sure the sprite is not fully obstructed or off screen
				var scaleDelta = whichSprites[whatOrder[i]].width / spriteWidth;
				var drawXStart = Math.floor((clipStartX - drawStartX) * scaleDelta);
				if (drawXStart < 0) {
					drawXStart = 0;
				}
				var drawXEnd = Math.floor((clipEndX - clipStartX) * scaleDelta) + 1;
				if (drawXEnd > whichSprites[whatOrder[i]].width) {
					drawEndX = whichSprites[whatOrder[i]].width;
				}
				var drawWidth = clipEndX - clipStartX;
				if (drawWidth < 0) {
					drawWidth = 0;
				}
				var drawAng = Math.atan2(spriteY, spriteX);
				whichSprites[whatOrder[i]].updateSpriteRotation(drawAng);
				ctx.save();
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(whichSprites[whatOrder[i]].pic, drawXStart, 0, drawXEnd, whichSprites[whatOrder[i]].height, clipStartX, drawStartY, drawWidth, spriteHeight);
				ctx.restore();
			}
		}
	}//End of spriteList for loop

	for (tp; tp >= 0; tp--) {//Draw the remaining transparent walls
		tpWalls[tp].draw();
	}
	tpWalls.length = 0;
}//End of drawSprites
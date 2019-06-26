const MAP_FLOOR = 0;
const MAP_WALL_1 = 1;
const MAP_WALL_2 = 2;
const MAP_DOOR = 3;
const MAP_DOOR_FRAME = 4;
const MAP_PUSH_WALL = 5;

var mapWidth = 24;
var mapHeight = 24;

var worldMap = [	
					[1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,1,2,1,2,1],
					[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2],
					[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,5,2,1,1,1],
					[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2],
					[1,0,0,0,0,0,0,0,0,0,6,0,0,0,0,2,0,0,0,0,0,0,0,1],
					[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2],
					[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1],
					[2,0,0,0,0,0,7,2,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,2],
					[1,0,0,0,0,0,2,7,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1],
					[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,2],
					[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1],
					[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
					[1,0,0,0,0,0,0,0,0,7,1,9,1,8,0,0,0,0,0,0,0,0,0,1],
					[2,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,2],
					[1,0,0,0,0,0,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,1],
					[2,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,2,2,2],
					[1,0,0,0,0,0,0,0,0,8,1,9,1,7,0,0,0,0,0,0,0,2,0,1],
					[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2],
					[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
					[2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,1],
					[1,0,0,2,2,0,0,0,0,2,2,3,2,2,0,0,0,0,0,0,0,2,0,1],
					[2,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,2],
					[1,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,2,0,1],
					[1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,1]
				];

var doorOffsets = []; 
var doorStates = [];

function loadMap(whichMap) {
	var newRow = [];
	for (var x=0; x<whichMap.length; x++) {
		newRow.push(0);
	}
	for (var y=0; y<whichMap[0].length; y++) {
		doorOffsets.push(newRow.slice())
		doorStates.push(newRow.slice())
	}
}

function moveDoors(whichMap, whichStates, whichOffsets) {
	for (var x = 0; x < whichMap.length; x++) {
		for (var y = 0; y < whichMap[0].length; y++) {
			//0: Closed, 1: Opening, 2: Open, 3: Closing
			if (whichMap[x][y] == 3) { //Standard door
				if (whichStates[x][y] == 1){//Open doors
					whichOffsets[x][y] += deltaTime / 100;

					if (whichOffsets[x][y] > 1) {
						whichOffsets[x][y] = 1;
						whichStates[x][y] = 2;//Set state to open
						setTimeout(function(stateX, stateY){whichStates[stateX][stateY] = 3;}, 5000, x, y);//TO DO: Don't close when player is in tile
					}
				} else if (whichStates[x][y] == 3) {//Close doors
					whichOffsets[x][y] -= deltaTime / 100;
					
					if (whichOffsets[x][y] < 0) {
						whichOffsets[x][y] = 0;
						whichStates[x][y] = 0;//Set state to closed
					}
				}
			} else if (whichMap[x][y] == 5) {//Push wall
				if (whichStates[x][y] == 1){//Open push wall
					whichOffsets[x][y] += deltaTime / 100;

					if (whichOffsets[x][y] > 2) {
						whichOffsets[x][y] = 2;
						whichStates[x][y] = 2;//Set state to open
					}
				}
			}
		}
	}
}

function openDoor(whichCamera, whichMap, whichDoorStates) {	
	var checkMapX = Math.floor(whichCamera.posX + whichCamera.dirX);
	var checkMapY = Math.floor(whichCamera.posY + whichCamera.dirY);
	
	var checkMapX2 = Math.floor(whichCamera.posX + whichCamera.dirX*2);
	var checkMapY2 = Math.floor(whichCamera.posY + whichCamera.dirY*2);
	
	if (whichMap[checkMapX][checkMapY] == 3 || whichMap[checkMapX][checkMapY] == 5 && whichDoorStates[checkMapX][checkMapY] == 0) { //Open door in front of camera
		whichDoorStates[checkMapX][checkMapY] = 1;
	}
	if (whichMap[checkMapX2][checkMapY2] == 3 || whichMap[checkMapX2][checkMapY2] == 5 && whichDoorStates[checkMapX2][checkMapY2] == 0) {
		whichDoorStates[checkMapX2][checkMapY2] = 1;
	}
	
	if (whichMap[Math.floor(whichCamera.posX)][Math.floor(whichCamera.posY)] == 3) { //Avoid getting stuck in doors
		whichDoorStates[Math.floor(whichCamera.posX)][Math.floor(whichCamera.posY)] = 1;
	}
}

function drawMiniMap(whichMap) {
	var mapMulti = 8
	var rectLeft = canvas.width - mapWidth*mapMulti;
	var rectTop = 0;
	var rectRight = mapWidth*mapMulti;
	var rectBottom = mapHeight*mapMulti;
	
	ctx.fillStyle = '#1d3030';
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.rect(rectLeft, rectTop, rectRight, rectBottom);
	ctx.fill();
	//ctx.stroke();
	
	//Map Layout
	for (var x=0; x<whichMap.length; x++) {
		for (var y=0; y<whichMap[x].length; y++) {
			var fillColor = 'rgba(0,0,0,0)';
			switch (whichMap[x][y]) {
				case 1:
					fillColor = 'lightgrey';
					break;
				case 2:
					fillColor = 'lightgrey';
					break;
				case 3:
					fillColor = 'dodgerblue';
					break;
				default:
					fillColor = 'rgba(0,0,0,0)';
					break;
			}
			ctx.fillStyle = fillColor;
			ctx.fillRect(rectLeft + x * mapMulti, rectTop + y * mapMulti, mapMulti, mapMulti);
		}
		
		//Camera Position
		var camX = rectLeft + posX * mapMulti;
		var camY = rectTop + posY * mapMulti
		ctx.fillStyle = 'yellow';
		ctx.beginPath();
		ctx.arc(camX, camY, mapMulti/2, 0, Math.PI*2, false);
		ctx.fill();
		ctx.moveTo(camX, camY);
		ctx.lineTo(camX+ dirX * mapMulti, camY + dirY * mapMulti);
		ctx.stroke();
		
		//Sprite Positions
		ctx.fillStyle = 'red';
		for (var s=0; s<spriteList.length; s++) {
			ctx.beginPath();
			ctx.arc(rectLeft + spriteList[s].x * mapMulti, rectTop + spriteList[s].y * mapMulti, mapMulti/2, 0, Math.PI*2, false);
			ctx.fill();
		}
	}
}
var canvas, ctx;
var w, h, hHalf;
var player;

window.onload = function(){
	canvas = document.getElementById('gameCanvas');
	ctx = canvas.getContext('2d');
	w = canvas.width;
	h = canvas.height;
	hHalf = Math.round(h/2);
    zBuffer.length = w;
    
    ctx.fillRect(0,0,w,h,'black');
	
	loadMap(worldMap);
	generateLookups();
	player = new Camera(14.5, 6, 0, 1, 0.66)
	setupInput();
	loadImages();
}

//Reset frametimer when document is hidden to account for requestAnimationFrame pausing/throttling
document.onvisibilitychange = function() {
	lastFrame = performance.now() - UPDATE_INTERVAL;
}

function update() {
    updateFrameTimes();
    moveAll();
    drawAll();
	requestAnimationFrame(update);
}

function moveAll() {
    moveCamera(player, worldMap, doorStates);
	moveDoors(worldMap, doorStates, doorOffsets);
}

function drawAll() {
    ctx.clearRect(0,0, w,h);
    //drawSkyBox(player, '#351c66', 'darkslategrey', skyBox1, skyBox2, skyBox3);
	for(var x = 0; x < w; x++) {
		drawWall(player, worldMap, doorStates, doorOffsets, x);
	}
    drawSpritesAndTransparentWalls(player, zBuffer, spriteList, spriteOrder);
    
    if (showFPS) {
        if (frameCount == 1 || frameCount % 2 == 0) {
            frameRate = averageFramerate(frameTime);
        }
        drawFramerateCounter();
	}
}
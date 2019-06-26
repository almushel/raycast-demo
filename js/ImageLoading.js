var mapWallPic1 = document.createElement('img');
var mapWallPic2 = document.createElement('img');
var mapDoorPic = document.createElement('img');
var mapDoorFramePic = document.createElement('img');
var mapPillarPic = document.createElement('img');
var mapForceFieldPic = document.createElement('img');
var spaceMarinePic = document.createElement('img');
var deathOrbPic = document.createElement('img');
var skyBox1 = document.createElement('img');
var skyBox2 = document.createElement('img');
var skyBox3 = document.createElement('img');

var imagesToLoad = 0;

var smSprite1, smSprite2, smSprite3, smSprite4, doSprite1;
var spriteList = [];
var spriteDistance = [];
var spriteOrder = [];//Stores sorted spriteList indexes

function loadImages() {
	
	var imageList = [
		{varName: mapWallPic1, fileName: 'map_wall.png'},
		{varName: mapWallPic2, fileName:  'map_wall2.png'},
		{varName: mapDoorPic, fileName: 'map_door.png'},
		{varName: mapDoorFramePic, fileName: 'map_door_frame.png'},
		{varName: mapPillarPic, fileName: 'map_pillar.png'},
		{varName: mapForceFieldPic, fileName: 'map_force_field.png'},
		{varName: deathOrbPic, fileName: 'death_orb.png'},
		{varName: skyBox1, fileName: 'skybox1.png'},
		{varName: skyBox2, fileName: 'skybox2.png'},
		{varName: skyBox3, fileName: 'skybox3.png'}
	]
	
	imagesToLoad = imageList.length;
	
	for (var i=0; i<imageList.length; i++) {
		if(imageList[i].varName != undefined) {
			beginLoadingImage(imageList[i].varName, imageList[i].fileName)
		}
	}
}

function beginLoadingImage(imgVar, fileName) {
	imgVar.src = 'images/'+fileName;
	imgVar.onload = function() {countImagesOrStartGame()};
}	

function countImagesOrStartGame() {//Ensure that all images are loaded before trying to do anything with them.
	imagesToLoad--;
	if (imagesToLoad == 0) {
		loadSprites();
		frameCount = 0;
		lastFrame = performance.now();
		update();
	}
}

function loadSprites() {
	doSprite1 = new Sprite(deathOrbPic, 22.5, 22.5, 0, 64, 64);
	spriteList.push(doSprite1);
	doSprite2 = new Sprite(deathOrbPic, 6, 12, Math.PI*0.5, 64, 64);
	spriteList.push(doSprite2);
	doSprite3 = new Sprite(deathOrbPic, 6, 9, Math.PI*1.5, 64, 64);
	spriteList.push(doSprite3);
	doSprite4 = new Sprite(deathOrbPic, 1.5, 22.5, Math.PI*0.5, 64, 64);
	spriteList.push(doSprite4);
	doSprite5 = new Sprite(deathOrbPic, 14.5, 11.5, 0, 64, 64);
	spriteList.push(doSprite5);

	for (var i=0; i<spriteList.length; i++) {
		spriteList[i].init();
	}
	
	spriteOrder.length = spriteList.length;
}
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_Q = 81;
const KEY_E = 69;
const KEY_SPACE = 32;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;

var keyHeldUp, keyHeldLeft, keyHeldDown, keyHeldRight, keyHeldTurnLeft, keyHeldTurnRight, keyHeldSpace;

function setupInput() {
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown(evt) {
	if (evt.keyCode == KEY_W || evt.keyCode == KEY_ARROW_UP) {
		keyHeldUp = true;
	}
	if (evt.keyCode == KEY_A) {
		keyHeldLeft = true;
	}
	if (evt.keyCode == KEY_S || evt.keyCode == KEY_ARROW_DOWN) {
		keyHeldDown = true;
	}
	if (evt.keyCode == KEY_D) {
		keyHeldRight = true;
	}
	if (evt.keyCode == KEY_E || evt.keyCode == KEY_ARROW_RIGHT) {
		keyHeldTurnRight = true;
	}
	if (evt.keyCode == KEY_Q || evt.keyCode == KEY_ARROW_LEFT) {
		keyHeldTurnLeft = true;
	}
	if (evt.keyCode == KEY_SPACE) {
		openDoor(player, worldMap, doorStates, doorOffsets);
		keyHeldSpace = true;
	}
}

function handleKeyUp(evt) {
	if (evt.keyCode == KEY_W || evt.keyCode == KEY_ARROW_UP) {
		keyHeldUp = false;
	}
	if (evt.keyCode == KEY_A) {
		keyHeldLeft = false;
	}
	if (evt.keyCode == KEY_S || evt.keyCode == KEY_ARROW_DOWN) {
		keyHeldDown = false;
	}
	if (evt.keyCode == KEY_D) {
		keyHeldRight = false;
	}
	if (evt.keyCode == KEY_E || evt.keyCode == KEY_ARROW_RIGHT) {
		keyHeldTurnRight = false;
	}
	if (evt.keyCode == KEY_Q || evt.keyCode == KEY_ARROW_LEFT) {
		keyHeldTurnLeft = false;
	}
	if (evt.keyCode == KEY_SPACE) {
		keyHeldSpace = false;
	}
}

function moveCamera(whichCamera, whichMap, whichDoorStates) {
	//MOVEMENT AND INPUT
	moveSpeed = MOVE_SPEED * deltaTime;
	turnSpeed = TURN_SPEED * deltaTime;

	var moveX = 0;
	var moveY = 0;

	if (keyHeldUp) { //Move forward
		moveX += whichCamera.dirX;
		moveY += whichCamera.dirY;
	}
	if (keyHeldDown) { //Backpedal
		moveX -= whichCamera.dirX;
		moveY -= whichCamera.dirY;	
	}
	
	if (keyHeldRight) { //Strafe right
		moveX += whichCamera.planeX;
		moveY += whichCamera.planeY;
	}
	if (keyHeldLeft) { //Strafe left
		moveX -= whichCamera.planeX;
		moveY -= whichCamera.planeY;
	}

	if (keyHeldTurnRight) { //Turn right
		whichCamera.rotate(-turnSpeed);
	}
	if (keyHeldTurnLeft) { //Turn left
		whichCamera.rotate(turnSpeed);
	}

	moveX *= moveSpeed;
	moveY *= moveSpeed;
	whichCamera.move(moveX, moveY, whichMap, whichDoorStates);
}//End of moveCamera();
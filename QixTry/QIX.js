let gameField;
let Borders;
// [0] LEFT;
// [1] RIGTH;
// [2] TOP;
// [3] BOTTOM;

let player;
let PspeedX = 0;
let PspeedY = 0;
let currentPlayerDirection = null; // Tracks the current movement direction
let lastPlayerDirChange = 0; // Timestamp of the last direction change
const DIRECTION_COOLDOWN = 200; // Cooldown in milliseconds (adjustable)

let qix;

let sparx;
let currentSparcDirection = 'horizontal'; 
let sparcSpeed = 2;

let color;
let pallete = ["#D88C9A", "#B6EFD4", "#fdffb6", "#8E7DBE", "#A0CCDA"];



function setup() {
  new Canvas(windowWidth, windowHeight);
  displayMode(CENTER);
  textAlign(CENTER);
  world.gravity.y = 0;
  world.gravity.x = 0;

  //---GAME FIELD AND BORDERS---
  gameField = new Sprite();
    gameField.x = windowWidth / 2;
    gameField.y = windowHeight / 2;
    gameField.w = windowHeight - (windowHeight / 8);
    gameField.h = windowHeight - (windowHeight / 8);
    gameField.color = random(pallete);

  Borders = new Group();
    Borders.collider = 'k';
    Borders.visible = false;
  while( Borders.length < 2){ //make default left border
    let ogBorder = new Borders.Sprite();
    ogBorder.x = gameField.x - gameField.w/2;
    ogBorder.y = gameField.y;
    ogBorder.w = 1;
    ogBorder.h = gameField.h;
  }
    //right border
    Borders[1].x = gameField.x + gameField.w/2;

    while( Borders.length < 4){ //make default top border
      let ogBorder = new Borders.Sprite();
      ogBorder.x = gameField.x ;
      ogBorder.y = gameField.y  - gameField.h/2;
      ogBorder.w = gameField.w;
      ogBorder.h = 1;
    }
    //bottom border
    Borders[3].y = gameField.y + gameField.h/2;   


//--PLAYER AND ENEMIES---
  player = new Sprite();
    player.diameter = 25;
    player.x = windowWidth / 2;
    player.y = gameField.y + gameField.h / 2;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.color = "#8CB369";
    player.collider = 'k';

  qix = new Sprite();
    qix.x = gameField.x;
    qix.y = gameField.y - gameField.h / 2 + 50;
    qix.w = 25;
    qix.h = 25;
    qix.rotation = 45;
    qix.rotationLock = true;
    qix.color = "#a71d31"
    qix.collider = "d";
    qix.bounciness = 1;
    qix.velocity.x = random(-2, 2);
    qix.velocity.y = random(-2, 2);

  sparx = new Group();
    sparx.x = gameField.x;
    sparx.y = gameField.y - gameField.h / 2 
    sparx.w = 15;
    sparx.h = 15;
    sparx.color = "#706993"
    sparx.collider = "k";
    sparx.velocity.x = sparcSpeed;
    sparx.velocity.y = 0;
    

	let ogSparc = new sparx.Sprite();


  //---Layering---
  player.overlaps(gameField);
  qix.overlaps(gameField);

  sparx.overlaps(gameField);
  sparx.overlaps(Borders);

  Borders.overlaps(gameField);
  Borders.overlaps(Borders);  
}

function draw() {
  background('#e3d5ca');

  // Apply velocity based on current speed
  player.velocity.x = PspeedX;
  player.velocity.y = PspeedY;
  // Constrain player within game field
  player.x = constrain(player.x, windowWidth / 2 - gameField.w / 2, windowWidth / 2 + gameField.w / 2);
  player.y = constrain(player.y, windowHeight / 2 - gameField.h / 2, windowHeight / 2 + gameField.h / 2);

  //---Display directions/info---
  push();
  textSize(20);
  text('↑', width * 0.9, height - (height * 0.3));
  text('← move →', width * 0.9, height - (height * 0.2));
  text('↓', width * 0.9, height - (height * 0.1));
  pop();

  //--Keep Qix Bouncing Continuosly---
  if ( qix.vel.x < 1 &&  qix.vel.x > 0 || qix.vel.x == 0 ){ //makes sure 
    qix.vel.x = random(1, 2);   // not stuck in vertical bounce loop
  }
  else if (qix.vel.x > -1 &&  qix.vel.x < 0){
  qix.vel.x = random(-2, 1); 
  }
  if ( qix.vel.y < 1 &&  qix.vel.y > 0 || qix.vel.y == 0){ //makes sure 
      qix.vel.y = random(1, 2);   //not stuck in horizantal bounce loop
  }
  else if (qix.vel.y > -1 &&  qix.vel.y < 0){
  qix.vel.y =  random(-2, 1); 
  }

  //---SPARC MOVEMENT RULES---
  //if sparc overlaps multiple borders, its time to change route;
  for (let sparc of sparx) { //doesnt work :/
    updateSparc(sparc);
  }  

}

//---SPARX MOVEMENT---
function  updateSparc(sparc){
	let sparcPathVal = 0;
	for (let border of Borders){                       
	  if (containsPoint(border, sparc.x, sparc.y)) {    
		sparcPathVal++;
		console.log("point is in a border");
	  }
	}
	if (sparcPathVal < 1) {
		sparcDirChange(sparc);
	}
	else if (sparcPathVal > 1){ //multiple paths detected
	  console.log("multimple paths detected");
    sparc.velocity.x *= 0 ;
		sparc.velocity.y *= 0;
	}
}
//checks if point os contained in object, doesnt have to be a border
function containsPoint(border, x, y){
	let topBound = border.y - border.h/2;
	let leftBound = border.x - border.w/2;
	let rightBound = border.x + border.w/2;
	let bottomBound = border.y + border.h/2;
  
	if ( x < rightBound &&  x > leftBound && y < bottomBound && y > topBound){ 
	  return true;
	}
	else {
	  return false;
	}
}
//finds next direction and changes sparc path
function sparcDirChange(sparc){
	console.log("sparcDirChange function active");
	// the idea is to make a temporary tester sprite, see if up
	//  is the correct direction by moving it slightly up, if it overlaps, set 
	// the velocity of sparc accordingly

  let test = new Sprite();
		test.visible = false;
		test.x = sparc.x;
		test.y = sparc.y;
		test.velocity.x = 0;
		test.velocity.y = 0;
		test.overlaps(allSprites);
  
	if (sparc.velocity.x > 0 || sparc.velocity.x < 0){ // this code favors taking upward turns
	  sparc.velocity.x = 0; //stop moving
	  test.y = sparc.y - 2; //move up
	
	  let sparcDirSetter = 1;
	  for (const border of Borders) { // check if on path
		if (containsPoint(border, test.x, test.y)){
		sparcDirSetter = -1;
		}
	  }
	  sparc.velocity.y = sparcDirSetter*sparcSpeed ;
	}
	else {  ///this code favors taking left turns
	  sparx.velocity.y = 0; //stop moving
	  test.x = sparc.x - 2; // move left
	  let sparcDirSetter = 1;
  
	  for (const border of Borders) {
		if (containsPoint(border, test.x, test.y)){
		  sparcDirSetter = -1;
		}
	  }
	  sparc.velocity.x = sparcDirSetter*sparcSpeed ;
	 
	}
	console.log('sparcdir changed: ', sparc.velocity.x, sparc.velocity.y);
}

//---PLAYER MOVEMENT---
// Helper function to set direction and update speeds
function setPlayerDirection(direction) {
  PspeedX = 0; // Reset both speeds first
  PspeedY = 0;

  switch (direction) {
    case 'up':
      PspeedY = -3;
      break;
    case 'down':
      PspeedY = 3;
      break;
    case 'left':
      PspeedX = -3;
      break;
    case 'right':
      PspeedX = 3;
      break;
  }

  currentPlayerDirection = direction;
  lastPlayerDirChange = millis(); // Update timestamp
}
// Helper function to stop movement
function stopMovement() {
  PspeedX = 0;
  PspeedY = 0;
  currentPlayerDirection = null; // Clear direction
}

function keyPressed() {
  // Get current time
  let currentTime = millis();

  // Only allow direction change if cooldown has passed
  if (currentTime - lastPlayerDirChange < DIRECTION_COOLDOWN) {
    return; // Exit if still in cooldown
  }

  // Handle key presses and lock to one direction
  if (keyCode === 40 && currentPlayerDirection != 'down') { // DOWN ARROW
    setPlayerDirection('down');
  } else if (keyCode === 38 && currentPlayerDirection != 'up') { // UP ARROW
    setPlayerDirection('up');
  } else if (keyCode === 39 && currentPlayerDirection != 'right') { // RIGHT ARROW
    setPlayerDirection('right');
  } else if (keyCode === 37 && currentPlayerDirection != 'left') { // LEFT ARROW
    setPlayerDirection('left');
  }
}
function keyReleased() {
  // Stop movement only if the released key matches the current direction
  if (keyCode === 40 && currentPlayerDirection === 'down') { // DOWN ARROW
    stopMovement();
  } else if (keyCode === 38 && currentPlayerDirection === 'up') { // UP ARROW
    stopMovement();
  } else if (keyCode === 39 && currentPlayerDirection === 'right') { // RIGHT ARROW
    stopMovement();
  } else if (keyCode === 37 && currentPlayerDirection === 'left') { // LEFT ARROW
    stopMovement();
  }
}
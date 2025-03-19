let player;
let gameField;
let borderL;
let borderU;
let borderR;
let borderD;

let qix;

let color;
let pallete = ["#D88C9A", "#B6EFD4", "#fdffb6", "#8E7DBE", "#A0CCDA"];

let PspeedX = 0;
let PspeedY = 0;
let currentDirection = null; // Tracks the current movement direction
let lastDirectionChange = 0; // Timestamp of the last direction change
const DIRECTION_COOLDOWN = 200; // Cooldown in milliseconds (adjustable)

function setup() {
  new Canvas(windowWidth, windowHeight);
  displayMode(CENTER);
  textAlign(CENTER);
  world.gravity.y = 0;
  world.gravity.x = 0;

  //---GAME FIELD ADN BORDERS---
  gameField = new Sprite();
    gameField.x = windowWidth / 2;
    gameField.y = windowHeight / 2;
    gameField.w = windowHeight - (windowHeight / 8);
    gameField.h = windowHeight - (windowHeight / 8);
    gameField.color = random(pallete);

  borderL = new Sprite();
    borderL.collider = 'k';
    borderL.visible = false;
    borderL.x = gameField.x - gameField.w/2;
    borderL.y = gameField.y;
    borderL.w = 0.1;
    borderL.h = gameField.h;

  borderU = new Sprite();
    borderU.collider = 'k';
    borderU.visible = false;
    borderU.x = gameField.x ;
    borderU.y = gameField.y - gameField.h/2;
    borderU.w = gameField.w;
    borderU.h = 0.1;

  borderR = new Sprite();
    borderR.collider = 'k';
    borderR.visible = false;
    borderR.x = gameField.x + gameField.w/2;
    borderR.y = gameField.y;
    borderR.w = 0.1;
    borderR.h = gameField.h;

  borderD = new Sprite();
    borderD.collider = 'k';
    borderD.visible = false;
    borderD.x = gameField.x ;
    borderD.y = gameField.y + gameField.h/2;
    borderD.w = gameField.w;
    borderD.h = 0.1;


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
    qix.collider = "d";
    qix.bounciness = 1;
    qix.velocity.x = random(-2, 2);
    qix.velocity.y = random(-2, 2);

  player.overlaps(gameField);
  qix.overlaps(gameField);
  borderL.overlaps(gameField);
  borderU.overlaps(gameField);
  borderR.overlaps(gameField);
  borderD.overlaps(gameField);

  borderR.overlaps(borderD);
  borderU.overlaps(borderR);
  
}

function draw() {
  background('#e3d5ca');

  // Apply velocity based on current speed
  player.velocity.x = PspeedX;
  player.velocity.y = PspeedY;

  // Constrain player within game field
  player.x = constrain(player.x, windowWidth / 2 - gameField.w / 2, windowWidth / 2 + gameField.w / 2);
  player.y = constrain(player.y, windowHeight / 2 - gameField.h / 2, windowHeight / 2 + gameField.h / 2);

  // Display direction info
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


}

function keyPressed() {
  // Get current time
  let currentTime = millis();

  // Only allow direction change if cooldown has passed
  if (currentTime - lastDirectionChange < DIRECTION_COOLDOWN) {
    return; // Exit if still in cooldown
  }

  // Handle key presses and lock to one direction
  if (keyCode === 40 && currentDirection != 'down') { // DOWN ARROW
    setDirection('down');
  } else if (keyCode === 38 && currentDirection != 'up') { // UP ARROW
    setDirection('up');
  } else if (keyCode === 39 && currentDirection != 'right') { // RIGHT ARROW
    setDirection('right');
  } else if (keyCode === 37 && currentDirection != 'left') { // LEFT ARROW
    setDirection('left');
  }
}

function keyReleased() {
  // Stop movement only if the released key matches the current direction
  if (keyCode === 40 && currentDirection === 'down') { // DOWN ARROW
    stopMovement();
  } else if (keyCode === 38 && currentDirection === 'up') { // UP ARROW
    stopMovement();
  } else if (keyCode === 39 && currentDirection === 'right') { // RIGHT ARROW
    stopMovement();
  } else if (keyCode === 37 && currentDirection === 'left') { // LEFT ARROW
    stopMovement();
  }
}

// Helper function to set direction and update speeds
function setDirection(direction) {
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

  currentDirection = direction;
  lastDirectionChange = millis(); // Update timestamp
}

// Helper function to stop movement
function stopMovement() {
  PspeedX = 0;
  PspeedY = 0;
  currentDirection = null; // Clear direction
}


let gameField;
let Borders;
// [0] LEFT;
// [1] RIGTH;
// [2] TOP;
// [3] BOTTOM;

let player;
let qix;
let sparc;

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
    ogBorder.w = 0.1;
    ogBorder.h = gameField.h;
  }
    //right border
    Borders[1].x = gameField.x + gameField.w/2;
    while( Borders.length < 4){ //make default top border
      let ogBorder = new Borders.Sprite();
      ogBorder.x = gameField.x ;
      ogBorder.y = gameField.y  - gameField.h/2;
      ogBorder.w = gameField.w;
      ogBorder.h = 0.1;
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

  sparc = new Sprite();
    sparc.x = gameField.x;
    sparc.y = gameField.y - gameField.h / 2 
    sparc.w = 15;
    sparc.h = 15;
    sparc.color = "#706993"
    sparc.collider = "k";


  //---Layering---
  player.overlaps(gameField);
  qix.overlaps(gameField);
  sparc.overlaps(gameField);
  sparc.overlaps(Borders[0]);
  sparc.overlaps(Borders[1]);
  sparc.overlaps(Borders[2]);
  sparc.overlaps(Borders[3]);

  Borders[0].overlaps(gameField);
  Borders[2].overlaps(gameField);
  Borders[1].overlaps(gameField);
  Borders[3].overlaps(gameField);
  Borders[1].overlaps(Borders[3]);
  Borders[2].overlaps(Borders[1]);
  
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


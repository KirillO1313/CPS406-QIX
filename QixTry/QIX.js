let gameField;
let Borders;
// [0] LEFT;
// [1] RIGTH;
// [2] TOP;
// [3] BOTTOM;

let level = 1;
let hearts;
let heartImg;
let gameState = intro;
let cover;
let font;
let color;
let pallete = ["#D88C9A", "#B6EFD4", "#fdffb6", "#8E7DBE", "#A0CCDA"];

let player;
  let lives = 3;
  let score = 0;
  let claimedArea = 0;
let PspeedX = 0;
let PspeedY = 0;
let currentPlayerDirection = null; // Tracks the current movement direction
let lastPlayerDirChange = 0; // Timestamp of the last direction change
const DIRECTION_COOLDOWN = 200; // Cooldown in milliseconds (adjustable)

let qixi;
let sparx;
let currentSparcDirection = 'horizontal'; 
let sparcSpeed = 2;


function preload(){
  cover = loadImage("coverArt.png");
  heartImg = loadImage("heart.png");
  font = loadFont('LLDEtechnoGlitchGX.ttf');
}

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


//---hearts---
hearts = new Group();
    hearts.image = heartImg;
    hearts.collider = "s";
for (let x = 0; x < lives;  x++) {
  let heart = new hearts.Sprite();
  heart.x = 50*x + 50;
  hearts.y = 50;
}

//--PLAYER AND ENEMIES---
  player = new Sprite();
    player.diameter = 25;
    player.x = windowWidth / 2;
    player.y = gameField.y + gameField.h / 2;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.color = "#8CB369";
    player.collider = 'k';

  qixi = new Group();
    qixi.x = gameField.x;
    qixi.y = gameField.y - gameField.h / 2 + 50;
    qixi.w = 25;
    qixi.h = 25;
    qixi.rotation = 45;
    qixi.rotationLock = true;
    qixi.color = "#a71d31"
    qixi.collider = "d";
    qixi.bounciness = 1;
    qixi.velocity.x = random(-2, 2);
    qixi.velocity.y = random(-2, 2);

  sparx = new Group();
    sparx.x = gameField.x;
    sparx.y = gameField.y - gameField.h / 2 
    sparx.w = 15;
    sparx.h = 15;
    sparx.color = "#706993"
    sparx.collider = "k";
    sparx.velocity.x = sparcSpeed;
    sparx.velocity.y = 0;
    for (let sparc of sparx) {
      sparc.isHandlingCorner = false;
      sparc.cornerPoint = null;
    }

  let ogQix = new qixi.Sprite();
	let ogSparc = new sparx.Sprite();
  

  //---Layering-------------------------
  player.overlaps(gameField);
  qixi.overlaps(gameField);

  sparx.overlaps(gameField);
  sparx.overlaps(Borders);

  Borders.overlaps(gameField);
  Borders.overlaps(Borders);  

  //---auto's off -----
  allSprites.autoDraw = false;
  allSprites.autoUpdate = false;
  world.autoStep = false;
}
function draw() {
  gameState();
}

//---INTRO-----------------------------------------------------------------------
function intro(){
  push();
    imageMode(CENTER);
    translate(windowWidth/2, windowHeight/2 -25);
    scale(1.5);
    image(cover, 0, 0);

    textFont(font);
    fill("white");
    textSize(30);
    text("Click to Play", 0, 190);

  pop();

  if (mouse.presses()) gameState = runGame;
}

//---GAME-------------------------------------------------------------------------
function runGame(){
  background('#e3d5ca');
  //---Display directions/info---
  //add some description of how to play maybe?
  push();
    textSize(20);
    text('↑', width * 0.9, height - (height * 0.3));
    text('← move →', width * 0.9, height - (height * 0.2));
    text('↓', width * 0.9, height - (height * 0.1));
  pop();

  //---PlayThrough Info------------
    //points, lives, etc

  //---PLAYER MEOVEMENT-------------------------------
  player.velocity.x = PspeedX; // Apply velocity based on current speed
  player.velocity.y = PspeedY;
  // Constrain player within game field
  player.x = constrain(player.x, windowWidth / 2 - gameField.w / 2, windowWidth / 2 + gameField.w / 2);
  player.y = constrain(player.y, windowHeight / 2 - gameField.h / 2, windowHeight / 2 + gameField.h / 2);

  //---ENEMY MOVEMENT----
  for (let qix of qixi) { 
    updateQix(qix);
  }
  for (let sparc of sparx) {  
    updateSparc(sparc);
  }  

  //---collision checks-----------------------------------------
  player.collides(sparx, playerHit);
  player.collides(qixi, playerHit);


  //---check player progress-------------------------------------
  if (lives < 1) {
    levelFailed();
  }
  if (claimedArea >= 75) {
    levelPassed();
  }

  //---world update------
  allSprites.autoDraw = true;
  allSprites.autoUpdate = true;
  world.autoStep = true;
}

//---PLAYER HIT------------------------------------------
function playerHit(){
  // all movment stops
  allSprites.autoUpdate = false;
  world.autoStep = false;
   
  // player circle blinks three times,

  // number of lives/hearts decreases
  lives--;
  hearts[hearts.length - 1].remove();
 
  //check for level failed
  if (hearts.length === 0) levelFailed();

  // player teleported to initial position.
   


  // player circle blinks three times,
  // movement resumes
}
 


//---LEVEL FAILED---------------------------------------------------------------
function levelFailed(){
  // all movement stops,
  // player circle blinks three times, and dissapears
  // "you loose" or smthn
  // option to restart game or back to intro screen
  // change game state accordingly
 }

//---QIX MOVEMENT-----------------------------------------------------------
function updateQix(qix){
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

//---SPARX MOVEMENT--------------------------------------------------------
 // Refined Sparx movement system for p5play
function updateSparc(sparc) {
  // Get sparc's current position
  const x = sparc.x;
  const y = sparc.y;
  
  // Find the current border the sparc is on (if any)
  let currentBorder = null;
  for (let border of Borders) {
    if (isOnBorder(sparc, border, 3)) {
      currentBorder = border;
      break;
    }
  }
  
  // If not on any border, find the nearest border and move towards it
  if (!currentBorder) {
    findAndMoveToNearestBorder(sparc);
    return;
  }
  
  // Check if we're near a corner/junction
  const isAtCorner = isAtBorderCorner(sparc, 8);
  
  // Handle corner turns
  if (isAtCorner && !sparc.isHandlingCorner) {
    handleCornerTurn(sparc, currentBorder);
  }
  // Continue moving along the current border
  else if (!isAtCorner) {
    sparc.isHandlingCorner = false; // Reset corner handling flag
    continueAlongBorder(sparc, currentBorder);
  }
}
// Check if sprite is on a specific border
function isOnBorder(sprite, border, tolerance = 5) {
  // For horizontal borders (wider than tall)
  if (border.w >= border.h) {
    return Math.abs(sprite.y - border.y) < tolerance && 
           sprite.x >= border.x - border.w/2 - tolerance && 
           sprite.x <= border.x + border.w/2 + tolerance;
  } 
  // For vertical borders (taller than wide)
  else {
    return Math.abs(sprite.x - border.x) < tolerance && 
           sprite.y >= border.y - border.h/2 - tolerance && 
           sprite.y <= border.y + border.h/2 + tolerance;
  }
}
// Find the nearest border and move the sparc towards it
function findAndMoveToNearestBorder(sparc) {
  let nearestPoint = null;
  let minDist = Infinity;
  
  for (let border of Borders) {
    let point;
    
    // For horizontal borders
    if (border.w >= border.h) {
      const projX = constrain(sparc.x, border.x - border.w/2, border.x + border.w/2);
      point = {x: projX, y: border.y};
    } 
    // For vertical borders
    else {
      const projY = constrain(sparc.y, border.y - border.h/2, border.y + border.h/2);
      point = {x: border.x, y: projY};
    }
    
    const d = dist(sparc.x, sparc.y, point.x, point.y);
    if (d < minDist) {
      minDist = d;
      nearestPoint = point;
    }
  }
  
  // Move towards the nearest point
  if (nearestPoint) {
    // If very far from any border, snap directly to it
    if (minDist > 20) {
      sparc.x = nearestPoint.x;
      sparc.y = nearestPoint.y;
      // Set initial velocity along the border
      sparc.velocity.x = sparc.velocity.y = 0;
      sparc.velocity.x = sparcSpeed; // Default direction
    } else {
      // Otherwise move towards it
      const dx = nearestPoint.x - sparc.x;
      const dy = nearestPoint.y - sparc.y;
      const mag = Math.sqrt(dx*dx + dy*dy);
      
      if (mag > 0) {
        sparc.velocity.x = (dx/mag) * sparcSpeed;
        sparc.velocity.y = (dy/mag) * sparcSpeed;
      }
    }
  }
}
// Check if a sprite is at a corner/junction
function isAtBorderCorner(sparc, tolerance = 8) {
  // Get all border endpoints
  let allEndpoints = [];
  
  for (let border of Borders) {
    if (border.w >= border.h) { // Horizontal border
      allEndpoints.push({x: border.x - border.w/2, y: border.y});
      allEndpoints.push({x: border.x + border.w/2, y: border.y});
    } else { // Vertical border
      allEndpoints.push({x: border.x, y: border.y - border.h/2});
      allEndpoints.push({x: border.x, y: border.y + border.h/2});
    }
  }
  
  // Check if we're close enough to any endpoint
  for (let point of allEndpoints) {
    if (dist(sparc.x, sparc.y, point.x, point.y) < tolerance) {
      sparc.cornerPoint = point; // Store the corner point
      return true;
    }
  }
  
  return false;
}
// Handle turns at corners
function handleCornerTurn(sparc, currentBorder) {
  sparc.isHandlingCorner = true; // Set flag to prevent multiple turns
  
  // Get corner point
  const corner = sparc.cornerPoint;
  
  // Snap to corner precisely
  sparc.x = corner.x;
  sparc.y = corner.y;
  
  // Find all borders connected to this corner
  let connectedBorders = [];
  for (let border of Borders) {
    if (border === currentBorder) continue; // Skip current border
    
    // Check if this border connects to our corner
    let endpoints = [];
    if (border.w >= border.h) { // Horizontal
      endpoints.push({x: border.x - border.w/2, y: border.y});
      endpoints.push({x: border.x + border.w/2, y: border.y});
    } else { // Vertical
      endpoints.push({x: border.x, y: border.y - border.h/2});
      endpoints.push({x: border.x, y: border.y + border.h/2});
    }
    
    for (let ep of endpoints) {
      if (dist(ep.x, ep.y, corner.x, corner.y) < 5) {
        connectedBorders.push({
          border: border,
          isEntryPoint: true
        });
        break;
      }
    }
  }
  
  // Choose a connected border that's different from current
  if (connectedBorders.length > 0) {
    // Determine previous direction
    const prevDirX = Math.sign(sparc.velocity.x);
    const prevDirY = Math.sign(sparc.velocity.y);
    
    // Filter out borders that would cause reversing direction
    let validBorders = connectedBorders.filter(b => {
      const border = b.border;
      
      // For current horizontal border, avoid connected borders going opposite horizontal direction
      if (currentBorder.w >= currentBorder.h && border.w >= border.h) {
        const newDirX = border.x > currentBorder.x ? 1 : -1;
        return newDirX !== -prevDirX;
      }
      // For current vertical border, avoid connected borders going opposite vertical direction
      else if (currentBorder.w < currentBorder.h && border.w < border.h) {
        const newDirY = border.y > currentBorder.y ? 1 : -1;
        return newDirY !== -prevDirY;
      }
      
      return true; // Allow perpendicular turns
    });
    
    // If no valid borders (would cause reversal), allow any connected border
    if (validBorders.length === 0) validBorders = connectedBorders;
    
    // Choose a random valid border
    const chosenBorder = random(validBorders).border;
    
    // Set velocity based on new border orientation
    if (chosenBorder.w >= chosenBorder.h) { // Horizontal border
      sparc.velocity.y = 0;
      // Determine if we should go left or right
      if (Math.abs(corner.x - (chosenBorder.x - chosenBorder.w/2)) < 5) {
        sparc.velocity.x = sparcSpeed; // Go right
      } else {
        sparc.velocity.x = -sparcSpeed; // Go left
      }
    } else { // Vertical border
      sparc.velocity.x = 0;
      // Determine if we should go up or down
      if (Math.abs(corner.y - (chosenBorder.y - chosenBorder.h/2)) < 5) {
        sparc.velocity.y = sparcSpeed; // Go down
      } else {
        sparc.velocity.y = -sparcSpeed; // Go up
      }
    }
    
    // Reset the corner handling flag after a delay
    setTimeout(() => {
      sparc.isHandlingCorner = false;
    }, 300);
  }
}
// Continue movement along the current border
function continueAlongBorder(sparc, border) {
  // For horizontal borders
  if (border.w >= border.h) {
    // Snap to the border's y position to prevent drift
    sparc.y = border.y;
    sparc.velocity.y = 0;
    
    // If not moving horizontally, set a direction
    if (Math.abs(sparc.velocity.x) < 0.1) {
      sparc.velocity.x = sparcSpeed;
    }
    
    // Check if we're about to go off the border
    if ((sparc.velocity.x > 0 && sparc.x > border.x + border.w/2 - 5) ||
        (sparc.velocity.x < 0 && sparc.x < border.x - border.w/2 + 5)) {
      sparc.velocity.x *= -1; // Reverse direction
    }
  } 
  // For vertical borders
  else {
    // Snap to the border's x position to prevent drift
    sparc.x = border.x;
    sparc.velocity.x = 0;
    
    // If not moving vertically, set a direction
    if (Math.abs(sparc.velocity.y) < 0.1) {
      sparc.velocity.y = sparcSpeed;
    }
    
    // Check if we're about to go off the border
    if ((sparc.velocity.y > 0 && sparc.y > border.y + border.h/2 - 5) ||
        (sparc.velocity.y < 0 && sparc.y < border.y - border.h/2 + 5)) {
      sparc.velocity.y *= -1; // Reverse direction
    }
  }
}

//---PLAYER MOVEMENT------------------------------------------------------
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
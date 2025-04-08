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
  let playersCurrentBorder = null; // Tracks the border the player is currently on
  let playerLastBorder = null; // Tracks the last border the player was on last frame
let PspeedX = 0;
let PspeedY = 0;
let currentPlayerDirection = null; // Tracks the current movement direction
let lastPlayerDirChange = 0; // Timestamp of the last direction change
const DIRECTION_COOLDOWN = 200; // Cooldown in milliseconds (adjustable)
 
let currentTrailSegments = []; // Array of active trail segments
let lastDirection = null; // Last movement direction
let trailStartBorder = null; // Border where trail started
let isDrawingTrail = false; // Whether we're currently drawing a trail

let previousBorderStatus = true; // Assuming player starts on border

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
    // Borders.visible = false;
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

//players trail 
trails = new Group(); 
  trails.color = "#FFBE0B"; 
  trails.collider = 'k';

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
    qixi.maxSpeed = 2;

  sparx = new Group();
    sparx.x = gameField.x;
    sparx.y = gameField.y - gameField.h / 2 
    sparx.w = 15;
    sparx.h = 15;
    sparx.color = "#706993"
    sparx.collider = "d";
    sparx.rotationLock = true;
    sparx.velocity.x = sparcSpeed;
    sparx.velocity.y = 0;
    sparx.maxSpeed = sparcSpeed
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

  trails.overlaps(gameField);
  trails.overlaps(Borders);
  trails.overlaps(trails);

  //---auto's off -----
  allSprites.autoDraw = false;
  allSprites.autoUpdate = false;
  world.autoStep = false;
}
function draw() {
  // This ensures only the current game state function is being called
  if (typeof gameState === 'function') {
    gameState();
  } else {
    console.error("Invalid game state:", gameState);
    // Default to intro if gameState is invalid
    intro();
  }
}

//---INTRO-----------------------------------------------------------------------
function intro(){
  // Set a black background to clear any previous content
  background(0);
  
  // Hide all game elements when in intro
  for (let sprite of allSprites) {
    sprite.visible = false;
  }
  
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

  if (mouse.presses()) {
    // Make all sprites visible again when starting the game
    for (let sprite of allSprites) {
      sprite.visible = true;
    }
    gameState = runGame;
  }
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

  // Only process game logic if we're actually in the runGame state
  // This check prevents movement updates when we're in a different state
  if (gameState === runGame) {
   //---PLAYER MOVEMENT-------------------------------
   playerLastBorder = playersCurrentBorder; // Store the last border before moving
   player.velocity.x = PspeedX; // Apply velocity based on current speed
   player.velocity.y = PspeedY;
   // Constrain player within game field
   player.x = constrain(player.x, windowWidth / 2 - gameField.w / 2, windowWidth / 2 + gameField.w / 2);
   player.y = constrain(player.y, windowHeight / 2 - gameField.h / 2, windowHeight / 2 + gameField.h / 2);

 //---TRAILS-----------------------------------------
 currentBorderStatus = isPlayerOnBorder();
    
 // Player just moved off border - start trail
 if (previousBorderStatus === true && currentBorderStatus === false) {
   startTrail();
 }
 // Player is off border - update trail
 else if (currentBorderStatus === false) {
   updateTrail();
 }
 // Player just moved back onto border - close trail
 else if (previousBorderStatus === false && currentBorderStatus === true) {
   completeTrail();
 }
 
 previousBorderStatus = currentBorderStatus;

    //---ENEMY MOVEMENT------------------------------------
    for (let qix of qixi) { 
      updateQix(qix);
    }
    for (let sparc of sparx) {  
      updateSparc(sparc);
    }  
    //---collision checks-----------------------------------------
    player.collides(sparx, playerHit);
    player.collides(qixi, checkPlayerCollision);
    player.collides(trails, playerHit);
    qixi.collides(trails, playerHit);
    sparx.collides(trails, playerHit);
    //---check player progress-------------------------------------
    if (claimedArea >= 75) {
      levelOver();
    }
}
  //---world update------
  // These are kept outside the conditional to ensure sprites still render
  // in all game states, but they don't update positions/logic if not in runGame
  allSprites.draw();
  if (gameState === runGame) {
    allSprites.update();
    world.step();
  }
}

//---PLAYER HIT------------------------------------------
function checkPlayerCollision() {
  let onBorder = false;  
  for (let border of Borders) {
    if (isOnBorder(player, border, tolerance = 5)){
      onBorder = true;
      break;
    }
  }

  if (!onBorder) {
    // Player is not on a border, trigger player hit
    playerHit();
  }
}

function playerHit() {
  console.log("Player hit! Lives remaining:", lives - 1);
  
  // Stop all movement
  allSprites.autoUpdate = false;
  world.autoStep = false;
  
  // Freeze all sprite velocities
  for (let sprite of allSprites) {
    sprite.velocity.x = 0;
    sprite.velocity.y = 0;
    sprite.speed = 0;
  }
  
  // Reset player control variables
  PspeedX = 0;
  PspeedY = 0;
  currentPlayerDirection = null;
  
  // Decrease lives
  lives--;
  
  // Remove the last heart
  if (hearts.length > 0) {
    hearts[hearts.length - 1].remove();
  }
  
  // Check for game over
  if (lives <= 0 || hearts.length === 0) {
    console.log("Game over - calling levelOver()");
    levelOver();
    return; // Important: exit the function early if game over
  }
  
  // Reset trail-related variables
  isDrawingTrail = false;
  trailStartBorder = null;
  lastDirection = null;
  
  // Remove all trail segments
  for (let segment of currentTrailSegments) {
    if (segment) {
      segment.remove();
    }
  }
  currentTrailSegments = [];
  
  // Store original player position to return to later
  const originalX = windowWidth / 2;
  const originalY = gameField.y + gameField.h / 2;
  
  // Create a blinking effect for the player
  let blinkCount = 0;
  let blinkInterval = setInterval(() => {
    player.visible = !player.visible;
    blinkCount++;
    
    if (blinkCount >= 6) { // 3 blinks (on-off cycles)
      clearInterval(blinkInterval);
      player.visible = true;
      
      // Reset player position
      player.x = originalX;
      player.y = originalY;
      
      // Resume game physics and updates
      allSprites.autoUpdate = true;
      world.autoStep = true;
      
      console.log("Player hit recovery complete, resuming game");
    }
  }, 300); // 300ms per state change
}
 
//---LEVEL OVER---------------------------------------------------------------

function levelOver() {
  console.log("Level over function called");
  
  // Force game state to ensure we're in a known state
  gameState = runGame;
  
  // Stop all movement - multiple layers of stopping
  allSprites.autoUpdate = false;
  world.autoStep = false;
  
  // Manually set all sprite velocities to zero
  for (let sprite of allSprites) {
    sprite.velocity.x = 0;
    sprite.velocity.y = 0;
    sprite.speed = 0;
  }
  
  // Reset player control variables
  PspeedX = 0;
  PspeedY = 0;
  currentPlayerDirection = null;
  
  // Store current state
  let levelWon = claimedArea >= 75;
  let finalScore = score;
  let finalArea = claimedArea;
  
  console.log("Level won:", levelWon);
  console.log("Final score:", finalScore);
  console.log("Final area:", finalArea);
  
  // Make sure gameOverScreen function exists before we try to use it
  if (typeof gameOverScreen !== 'function') {
    console.log("Creating gameOverScreen function");
    
    window.gameOverScreen = function() {
      console.log("Running gameOverScreen");
      
      background('#e3d5ca');
      gameField.visible = true;
      
      // Draw everything but ensure nothing moves
      for (let sprite of allSprites) {
        // Double check that velocities are still zero
        sprite.velocity.x = 0;
        sprite.velocity.y = 0;
        sprite.speed = 0;
        sprite.draw();
      }
      
      // Overlay with semi-transparent background
      push();
      fill(0, 0, 0, 180);
      rect(0, 0, width, height);
      
      // Game over message
      textFont(font);
      textSize(40);
      if (levelWon) {
        fill("#B6EFD4"); // Green from palette
        text("LEVEL COMPLETE!", width/2, height/3);
      } else {
        fill("#D88C9A"); // Red from palette
        text("GAME OVER", width/2, height/3);
      }
      
      // Display stats
      textSize(24);
      fill("white");
      text(`Score: ${finalScore}`, width/2, height/2 - 40);
      text(`Area Claimed: ${finalArea.toFixed(2)}%`, width/2, height/2);
      
      // Options
      textSize(30);
      
      // Restart button
      let restartBtnY = height/2 + 80;
      if (mouseY > restartBtnY - 25 && mouseY < restartBtnY + 25 && 
          mouseX > width/2 - 100 && mouseX < width/2 + 100) {
        fill("#8E7DBE"); // Purple from palette
        if (mouse.presses()) {
          // Pass false to resetGame to restart the game
          resetGame(false);
          return;
        }
      } else {
        fill("white");
      }
      text("Play Again", width/2, restartBtnY);
      
      // Main menu button
      let menuBtnY = height/2 + 140;
      if (mouseY > menuBtnY - 25 && mouseY < menuBtnY + 25 && 
          mouseX > width/2 - 100 && mouseX < width/2 + 100) {
        fill("#8E7DBE"); // Purple from palette
        if (mouse.presses()) {
          // Pass true to resetGame to indicate we're going back to intro
          resetGame(true);
          return;
        }
      } else {
        fill("white");
      }
      text("Main Menu", width/2, menuBtnY);
      pop();
    };
  }
  
  // Create a blinking effect for the player with a reliable transition to the game over screen
  let blinkCount = 0;
  let blinkInterval = setInterval(() => {
    if (player) {
      player.visible = !player.visible;
    }
    blinkCount++;
    
    if (blinkCount >= 6) { // 3 blinks (on-off cycles)
      clearInterval(blinkInterval);
      if (player) {
        player.visible = true;
      }
      
      // After blinking, explicitly change the game state with a small delay
      // to ensure all timers complete first
      console.log("Changing game state to gameOverScreen");
      setTimeout(() => {
        gameState = gameOverScreen;
        console.log("Game state changed to:", gameState.name || "gameOverScreen");
      }, 100);
    }
  }, 300); // 300ms per state change
}




// Function to reset the game state
function resetGame(toIntro = false) {
  console.log("Resetting game. To intro:", toIntro);
  
  // Reset game variables
  score = 0;
  claimedArea = 0;
  lives = 3;
  level = 1;
  
  // Reset trail-related variables
  trailStartPoint = null;
  lastTrailSegmentPos = null;
  previousBorderStatus = true;
  playerLastBorder = null;
  
  // Clear trails - using a more aggressive approach
  // First try the standard removal
  for (let i = trails.length - 1; i >= 0; i--) {
    if (trails[i]) {
      trails[i].remove();
    }
  }
  
  // As a backup, completely recreate the trails group
  if (trails.length > 0) {
    console.log("Using backup method to clear trails");
    // Create a new trails group
    trails = new Group();
    trails.diameter = 8;
    trails.color = "#FFBE0B";
    trails.collider = 'k';
  }
  currentTrail = [];
  
  // Remove existing enemies
  for (let enemy of qixi) {
    enemy.remove();
  }
  for (let enemy of sparx) {
    enemy.remove();
  }
  
  // Remove existing hearts
  for (let heart of hearts) {
    heart.remove();
  }
  
  // Remove all borders except the original four
  while (Borders.length > 4) {
    Borders[Borders.length - 1].remove();
  }
  
  // Make sure the original borders are in the correct positions
  Borders[0].x = gameField.x - gameField.w/2;
  Borders[0].y = gameField.y;
  Borders[0].w = 1;
  Borders[0].h = gameField.h;
  
  Borders[1].x = gameField.x + gameField.w/2;
  Borders[1].y = gameField.y;
  Borders[1].w = 1;
  Borders[1].h = gameField.h;
  
  Borders[2].x = gameField.x;
  Borders[2].y = gameField.y - gameField.h/2;
  Borders[2].w = gameField.w;
  Borders[2].h = 1;
  
  Borders[3].x = gameField.x;
  Borders[3].y = gameField.y + gameField.h/2;
  Borders[3].w = gameField.w;
  Borders[3].h = 1;
  
  // Recreate hearts
  for (let x = 0; x < lives; x++) {
    let heart = new hearts.Sprite();
    heart.x = 50*x + 50;
    heart.y = 50;
  }
  
  // Reset player position
  player.x = windowWidth / 2;
  player.y = gameField.y + gameField.h / 2;
  player.velocity.x = 0;
  player.velocity.y = 0;
  PspeedX = 0;
  PspeedY = 0;
  currentPlayerDirection = null;
  
  // Create new enemies
  let newQix = new qixi.Sprite();
  let newSparc = new sparx.Sprite();
  
  // Reset game field color
  gameField.color = random(pallete);
  
  // Double-check all sprites' positions and visibility
  for (let sprite of allSprites) {
    // Reset any unexpected velocity
    sprite.velocity.x = 0;
    sprite.velocity.y = 0;
  }
  
  // If returning to intro, hide all sprites
  if (toIntro) {
    for (let sprite of allSprites) {
      sprite.visible = false;
    }
    gameState = intro;
  } else {
    // Make all sprites visible for gameplay (except any residual trails)
    for (let sprite of allSprites) {
      if (trails.includes(sprite)) {
        // Additional check to hide any lingering trail sprites
        sprite.visible = false;
      } else {
        sprite.visible = true;
      }
    }
    // Resume game physics and updates
    allSprites.autoUpdate = true;
    world.autoStep = true;
    // Set game state back to running
    gameState = runGame;
  }
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
 
  //limiting speed
  if (qix.speed > 0){
    if (qix.speed > qix.maxSpeed) {
      qix.speed = qix.maxSpeed; // Limit speed to maxSpeed
    }
    else if (qix.speed < 1){    
    qix.speed = random(1, 2); // Limit speed to 1 and maxSpeed
  }
  }
  else {
    if (qix.speed < -qix.maxSpeed) {
      qix.speed = -qix.maxSpeed; // Limit speed to maxSpeed
    }
    else if (qix.speed > -1){
      qix.speed = random(-2, -1); // Limit speed to -1 and -maxSpeed
    }
  }

}

//---SPARX MOVEMENT--------------------------------------------------------
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

  if (sparc.speed > 0){
    if (sparc.speed > sparc.maxSpeed) {
      sparc.speed = sparc.maxSpeed; // Limit speed to maxSpeed
    }
    else if (sparc.speed < 1){    
    sparc.speed = random(1, 2); // Limit speed to 1 and maxSpeed
  }
  }
  else {
    if (sparc.speed < -sparc.maxSpeed) {
      sparc.speed = -sparc.maxSpeed; // Limit speed to maxSpeed
    }
    else if (sparc.speed > -1){
      sparc.speed = random(-2, -1); // Limit speed to -1 and -maxSpeed
    }
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
//---PLAYER TRAILS-----------------------------------------------
function isPlayerOnBorder(tolerance = 5) {
  for (let border of Borders) {
    if (isOnBorder(player, border, tolerance)) {
     playersCurrentBorder = border;
      return true;
    }
  }
  return false;
}
// Call this when player moves off a border
function startTrail() {
  isDrawingTrail = true;
  trailStartBorder = playersCurrentBorder;
  lastDirection = currentPlayerDirection;
  
  // Create first trail segment
  let segment = new trails.Sprite();
  segment.x = player.x;
  segment.y = player.y;
  segment.w = 5; // Start with a small width
  segment.h = 5; // Start with a small height
  segment.startX = player.x; // Remember starting point
  segment.startY = player.y;
  
  currentTrailSegments.push(segment);
}
// Call this every frame when player is off borders
function updateTrail() {
  if (!isDrawingTrail || currentTrailSegments.length === 0) return;
  
  // Check if direction changed
  if (currentPlayerDirection !== lastDirection && currentPlayerDirection !== null) {
    // Create a new segment for the new direction
    let segment = new trails.Sprite();
    segment.x = player.x;
    segment.y = player.y;
    segment.w = 5;
    segment.h = 5;
    segment.startX = player.x;
    segment.startY = player.y;
    
    currentTrailSegments.push(segment);
    lastDirection = currentPlayerDirection;
  }
  
  // Update the current (last) segment
  let currentSegment = currentTrailSegments[currentTrailSegments.length - 1];
  
  // Horizontal movement
  if (currentPlayerDirection === 'left' || currentPlayerDirection === 'right') {
    // Set height to trail thickness
    currentSegment.h = 5;
    
    // Update width and position based on direction
    if (currentPlayerDirection === 'right') {
      let segmentWidth = player.x - currentSegment.startX;
      currentSegment.w = Math.abs(segmentWidth) + 5; // Add player radius
      currentSegment.x = currentSegment.startX + segmentWidth / 2;
    } else {
      let segmentWidth = currentSegment.startX - player.x;
      currentSegment.w = Math.abs(segmentWidth) + 5; // Add player radius
      currentSegment.x = player.x + segmentWidth / 2;
    }
  }
  // Vertical movement
  else if (currentPlayerDirection === 'up' || currentPlayerDirection === 'down') {
    // Set width to trail thickness
    currentSegment.w = 5;
    
    // Update height and position based on direction
    if (currentPlayerDirection === 'down') {
      let segmentHeight = player.y - currentSegment.startY;
      currentSegment.h = Math.abs(segmentHeight) + 5; // Add player radius
      currentSegment.y = currentSegment.startY + segmentHeight / 2;
    } else {
      let segmentHeight = currentSegment.startY - player.y;
      currentSegment.h = Math.abs(segmentHeight) + 5; // Add player radius
      currentSegment.y = player.y + segmentHeight / 2;
    }
  }
}
// Call this when player reaches a border
function completeTrail() {
  if (!isDrawingTrail || currentTrailSegments.length === 0) return;
  
  // Update the last segment to connect to the border
  let finalSegment = currentTrailSegments[currentTrailSegments.length - 1];
  
  // Determine how to extend the segment based on the border orientation and player direction
  // This will need logic to determine how to connect to the border
  
  // For horizontal borders
  if (playersCurrentBorder.w >= playersCurrentBorder.h) {
    // Extend segment to border Y position
    if (finalSegment.h > finalSegment.w) { // Vertical segment
      if (player.y < playersCurrentBorder.y) {
        finalSegment.h = Math.abs(finalSegment.startY - playersCurrentBorder.y);
        finalSegment.y = (finalSegment.startY + playersCurrentBorder.y) / 2;
      } else {
        finalSegment.h = Math.abs(playersCurrentBorder.y - finalSegment.startY);
        finalSegment.y = (finalSegment.startY + playersCurrentBorder.y) / 2;
      }
    }
  }
  // For vertical borders
  else {
    // Extend segment to border X position
    if (finalSegment.w > finalSegment.h) { // Horizontal segment
      if (player.x < playersCurrentBorder.x) {
        finalSegment.w = Math.abs(finalSegment.startX - playersCurrentBorder.x);
        finalSegment.x = (finalSegment.startX + playersCurrentBorder.x) / 2;
      } else {
        finalSegment.w = Math.abs(playersCurrentBorder.x - finalSegment.startX);
        finalSegment.x = (finalSegment.startX + playersCurrentBorder.x) / 2;
      }
    }
  }
  
  // Convert trails to borders
  convertTrailsToBorders();
  
  // Reset trail state
  isDrawingTrail = false;
  currentTrailSegments = [];
  lastDirection = null;
  trailStartBorder = null;
}
function convertTrailsToBorders() {
  if (currentTrailSegments.length === 0) return;
  
  // Convert each trail segment to a border
  for (let segment of currentTrailSegments) {
    let newBorder = new Borders.Sprite();
    newBorder.x = segment.x;
    newBorder.y = segment.y;
    newBorder.w = segment.w;
    newBorder.h = segment.h;
    
    // Remove the trail segment
    segment.remove();
  }
  
  // Calculate area claim
  calculateClaimedArea();
  
  // Visual effect
  visualizeAreaClaim();
}

//---AREA CLOSURE--------------------------------------------------
function attemptAreaClosure(currentBorder) {
  // Ensure we have valid start and end points
  if (!trailStartPoint || currentTrailSegments.length < 2) return;
  
  // Calculate claimed area (simple version)
  calculateClaimedArea();
  
  // Update score based on area claimed
  // This is a placeholder - you'll need to implement area calculation
  let areaPoints = Math.floor(currentTrailSegments.length * 10);
  score += areaPoints;
}
function calculateClaimedArea() {
  // This is a simplified placeholder
  // In a full implementation, you would:
  // 1. Identify the enclosed area
  // 2. Calculate its size relative to the game field
  
  // garbage approximation based on trail length
  let estimatedArea = currentTrailSegments.length * 10;
  let totalArea = gameField.w * gameField.h;
  let areaPercentage = Math.min((estimatedArea / totalArea) * 100, 20);
  
  // Update claimed area
  claimedArea += areaPercentage;
  console.log(`Area claimed: ${areaPercentage.toFixed(2)}%. Total: ${claimedArea.toFixed(2)}%`);
}
function visualizeAreaClaim() {
  // Placeholder for visual effect
  // For a simple version, you could:
  // 1. Flash the game field
  // 2. Change color of the claimed area
  
  // Simple flash effect
  let originalColor = gameField.color;
  gameField.color = "#FFFFFF";
  setTimeout(() => {
    gameField.color = originalColor;
  }, 200);
}

//---HELPERS-----------------------------------------------------
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


  
 
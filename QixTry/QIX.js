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
 
let trails;
let currentTrail = [];
let trailStartPoint = null;
let lastTrailSegmentPos = null;
let previousBorderStatus = true; // Assuming player starts on border
let lastBorderTouched = null;
let trailSegmentDistance = 20;

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
    Borders.color = "#000000";
    const BORDER_THICKNESS = 3;
    // Borders.visible = false;
  while( Borders.length < 2){ //make default left border
    let ogBorder = new Borders.Sprite();
    ogBorder.x = gameField.x - gameField.w/2;
    ogBorder.y = gameField.y;
    ogBorder.w = 3;
    ogBorder.h = gameField.h;
  }
    //right border
    Borders[1].x = gameField.x + gameField.w/2;

    while( Borders.length < 4){ //make default top border
      let ogBorder = new Borders.Sprite();
      ogBorder.x = gameField.x ;
      ogBorder.y = gameField.y  - gameField.h/2;
      ogBorder.w = gameField.w;
      ogBorder.h = 3;
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
trails.diameter = 1;  // Small size to match borders
trails.color = "#000000"; // Black color to match borders
trails.layer = 1; // Make sure trails draw on top
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
  
    // Initialize tracking for claimed areas
    window.lastClaimedArea = [];
    window.claimedSprites = [];

  //---Layering-------------------------
  player.overlaps(gameField);
  qixi.overlaps(gameField);

  sparx.overlaps(gameField);
  sparx.overlaps(Borders);
  sparx.overlaps(trails); 

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
  push();
    textSize(30);
    textAlign("left");
    text(" Score: "+score, width*0.01, height*0.2);
    text(" Area Claimed: "+claimedArea.toFixed(2)+"%", width*0.01, height*0.3);
    text(" Goal Area: 75%", width*0.01, height*0.4);

    textSize(20);
    text('↑', width * 0.9, height - (height * 0.3));
    text('← move →', width * 0.87, height - (height * 0.2));
    text('↓', width * 0.9, height - (height * 0.1));
  pop();

  //---PlayThrough Info------------
    //points, lives, etc

  // Only process game logic if we're actually in the runGame state
  // This check prevents movement updates when we're in a different state
  if (gameState === runGame) {

    //---PLAYER MEOVEMENT-------------------------------
    player.velocity.x = PspeedX; // Apply velocity based on current speed
    player.velocity.y = PspeedY;
    // Constrain player within game field
    player.x = constrain(player.x, windowWidth / 2 - gameField.w / 2, windowWidth / 2 + gameField.w / 2);
    player.y = constrain(player.y, windowHeight / 2 - gameField.h / 2, windowHeight / 2 + gameField.h / 2);
    //---TRAILS-----------------------------------------
    const currentBorderStatus = isPlayerOnBorder();
    // Player just moved off border - start trail
    if (previousBorderStatus === true && currentBorderStatus === false) {
      trailStartPoint = findBorderIntersection();
    
      // Start the trail exactly at the border
      lastTrailSegmentPos = createVector(trailStartPoint.x, trailStartPoint.y);
      
      // Create the first trail segment at the exact border point
      let segment = new trails.Sprite();
      segment.x = trailStartPoint.x;
      segment.y = trailStartPoint.y;
      currentTrail.push(segment);
    }
      // Player just moved back onto border - close trail
      if (previousBorderStatus === false && currentBorderStatus === true) {
        if (currentTrail.length > 0) {
          // Find the exact border intersection point
          const borderEndPoint = findBorderIntersection();
          
          // Add a final segment exactly at the border
          let finalSegment = new trails.Sprite();
          finalSegment.x = borderEndPoint.x;
          finalSegment.y = borderEndPoint.y;
          currentTrail.push(finalSegment);
          
          // The critical fix: don't try to create a path back to the start
          // Just use the current trail as is
          attemptAreaClosure(findCurrentTouchedBorder());
          convertTrailsToBorders();
        }
      }
    previousBorderStatus = currentBorderStatus;
    // create trail segments:
    if (!isPlayerOnBorder()) {
      // Only create new segments when actually needed
      if (lastTrailSegmentPos) {
        const distFromLast = dist(player.x, player.y, lastTrailSegmentPos.x, lastTrailSegmentPos.y);
        // OPTIMIZATION: Increase distance threshold
        if (distFromLast >= trailSegmentDistance) {
          createTrailSegment(player.x, player.y);
        }
      } else {
        // First segment when starting a trail
        createTrailSegment(player.x, player.y);
      }
    }
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

    for (let sparc of sparx) {
      // Only check collision if the sparc is not currently on a border
      if (!isSparcOnBorder(sparc)) {
        // Check if it's colliding with any trail
        for (let trail of currentTrail) {
          if (trail && sparc.collides(trail)) {
            playerHit();
            break;
          }
        }
      }
    }
    //---check player progress-------------------------------------
    if (claimedArea >= 75) {
      levelOver();
    }
}

// Add to your runGame function before allSprites.draw():
if (currentTrail.length > 1) {
  push();
  strokeWeight(1); // Thin line like borders
  stroke(0); // Black lines matching borders
  noFill();
  
  // Start from the trail start point if available
  if (trailStartPoint) {
    beginShape();
    vertex(trailStartPoint.x, trailStartPoint.y);
    
    // Add all trail segment vertices
    for (let segment of currentTrail) {
      if (segment) {
        vertex(segment.x, segment.y);
      }
    }
    
    // Add current player position if still creating trail
    if (!isPlayerOnBorder()) {
      vertex(player.x, player.y);
    }
    
    endShape();
  }
  pop();
}

if (gameField) {
  gameField.visible = true;
}

 window.Areas = [];
// Add to your runGame function before allSprites.draw():
if (currentTrail.length > 1) {
  push();
  strokeWeight(1); // Thin line like borders
  stroke(0); // Black lines matching borders
  noFill();
  
  // Start from the trail start point if available
  if (trailStartPoint) {
    beginShape();
    vertex(trailStartPoint.x, trailStartPoint.y);
    
    // Add all trail segment vertices
    for (let segment of currentTrail) {
      if (segment) {
        vertex(segment.x, segment.y);
      }
    }
    
    // Add current player position if still creating trail
    if (!isPlayerOnBorder()) {
      vertex(player.x, player.y);
    }
    
    endShape();
  }
  pop();
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
  
  // Ensure game field stays visible - ADD THIS LINE
  if (gameField) {
    gameField.visible = true;
  }
  
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
  trailStartPoint = null;
  lastTrailSegmentPos = null;
  previousBorderStatus = true;
  lastBorderTouched = null;
  
  // Clear current trail
  for (let segment of currentTrail) {
    if (segment) {
      segment.remove();
    }
  }
  currentTrail = [];
  
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
    // Ensure field stays visible after recovery - ADD THIS BLOCK
    setTimeout(() => {
      if (gameField) {
        gameField.visible = true;
      }
    }, 2000); // After recovery should be complete
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
  
  // Ensure the game field is visible - ADD THIS BLOCK
  if (gameField) {
    gameField.visible = true;
  }
  
  // Clean up any claimed area tracking - ADD THIS BLOCK
  window.lastClaimedArea = [];
  window.claimedSprites = window.claimedSprites || [];
  
  // Remove existing claimed area sprites
  for (let sprite of window.claimedSprites) {
    if (sprite) {
      sprite.remove();
    }
  }
  window.claimedSprites = [];

  if (window.fillAreas && window.fillAreas.length > 0) {
    for (let area of window.fillAreas) {
      if (area.sprites && area.sprites.length > 0) {
        for (let sprite of area.sprites) {
          if (sprite) sprite.remove();
        }
      }
    }
    window.fillAreas = [];
  }
  
  // Reset game variables
  score = 0;
  claimedArea = 0;
  lives = 3;
  level = 1;
  
  // Reset trail-related variables
  trailStartPoint = null;
  lastTrailSegmentPos = null;
  previousBorderStatus = true;
  lastBorderTouched = null;
  
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
  const BORDER_THICKNESS = 3;

  Borders[0].x = gameField.x - gameField.w/2;
  Borders[0].y = gameField.y;
  Borders[0].w = BORDER_THICKNESS;
  Borders[0].h = gameField.h;
  
  Borders[1].x = gameField.x + gameField.w/2;
  Borders[1].y = gameField.y;
  Borders[1].w = BORDER_THICKNESS;
  Borders[1].h = gameField.h;
  
  Borders[2].x = gameField.x;
  Borders[2].y = gameField.y - gameField.h/2;
  Borders[2].w = gameField.w;
  Borders[2].h = BORDER_THICKNESS;
  
  Borders[3].x = gameField.x;
  Borders[3].y = gameField.y + gameField.h/2;
  Borders[3].w = gameField.w;
  Borders[3].h = BORDER_THICKNESS;
  
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
function updateSparc(sparc ) {
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

  // Speed limiting code stays the same...
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
// In the setPlayerDirection function, change the speed values
function setPlayerDirection(direction) {
  PspeedX = 0; // Reset both speeds first
  PspeedY = 0;

  // Determine if player is on a border
  const onBorder = isPlayerOnBorder();
  
  // Set different speeds based on whether player is on border or not
  const borderSpeed = 3; // Speed when on border (keep as is)
  const offBorderSpeed = 1.5; // Slower speed when off border (new)
  
  // Choose appropriate speed
  const moveSpeed = onBorder ? borderSpeed : offBorderSpeed;

  switch (direction) {
    case 'up':
      PspeedY = -moveSpeed;
      break;
    case 'down':
      PspeedY = moveSpeed;
      break;
    case 'left':
      PspeedX = -moveSpeed;
      break;
    case 'right':
      PspeedX = moveSpeed;
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

  if (!isPlayerOnBorder() && currentPlayerDirection !== lastDirection) {
    createTrailSegment(player.x, player.y);
  }
  
  lastDirection = currentPlayerDirection;
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
//---TRAILS AND AREA-----------------------------------------------
function isPlayerOnBorder(tolerance = 5) {
  for (let border of Borders) {
    if (isOnBorder(player, border, tolerance)) {
      return true;
    }
  }
  return false;
}
function findLastTouchedBorder() {
  for (let border of Borders) {
    if (isOnBorder(player, border, 8)) {
      return border;
    }
  }
  return null;
}
function findCurrentTouchedBorder() {
  return findLastTouchedBorder(); // Same logic but when returning to a border
}
function createTrailSegment(x, y) {
  // If we're moving horizontally from the last point
  if (lastTrailSegmentPos && Math.abs(y - lastTrailSegmentPos.y) < 20) {
    // Force y coordinate to match the last segment
    y = lastTrailSegmentPos.y;
  }
  // If we're moving vertically from the last point
  else if (lastTrailSegmentPos && Math.abs(x - lastTrailSegmentPos.x) < 20) {
    // Force x coordinate to match the last segment
    x = lastTrailSegmentPos.x;
  }
  
  let segment = new trails.Sprite();
  segment.x = x;
  segment.y = y;
  segment.diameter = 1;
  segment.color = "#000000";
  
  currentTrail.push(segment);
  lastTrailSegmentPos = createVector(x, y);
}
// Improved attemptAreaClosure function
function attemptAreaClosure(currentBorder) {
  console.log("Attempting area closure with " + currentTrail.length + " trail segments");
  
  // Ensure we have valid start and end points
  if (!trailStartPoint || currentTrail.length < 2) {
    console.log("Invalid trail - not enough points");
    return;
  }
  
  // Ensure game field is visible
  if (gameField) gameField.visible = true;
  
  try {
    // Create polygon from trail points with improved polygon creation
    const vertices = trailToPolygon();
    
    if (!vertices || vertices.length < 3) {
      console.log("Failed to create valid polygon");
      return;
    }
    
    console.log("Created polygon with", vertices.length, "vertices");
    
    // Fill the claimed area and get back the area percentage
    const areaPercentage = fillClaimedArea(vertices);
    
    if (areaPercentage) {
      // Update game state
      claimedArea += areaPercentage;
      score += Math.floor(areaPercentage * 100 * lives);
      
      // Visual feedback
      flashGameField();
    }
    
  } catch (error) {
    console.error("Error in area closure:", error);
    if (gameField) gameField.visible = true;
  }
}
function convertTrailsToBorders() {
  if (currentTrail.length < 2) return;
  
  try {
    // Ensure we create borders only along clear horizontal or vertical paths
    for (let i = 0; i < currentTrail.length - 1; i++) {
      const seg1 = currentTrail[i];
      const seg2 = currentTrail[i + 1];
      
      if (!seg1 || !seg2) continue;
      
      // Calculate the actual distance between points
      const distance = dist(seg1.x, seg1.y, seg2.x, seg2.y);
      
      // Only create a border if points are close enough to be legitimate connections
      if (distance <= trailSegmentDistance * 1.5) {
        
        // For perfectly horizontal segments (improved tolerance check)
        if (Math.abs(seg1.y - seg2.y) < 1) {
          let newBorder = new Borders.Sprite();
          newBorder.y = Math.round(seg1.y); // Round to nearest integer
          newBorder.x = (seg1.x + seg2.x) / 2;
          newBorder.w = Math.abs(seg2.x - seg1.x);
          newBorder.h = 3; // Thicker borders (3px instead of 1px)
          newBorder.color = "#000000";
          newBorder.collider = 'k';
        } 
        // For perfectly vertical segments
        else if (Math.abs(seg1.x - seg2.x) < 1) {
          let newBorder = new Borders.Sprite();
          newBorder.x = Math.round(seg1.x); // Round to nearest integer
          newBorder.y = (seg1.y + seg2.y) / 2;
          newBorder.w = 3; // Thicker borders
          newBorder.h = Math.abs(seg2.y - seg1.y);
          newBorder.color = "#000000";
          newBorder.collider = 'k';
        }
        // For diagonal segments, create a proper L-shape with adjusted coordinates
        else {
          // Create an L-shape with precise connecting points
          
          // First calculate the exact intermediate point (corner of the L)
          const cornerX = seg2.x;
          const cornerY = seg1.y;
          
          // First segment (horizontal)
          let horizBorder = new Borders.Sprite();
          horizBorder.y = Math.round(seg1.y);
          horizBorder.x = (seg1.x + cornerX) / 2;
          horizBorder.w = Math.abs(cornerX - seg1.x);
          horizBorder.h = 3; // Thicker
          horizBorder.color = "#000000";
          horizBorder.collider = 'k';
          
          // Second segment (vertical)
          let vertBorder = new Borders.Sprite();
          vertBorder.x = Math.round(seg2.x);
          vertBorder.y = (cornerY + seg2.y) / 2;
          vertBorder.w = 3; // Thicker
          vertBorder.h = Math.abs(seg2.y - cornerY);
          vertBorder.color = "#000000";
          vertBorder.collider = 'k';
        }
      }
    }
    
    // Handle sparx AFTER all borders are created (outside the loop)
    for (let sparc of sparx) {
      // Reset sparc's handling corner flag
      sparc.isHandlingCorner = false;
      
      // If sparc is not on any border, move it to the nearest border
      if (!isSparcOnBorder(sparc)) {
        findAndMoveToNearestBorder(sparc);
      }
    }
    
    // Clear trail segments AFTER processing all borders (outside the loop)
    clearTrailSegments();
    
  } catch (error) {
    console.error("Error in convertTrailsToBorders:", error);
  }
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

function findBorderIntersection() {
  // Find which border the player was last on
  let closestBorder = null;
  let minDistance = Infinity;
  
  for (let border of Borders) {
    // For horizontal borders
    if (border.w >= border.h) {
      const distance = Math.abs(player.y - border.y);
      if (distance < minDistance) {
        minDistance = distance;
        closestBorder = border;
      }
    } 
    // For vertical borders
    else {
      const distance = Math.abs(player.x - border.x);
      if (distance < minDistance) {
        minDistance = distance;
        closestBorder = border;
      }
    }
  }
  
  // Calculate the exact intersection point
  if (closestBorder) {
    if (closestBorder.w >= closestBorder.h) {
      // Horizontal border - x from player, y from border
      return createVector(player.x, closestBorder.y);
    } else {
      // Vertical border - x from border, y from player
      return createVector(closestBorder.x, player.y);
    }
  }
  
  // Fallback if no border found (shouldn't happen)
  return createVector(player.x, player.y);
}

function debugVisualizeTrails() {
  // First add a console log to confirm this is running
  console.log("Debug visualization running, trail segments: " + currentTrail.length);
  
  // Draw a bright background shape to make sure this function is running
  push();
  noStroke();
  fill(255, 255, 0, 50); // Semi-transparent yellow
  rect(20, 20, 50, 50);
  pop();
  
  // Make sure we have trail segments to visualize
  if (currentTrail.length < 1) {
    return;
  }
  
  // Draw dots at each trail segment position
  push();
  noStroke();
  fill(0, 0, 255); // Blue dots for segment positions
  for (let i = 0; i < currentTrail.length; i++) {
    if (currentTrail[i]) {
      ellipse(currentTrail[i].x, currentTrail[i].y, 6, 6);
      
      // Add text labels to see the segment order
      fill(255);
      textSize(10);
      text(i, currentTrail[i].x + 8, currentTrail[i].y);
    }
  }
  pop();
  
  // Draw connecting lines between segments
  push();
  stroke(255, 0, 0); // Red lines
  strokeWeight(2); // Make them thicker
  
  for (let i = 0; i < currentTrail.length - 1; i++) {
    if (currentTrail[i] && currentTrail[i+1]) {
      // Draw line between segments
      line(
        currentTrail[i].x, 
        currentTrail[i].y, 
        currentTrail[i+1].x, 
        currentTrail[i+1].y
      );
      
      // Calculate distance
      const segDist = dist(
        currentTrail[i].x, 
        currentTrail[i].y, 
        currentTrail[i+1].x, 
        currentTrail[i+1].y
      );
      
      // If gap is large, highlight it
      if (segDist > trails.diameter) {
        // Draw a highlighted circle at midpoint
        fill(255, 0, 0, 150);
        const midX = (currentTrail[i].x + currentTrail[i+1].x) / 2;
        const midY = (currentTrail[i].y + currentTrail[i+1].y) / 2;
        ellipse(midX, midY, 10, 10);
        
        // Label the gap distance
        fill(255);
        textSize(12);
        text(Math.round(segDist), midX, midY - 10);
      }
    }
  }
  pop();
  
  // Also visualize the player and trail start point
  push();
  // Show player
  noFill();
  stroke(0, 255, 0);
  strokeWeight(2);
  ellipse(player.x, player.y, player.diameter + 5, player.diameter + 5);
  
  // Show trail start point if it exists
  if (trailStartPoint) {
    fill(255, 165, 0); // Orange
    noStroke();
    ellipse(trailStartPoint.x, trailStartPoint.y, 10, 10);
    fill(255);
    text("Start", trailStartPoint.x + 10, trailStartPoint.y);
  }
  pop();
}


// Calculate a better area percentage
function calculateBetterArea() {
  // Convert the trail to a polygon
  const polygon = trailToPolygon();
  
  if (!polygon || polygon.length < 3) {
    return 0; // Not a valid polygon
  }
  
  // Calculate area using shoelace formula
  const claimedAreaSize = calculatePolygonArea(polygon);
  
  // Calculate game field area
  const fieldArea = gameField.w * gameField.h;
  
  // Calculate percentage, capped at a reasonable value to prevent exploits
  let percentage = (claimedAreaSize / fieldArea) * 100;
  
  // Apply reasonableness checks
  percentage = Math.min(percentage, 30); // Cap at 30% per claim
  percentage = Math.max(percentage, 0.5); // Minimum of 0.5% per valid claim
  
  return percentage;
}

// Create optimized border segments from the trail
function createOptimizedBorders() {
  // Simplify by creating border segments that follow the trail
  
  // First, ensure the trail forms a closed loop
  if (currentTrail.length > 1 && trailStartPoint) {
    // Create borders along the path
    for (let i = 0; i < currentTrail.length - 1; i++) {
      const seg1 = currentTrail[i];
      const seg2 = currentTrail[i + 1];
      
      // Create a border between these points
      let newBorder = new Borders.Sprite();
      
      // For horizontal movement
      if (Math.abs(seg1.y - seg2.y) < 5) {
        newBorder.y = seg1.y;
        newBorder.x = (seg1.x + seg2.x) / 2;
        newBorder.w = Math.abs(seg2.x - seg1.x) + 2; // Add 2 to ensure overlap
        newBorder.h = 2;  // Thicker for better visibility
      } 
      // For vertical movement
      else {
        newBorder.x = seg1.x;
        newBorder.y = (seg1.y + seg2.y) / 2;
        newBorder.w = 2;  // Thicker for better visibility
        newBorder.h = Math.abs(seg2.y - seg1.y) + 2; // Add 2 to ensure overlap
      }
    }
    
    // Close the loop by connecting back to start point
    const firstSeg = currentTrail[0];
    const lastSeg = currentTrail[currentTrail.length - 1];
    
    // Create border from last segment to first
    let closingBorder = new Borders.Sprite();
    
    if (Math.abs(firstSeg.y - lastSeg.y) < 5) {
      // Horizontal closing border
      closingBorder.y = lastSeg.y;
      closingBorder.x = (lastSeg.x + firstSeg.x) / 2;
      closingBorder.w = Math.abs(firstSeg.x - lastSeg.x) + 2;
      closingBorder.h = 2;
    } else {
      // Vertical closing border
      closingBorder.x = lastSeg.x;
      closingBorder.y = (lastSeg.y + firstSeg.y) / 2;
      closingBorder.w = 2;
      closingBorder.h = Math.abs(firstSeg.y - lastSeg.y) + 2;
    }
  }
}
// Clear trail segments properly
function clearTrailSegments() {
  // Log before cleaning up to help with debugging
  console.log(`Clearing ${currentTrail.length} trail segments`);
  
  // More thorough cleanup of trail segments
  for (let segment of currentTrail) {
    if (segment) {
      segment.remove();
    }
  }
  
  // Reset trail variables
  currentTrail = [];
  trailStartPoint = null;
  lastTrailSegmentPos = null;
}

// Flash the game field for visual feedback
function flashGameField() {
  let originalColor = gameField.color;
  gameField.color = "#FFFFFF";
  
  setTimeout(() => {
    gameField.color = originalColor;
  }, 200);
}

// Improved polygon area calculation using the shoelace formula
function calculatePolygonArea(vertices) {
  let area = 0;
  let j = vertices.length - 1;
  
  for (let i = 0; i < vertices.length; i++) {
    area += (vertices[j].x + vertices[i].x) * (vertices[j].y - vertices[i].y);
    j = i;
  }
  
  return Math.abs(area / 2);
}

// Convert the current trail into a proper polygon for area calculation
function trailToPolygon() {
  if (!trailStartPoint || currentTrail.length < 2) {
    console.log("No valid trail to convert to polygon");
    return null;
  }
  
  // Start with the trail's starting point
  let vertices = [createVector(trailStartPoint.x, trailStartPoint.y)];
  
  // Add all trail segment points
  for (let segment of currentTrail) {
    if (segment && typeof segment.x === 'number' && typeof segment.y === 'number') {
      // Round coordinates to prevent floating point issues
      const x = Math.round(segment.x);
      const y = Math.round(segment.y);
      vertices.push(createVector(x, y));
    }
  }
  
  // If we don't have at least 3 points (to form a polygon), return null
  if (vertices.length < 3) {
    console.log("Not enough vertices for a polygon");
    return null;
  }
  
  // Ensure the polygon is closed by adding the first point again if needed
  const firstPoint = vertices[0];
  const lastPoint = vertices[vertices.length - 1];
  
  if (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y) {
    // Add the first point again to close the polygon
    vertices.push(createVector(firstPoint.x, firstPoint.y));
  }
  
  // For debug, log the vertices
  console.log("Polygon vertices:", vertices.length);
  
  return vertices;
}

// Find a path along borders that connects two points on borders
function findBorderPath(startPoint, endPoint) {
  // Find which borders the points are on
  let startBorder = null;
  let endBorder = null;
  
  for (let border of Borders) {
    if (isPointOnBorder(startPoint, border, 5)) {
      startBorder = border;
    }
    if (isPointOnBorder(endPoint, border, 5)) {
      endBorder = border;
    }
  }
  
  if (!startBorder || !endBorder) {
    return null;
  }
  
  // If the points are on the same border, we only need a direct path
  if (startBorder === endBorder) {
    return [createVector(endPoint.x, endPoint.y)];
  }
  
  // Otherwise, we need to follow the borders around
  const path = [];
  
  // Get corners of the starting border
  const startCorners = getBorderCorners(startBorder);
  // Get corners of the ending border
  const endCorners = getBorderCorners(endBorder);
  
  // Find the closest corner to the starting point
  let currentPoint = startPoint;
  let currentBorder = startBorder;
  
  // Keep track of visited borders to avoid loops
  const visitedBorders = new Set();
  visitedBorders.add(currentBorder);
  
  // Maximum iterations to prevent infinite loops
  const maxIterations = 20;
  let iterations = 0;
  
  while (currentBorder !== endBorder && iterations < maxIterations) {
    iterations++;
    
    // Get corners of the current border
    const corners = getBorderCorners(currentBorder);
    // Find the closest corner to the current point
    let closestCorner = null;
    let minDist = Infinity;
    
    for (let corner of corners) {
      const d = dist(currentPoint.x, currentPoint.y, corner.x, corner.y);
      if (d < minDist) {
        minDist = d;
        closestCorner = corner;
      }
    }
    
    if (closestCorner) {
      // Add the corner to the path
      path.push(createVector(closestCorner.x, closestCorner.y));
      currentPoint = closestCorner;
      
      // Find the next border that shares this corner
      let nextBorder = null;
      
      for (let border of Borders) {
        if (border !== currentBorder && !visitedBorders.has(border)) {
          const borderCorners = getBorderCorners(border);
          for (let corner of borderCorners) {
            if (dist(corner.x, corner.y, closestCorner.x, closestCorner.y) < 5) {
              nextBorder = border;
              break;
            }
          }
          if (nextBorder) break;
        }
      }
      
      if (nextBorder) {
        currentBorder = nextBorder;
        visitedBorders.add(currentBorder);
      } else {
        // No next border found, break
        break;
      }
    } else {
      // No closest corner found, break
      break;
    }
  }
  
  // If we found a path to the end border, add the end point
  if (currentBorder === endBorder) {
    path.push(createVector(endPoint.x, endPoint.y));
  }
  
  return path;
}

// Helper to check if a point is on a border
function isPointOnBorder(point, border, tolerance = 5) {
  // For horizontal borders (wider than tall)
  if (border.w >= border.h) {
    return Math.abs(point.y - border.y) < tolerance && 
          point.x >= border.x - border.w/2 - tolerance && 
          point.x <= border.x + border.w/2 + tolerance;
  } 
  // For vertical borders (taller than wide)
  else {
    return Math.abs(point.x - border.x) < tolerance && 
          point.y >= border.y - border.h/2 - tolerance && 
          point.y <= border.y + border.h/2 + tolerance;
  }
}

// Get the corner points of a border
function getBorderCorners(border) {
  const corners = [];
  
  if (border.w >= border.h) { // Horizontal border
    corners.push({x: border.x - border.w/2, y: border.y});
    corners.push({x: border.x + border.w/2, y: border.y});
  } else { // Vertical border
    corners.push({x: border.x, y: border.y - border.h/2});
    corners.push({x: border.x, y: border.y + border.h/2});
  }
  
  return corners;
}

// Determine which side of the game area was claimed
function determineClaimedSide(polygon) {
  if (!polygon || polygon.length < 3) return "unknown";
  
  // Just return "smaller" as default for now
  // This simplification helps avoid errors
  return "smaller";
}

// The shoelace formula for calculating polygon area
function calculatePolygonArea(vertices) {
  let area = 0;
  let j = vertices.length - 1;
  
  for (let i = 0; i < vertices.length; i++) {
    area += (vertices[j].x + vertices[i].x) * (vertices[j].y - vertices[i].y);
    j = i;
  }
  
  return Math.abs(area / 2);
}

// Check if a point is inside a polygon using ray casting algorithm
function isPointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;
  
  // First check: is point exactly on any edge?
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    // Check if point is exactly on an edge (with small tolerance)
    const tolerance = 0.1;
    
    // For horizontal edges
    if (Math.abs(yi - yj) < tolerance && 
        Math.abs(point.y - yi) < tolerance &&
        point.x >= Math.min(xi, xj) - tolerance && 
        point.x <= Math.max(xi, xj) + tolerance) {
      return true; // Point is on a horizontal edge
    }
    
    // For vertical edges
    if (Math.abs(xi - xj) < tolerance && 
        Math.abs(point.x - xi) < tolerance &&
        point.y >= Math.min(yi, yj) - tolerance && 
        point.y <= Math.max(yi, yj) + tolerance) {
      return true; // Point is on a vertical edge
    }
  }
  
  // Standard ray-casting algorithm for points not on edges
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}
// Create a visual representation of the claimed area using the actual polygon
function createAreaFill(polygon) {
  if (!polygon || polygon.length < 3) {
    console.log("Invalid polygon for area fill");
    return;
  }
  
  // Make sure gameField is available
  if (!gameField || !gameField.visible) {
    console.log("Game field not available - making visible");
    if (gameField) gameField.visible = true;
  }
  
  // Determine which side was claimed
  const claimedSide = determineClaimedSide(polygon);
  
  // Create a filled sprite to represent the claimed area
  try {
    console.log("Creating claimed area sprite");
    let claimedSprite = new Sprite();
    
    // Calculate centroid and bounds of polygon
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let sumX = 0, sumY = 0;
    
    for (let vertex of polygon) {
      sumX += vertex.x;
      sumY += vertex.y;
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    }
    
    // Position and size the claimed sprite (approximation using bounding box)
    claimedSprite.x = sumX / polygon.length;
    claimedSprite.y = sumY / polygon.length;
    claimedSprite.w = maxX - minX + 10; // Add padding
    claimedSprite.h = maxY - minY + 10;
    
    // Use one of the colors from the palette directly (no color() function)
    claimedSprite.color = pallete[Math.floor(Math.random() * pallete.length)];
    claimedSprite.opacity = 0.5; // Semi-transparent
    
    // Make sure it's behind other elements
    claimedSprite.layer = -1;
    claimedSprite.collider = 'n'; // No collision
    
    // Store for tracking
    window.claimedSprites = window.claimedSprites || [];
    window.claimedSprites.push(claimedSprite);
    
    // Store claimed area info
    window.lastClaimedArea = window.lastClaimedArea || [];
    window.lastClaimedArea.push({
      polygon: polygon,
      side: claimedSide,
      sprite: claimedSprite
    });
    
    console.log("Successfully created area sprite");
    
    // Create the borders around the polygon
    createBordersFromPolygon(polygon);
    
  } catch (error) {
    console.error("Error in createAreaFill:", error);
  }
}

// Create border sprites from polygon edges
function createBordersFromPolygon(polygon) {
  if (!polygon || polygon.length < 3) return;
  
  try {
    console.log("Creating borders for polygon with", polygon.length, "vertices");
    
    // Ensure the polygon is closed
    const firstVertex = polygon[0];
    const lastVertex = polygon[polygon.length - 1];
    
    // Add the first vertex again if needed to close the loop
    if (firstVertex.x !== lastVertex.x || firstVertex.y !== lastVertex.y) {
      polygon.push({x: firstVertex.x, y: firstVertex.y});
    }
    
    // Create borders with small overlap to ensure no gaps
    for (let i = 0; i < polygon.length - 1; i++) {
      const p1 = polygon[i];
      const p2 = polygon[i + 1];
      
      // For horizontal or near-horizontal segments
      if (Math.abs(p1.y - p2.y) <= 2) {
        let newBorder = new Borders.Sprite();
        newBorder.y = (p1.y + p2.y) / 2; // Average y-value
        newBorder.x = (p1.x + p2.x) / 2;
        newBorder.w = Math.abs(p2.x - p1.x) + 1; // +1 to ensure overlap
        newBorder.h = 3; // Thicker for visibility
        newBorder.color = "#000000";
        newBorder.collider = 'k';
      } 
      // For vertical or near-vertical segments
      else if (Math.abs(p1.x - p2.x) <= 2) {
        let newBorder = new Borders.Sprite();
        newBorder.x = (p1.x + p2.x) / 2; // Average x-value
        newBorder.y = (p1.y + p2.y) / 2;
        newBorder.w = 3; // Thicker for visibility
        newBorder.h = Math.abs(p2.y - p1.y) + 1; // +1 to ensure overlap
        newBorder.color = "#000000";
        newBorder.collider = 'k';
      }
      // For diagonal segments, break into horizontal and vertical parts
      else {
        // Create horizontal then vertical segments
        // 1. Horizontal segment first (from p1 to intermediate point)
        const midX = p2.x;
        const midY = p1.y;
        
        let horizBorder = new Borders.Sprite();
        horizBorder.y = p1.y;
        horizBorder.x = (p1.x + midX) / 2;
        horizBorder.w = Math.abs(midX - p1.x) + 1;
        horizBorder.h = 3;
        horizBorder.color = "#000000";
        horizBorder.collider = 'k';
        
        // 2. Vertical segment (from intermediate point to p2)
        let vertBorder = new Borders.Sprite();
        vertBorder.x = p2.x;
        vertBorder.y = (midY + p2.y) / 2;
        vertBorder.w = 3;
        vertBorder.h = Math.abs(p2.y - midY) + 1;
        vertBorder.color = "#000000";
        vertBorder.collider = 'k';
      }
    }
    
    // Update sparx enemies after adding new borders
    for (let sparc of sparx) {
      // If sparc is not on any border, move it to the nearest one
      if (!isSparcOnBorder(sparc)) {
        findAndMoveToNearestBorder(sparc);
      }
    }
    
  } catch (error) {
    console.error("Error creating borders from polygon:", error);
  }
}

function fillClaimedArea(polygon) {
  if (!polygon || polygon.length < 3) {
    console.log("Invalid polygon for area fill");
    return false;
  }
  
  // Make sure gameField is available
  if (!gameField || !gameField.visible) {
    console.log("Game field not available - making visible");
    if (gameField) gameField.visible = true;
  }
  
  try {
    console.log("Creating claimed area with improved algorithm");
    
    // Calculate bounds for grid creation
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (let vertex of polygon) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    }
    
    // Use a smaller blockSize for more precise filling
    const blockSize = 4; // Reduced from 8 to 4
    
    // Create a filled sprite group
    const fillSprites = new Group();
    fillSprites.collider = 'n';
    fillSprites.layer = 1; // Behind game elements
    
    // Pick a random color from the palette
    const fillColor = "#FF0000";
    fillSprites.color = fillColor;
    fillSprites.opacity = 0.9; // Slightly more opaque for better visibility
    
    // Check if any corner is in polygon, not just center
    function anyPointInBlock(x, y, size, polygon) {
      // Check center and four corners
      return isPointInPolygon({x: x + size/2, y: y + size/2}, polygon) || // Center
             isPointInPolygon({x, y}, polygon) || // Top-left
             isPointInPolygon({x: x + size, y}, polygon) || // Top-right
             isPointInPolygon({x, y: y + size}, polygon) || // Bottom-left
             isPointInPolygon({x: x + size, y: y + size}, polygon); // Bottom-right
    }
    
    // Create a grid of fill blocks using improved detection
    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x += blockSize) {
      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y += blockSize) {
        if (anyPointInBlock(x, y, blockSize, polygon)) {
          let fillBlock = new fillSprites.Sprite();
          fillBlock.x = x + blockSize/2;
          fillBlock.y = y + blockSize/2;
          fillBlock.w = blockSize;
          fillBlock.h = blockSize;
          fillBlock.strokeWeight = 0; // No border
        }
      }
    }
    
    // Store for tracking
    window.fillAreas = window.fillAreas || [];
    window.fillAreas.push({
      sprites: fillSprites,
      polygon: polygon
    });
    
    // Create borders after the fill to ensure they're on top
    createBordersFromPolygon(polygon);
    
    // Calculate and return the actual area percentage
    let areaSize = calculatePolygonArea(polygon);
    let fieldArea = gameField.w * gameField.h;
    let areaPercentage = (areaSize / fieldArea) * 100;
    
    // Apply reasonable limits
    areaPercentage = Math.min(areaPercentage, 30); // Cap at 30%
    areaPercentage = Math.max(areaPercentage, 0.5); // Min 0.5%
    
    console.log(`Area claimed: ${areaPercentage.toFixed(2)}%`);
    return areaPercentage;
    
  } catch (error) {
    console.error("Error filling claimed area:", error);
    return false;
  }
}

//check if a sparc is on any border
function isSparcOnBorder(sparc, tolerance = 3) {
  for (let border of Borders) {
    if (isOnBorder(sparc, border, tolerance)) {
      return true;
    }
  }
  return false;
}
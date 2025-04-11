let gameField;
let Borders;
// [0] LEFT;
// [1] RIGTH;
// [2] TOP;
// [3] BOTTOM;


let level;
let levelWon = false;
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
  let playerInvinsible = false;
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
  cover = loadImage("assets/coverArt.png");
  heartImg = loadImage("assets/heart.png");
  font = loadFont('assets/LLDEtechnoGlitchGX.ttf');
}
function setup() {
  new Canvas(windowWidth, windowHeight);
  displayMode(CENTER);
  textAlign(CENTER);
  world.gravity.y = 0;
  world.gravity.x = 0;
  level = 1;

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
    Borders.layer = 2;
    const BORDER_THICKNESS = 3;

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

    initOriginalBorders();
    markOriginalBorders();

  //---hearts---
  hearts = new Group();
      hearts.image = heartImg;
      hearts.collider = "s";
  for (let x = 0; x < lives;  x++) {
    let heart = new hearts.Sprite();
    heart.x = 50*x + 50;
    hearts.y = 50;1
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
    player.layer = 5; // Higher layer than trails

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
    qixi.layer = 5; // Higher layer than trails

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
      sparc.movementPattern = Math.floor(random(0, 3)); // 0, 1, or 2
      sparc.patternSteps = 0;
      sparc.patternDuration = Math.floor(random(50, 150));
    }
    sparx.layer = 5; // Higher layer than trails

  let ogQix = new qixi.Sprite();
	let ogSparc = new sparx.Sprite();
  
  // Initialize tracking for claimed areas
  window.lastClaimedArea = [];
  window.claimedSprites = [];

  //---Layering-------------------------
  player.overlaps(gameField);
  qixi.overlaps(gameField);

  sparx.overlaps(gameField);
  sparx.overlaps(sparx);
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

//---GAMESTATES-------------------------------------------------------------------------
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
function runGame(){
  background('#e3d5ca');
   //---PlayThrough Info------------
  push();
    fill("#8E7DBE");
    textSize(30);
    textAlign("left");
    text(" Score: "+score, width*0.01, height*0.2);
    text("Score Multiplier: "+lives*100, width*0.01, height*0.3);
    text(" Area Claimed: "+claimedArea.toFixed(2)+"%", width*0.01, height*0.4);
    text(" Goal Area: 75%", width*0.01, height*0.5);

    textSize(20);
    text('↑', width * 0.9, height - (height * 0.3));
    text('← move →', width * 0.87, height - (height * 0.2));
    text('↓', width * 0.9, height - (height * 0.1));
  pop();

  // Only process game logic if we're actually in the runGame state

  if (gameState === runGame) {
  // Only apply velocity if player is not invulnerable
  if (!playerInvinsible) {
      //---PLAYER MEOVEMENT-------------------------------
      player.velocity.x = PspeedX; // Apply velocity based on current speed
      player.velocity.y = PspeedY;
      // Constrain player within game field
      player.x = constrain(player.x, windowWidth / 2 - gameField.w / 2, windowWidth / 2 + gameField.w / 2);
      player.y = constrain(player.y, windowHeight / 2 - gameField.h / 2, windowHeight / 2 + gameField.h / 2);
  }
    //---TRAILS-----------------------------------------
    if (!playerInvinsible) {
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
          
          //  don't try to create a path back to the start
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
        if (distFromLast >= trailSegmentDistance) {
          createTrailSegment(player.x, player.y);
        }
      } else {
        // First segment when starting a trail
        createTrailSegment(player.x, player.y);
      }
    }
  }
    //---ENEMY MOVEMENT------------------------------------
    for (let qix of qixi) { 
      updateQix(qix);
    }
    for (let sparc of sparx) {  
      updateSparc(sparc);
       breakSparxLoops(sparc);
    }  
   
    //---collision checks-----------------------------------------
    if (!playerInvinsible) {
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
  }
    //---check player progress-------------------------------------
    if (claimedArea >= 75) {
      levelOver();
    }
}

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

checkForStuckSparx();
//---world update------
  // These are kept outside the conditional to ensure sprites still render
  // in all game states, but they don't update positions/logic if not in runGame
  allSprites.draw();
  if (gameState === runGame) {
    allSprites.update();
    world.step();
  }
}

//---DIFFICULTY PROGRESSION--------------------------------------------------
function addSparc() {
	let newSparc = new sparx.Sprite();
  // Check the distance between the player and the new sparc
  let distance = dist(player.x, player.y, newSparc.x, newSparc.y);
  if (distance <= player.diameter * 2) {
    // if too close adjust the x position of the new sparc
    newSparc.x += windowWidth / 4;
  }
  for (let s of sparx) {
    if (s.x === newSparc.x && s.y === newSparc.y) {
      // If the position is already occupied, remove the new sparc and try again
      newSparc.x += windowWidth / 4;

    }
  }  
}

function addQix() {
  let newQix;
  let isValidPosition = false;

  while (!isValidPosition) {
    // Create a new Qix at a random position within the game field
    newQix = new qixi.Sprite();
    newQix.x = random(gameField.x - gameField.w / 2, gameField.x + gameField.w / 2);
    newQix.y = random(gameField.y - gameField.h / 2, gameField.y + gameField.h / 2);

    // Check the distance between the player and the new Qix
    let distance = dist(player.x, player.y, newQix.x, newQix.y);

    // Check if the Qix is inside a claimed area
    let isInsideClaimedArea = false;
    for (let claimed of window.claimedSprites || []) {
      if (
        newQix.x >= claimed.x - claimed.w / 2 &&
        newQix.x <= claimed.x + claimed.w / 2 &&
        newQix.y >= claimed.y - claimed.h / 2 &&
        newQix.y <= claimed.y + claimed.h / 2
      ) {
        isInsideClaimedArea = true;
        break;
      }
    }

    // If the position is valid, exit the loop
    if (distance > player.diameter * 2 && !isInsideClaimedArea) {
      isValidPosition = true;
    } else {
      // Remove the invalid Qix sprite before retrying
      newQix.remove();
    }
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
  if (playerInvinsible) {
    console.log("Player is invulnerable, ignoring hit");
    return; // Ignore if player is invulnerable
  }
 // Set player as invulnerable
  playerInvinsible= true;
  console.log("Player hit! Lives remaining:", lives - 1);
 
  
  // Ensure game field stays visible
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
      
      // Set player as no longer invulnerable
      playerInvinsible = false;
          }
  }, 200); // 200ms per state change
    // Ensure field stays visible after recovery
    setTimeout(() => {
      if (gameField) {
        gameField.visible = true;
      }
    }, 2000); // After recovery should be complete
}
 
//---LEVEL OVER---------------------------------------------------------------
function levelOver() {
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
  if (claimedArea >= 75){
    levelWon = true;
  }
  else {
    levelWon = false;
  }

  console.log("Level won:", levelWon);
  console.log("Final score:", score);
  console.log("Final area:", claimedArea);
  console.log("level:", level);

  // Make sure gameOverScreen function exists before we try to use it
  if (typeof gameOverScreen !== 'function') {

    window.gameOverScreen = function() {
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
        if (level < 5){
             text("LEVEL COMPLETE!", width/2, height/3);
        }
        else {
          text("CONGRATULATION YOU FINISHED THE GAME!", width/2, height/3);
        }
      } 
      else {
        fill("#D88C9A"); // Red from palette
        text("GAME OVER", width/2, height/3);
      }

      // Display stats
      textSize(24);
      fill("white");
      text("Level: " + level, width/2, height/2 - 60);
      text(`Score: ${score}`, width/2, height/2 - 40);
      text(`Area Claimed: ${claimedArea.toFixed(2)}%`, width/2, height/2);

      // Options
      textSize(30);

      // First button: Next Level or Restart
      let firstBtnY = height/2 + 80;
      if (mouseY > firstBtnY - 25 && mouseY < firstBtnY + 25 && 
          mouseX > width/2 - 100 && mouseX < width/2 + 100) {
        fill("#8E7DBE"); // Purple from palette
        if (mouse.presses()) {
          if (levelWon && level < 5) {
            // Next level
            nextLevelReset();
          } else {
            // Full restart
            fullReset();
          }
          return;
        }
      } else {
        fill("white");
      }

      if (levelWon && level < 5) {
        text("Next Level", width/2, firstBtnY);
      } else {
        text("Restart", width/2, firstBtnY);
      }

      // Main menu button
      let menuBtnY = height/2 + 140;
      if (mouseY > menuBtnY - 25 && mouseY < menuBtnY + 25 && 
          mouseX > width/2 - 100 && mouseX < width/2 + 100) {
        fill("#8E7DBE"); // Purple from palette
        if (mouse.presses()) {
          // Go back to intro with full reset
          fullReset(true);
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
      setTimeout(() => {
        gameState = gameOverScreen;
      }, 100);
    }
  }, 300); // 300ms per state change
}

// Function for full game reset (back to level 1)
function fullReset(toIntro = false) {
  // Ensure the game field is visible
  if (gameField) {
    gameField.visible = true;
  }
  
  // Clean up any claimed area tracking
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
  
  // Reset game variables to initial state
  score = 0;
  claimedArea = 0;
  lives = 3;
  level = 1;
  
  // Remove all existing enemies
  for (let enemy of qixi) {
    enemy.remove();
  }
  for (let enemy of sparx) {
    enemy.remove();
  }
  
  // Create level 1 enemies
  let newQix = new qixi.Sprite();
  let newSparc = new sparx.Sprite();
  
  // Reset common game elements
  resetCommonElements();
  
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
    playerInvinsible = false; // Reset invincibility
    gameState = runGame;
  }
}
// Function for next level reset (keeping level progress)
function nextLevelReset() {
  // Ensure the game field is visible
  if (gameField) {
    gameField.visible = true;
  }
  
  // Clean up any claimed area tracking
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
  
  // Reset score and area, but keep level progression
  score = 0;
  claimedArea = 0;
  lives = 3;
  
  // Increment level
  level++;
  console.log("Level increased to:", level);
  
  // Add appropriate enemies based on current level
  if (level === 2) {
    addSparc();
  } 
  else if (level === 3) {
    addQix();
    addSparc();
  }
  else if (level === 4) {
    addSparc();
  }
  else if (level === 5) {
    addQix();
    addSparc();
  }
  
  // Reset common game elements
  resetCommonElements();
  
  // Make all sprites visible for gameplay
  for (let sprite of allSprites) {
    if (trails.includes(sprite)) {
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
// Common reset elements used by both reset functions
function resetCommonElements() {
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

  // Reset hearts
  if (hearts.length < 3){
    for (let i = hearts.length; i < 3; i++) {
      let heart = new hearts.Sprite();
      heart.x = 50*i + 50;
      heart.y = 50;
    }
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
  
  // Reset player position
  player.x = windowWidth / 2;
  player.y = gameField.y + gameField.h / 2;
  player.velocity.x = 0;
  player.velocity.y = 0;
  PspeedX = 0;
  PspeedY = 0;
  currentPlayerDirection = null;
  
  // Reset game field color
  gameField.color = random(pallete);
  
  // Double-check all sprites' positions and visibility
  for (let sprite of allSprites) {
    // Reset any unexpected velocity
    sprite.velocity.x = 0;
    sprite.velocity.y = 0;
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
  try {
    // Update stuck detection
    if (!sparc.lastX) {
      sparc.lastX = sparc.x;
      sparc.lastY = sparc.y;
      sparc.stuckTime = 0;
    } else {
      // Check if position changed significantly
      if (dist(sparc.x, sparc.y, sparc.lastX, sparc.lastY) < 0.5) {
        sparc.stuckTime = (sparc.stuckTime || 0) + 1;
      } else {
        // Reset if moving normally
        sparc.lastX = sparc.x;
        sparc.lastY = sparc.y;
        sparc.stuckTime = 0;
      }
      
      // Emergency recovery if stuck too long
      if (sparc.stuckTime > 60) { // 1 second at 60fps
        sparc.stuckRecoveryAttempts = (sparc.stuckRecoveryAttempts || 0) + 1;
        
        // If multiple recovery attempts fail, teleport to safety
        if (sparc.stuckRecoveryAttempts > 3) {
          console.log("Emergency sparx teleport after multiple recovery failures");
          
          // Find an original border
          const originalBorders = Borders.filter(b => b.isOriginalBorder);
          if (originalBorders.length > 0) {
            const originalBorder = originalBorders[Math.floor(random(0, originalBorders.length))];
            
            if (originalBorder.w >= originalBorder.h) { // Horizontal
              sparc.x = originalBorder.x - originalBorder.w/4; // Position away from edge
              sparc.y = originalBorder.y;
              sparc.velocity.x = sparcSpeed;
              sparc.velocity.y = 0;
            } else { // Vertical
              sparc.x = originalBorder.x;
              sparc.y = originalBorder.y - originalBorder.h/4; // Position away from edge
              sparc.velocity.x = 0;
              sparc.velocity.y = sparcSpeed;
            }
          } else {
            // Fallback to a specific position if no original borders found
            sparc.x = gameField.x - gameField.w/2 + 20;
            sparc.y = gameField.y - gameField.h/2 + 20;
            sparc.velocity.x = sparcSpeed;
            sparc.velocity.y = 0;
          }
          
          sparc.stuckTime = 0;
          sparc.stuckRecoveryAttempts = 0;
          sparc.isHandlingCorner = false;
          return;
        }
        
        // Try to recover by finding another border
        findAndMoveToNearestBorder(sparc);
        sparc.stuckTime = 0;
      }
    }
    
    // Find current border
    let currentBorder = null;
    for (let border of Borders) {
      if (isOnBorder(sparc, border, 5)) {
        currentBorder = border;
        break;
      }
    }
    
    // If not on any border, find the nearest one
    if (!currentBorder) {
      findAndMoveToNearestBorder(sparc);
      return;
    }
    
    // Check if at a corner/junction
    const isAtCorner = isAtBorderCorner(sparc, 10); // Increased tolerance at corners
    
    // Handle corner turns
    if (isAtCorner && !sparc.isHandlingCorner) {
      handleCornerTurn(sparc, currentBorder);
    }
    // Continue along current border
    else if (!isAtCorner) {
      sparc.isHandlingCorner = false;
      continueAlongBorder(sparc, currentBorder);
    }
  } catch (error) {
    console.error("Error in updateSparc:", error);
    // Emergency recovery from error
    findAndMoveToNearestBorder(sparc);
  }
}
function findAndMoveToNearestBorder(sparc) {
  let nearestPoint = null;
  let minDist = Infinity;
  let nearestBorder = null;
  
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
      nearestBorder = border;
    }
  }
  
  // Move towards the nearest point
  if (nearestPoint) {
    // Teleport if very far from any border to prevent getting stuck
    if (minDist > 30) {
      sparc.x = nearestPoint.x;
      sparc.y = nearestPoint.y;
      
      // Set initial velocity along the border
      sparc.velocity.x = sparc.velocity.y = 0;
      
      // Determine direction based on border orientation
      if (nearestBorder.w >= nearestBorder.h) {
        // For horizontal borders
        sparc.velocity.x = sparcSpeed; // Default to moving right
      } else {
        // For vertical borders
        sparc.velocity.y = sparcSpeed; // Default to moving down
      }
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
  } else {
    // Emergency reset if no nearest point found
    console.log("No nearest border found - emergency reset");
    sparc.x = gameField.x - gameField.w/2; // Left border
    sparc.y = gameField.y - gameField.h/2; // Top border
    sparc.velocity.x = sparcSpeed;
    sparc.velocity.y = 0;
  }
}
// Check if a sprite is at a corner/junction
function isAtBorderCorner(sparc, tolerance = 8) {
  // Get all potential corner points
  const corners = getAllBorderCorners();
  
  // Check if the sparc is near any corner
  for (let corner of corners) {
    if (dist(sparc.x, sparc.y, corner.x, corner.y) < tolerance) {
      sparc.cornerPoint = corner;
      return true;
    }
  }
  
  return false;
}
// Handle turns at corners
function handleCornerTurn(sparc, currentBorder) {
  // Set handling flag to prevent multiple turns
  sparc.isHandlingCorner = true;
  
  // Get corner point
  const corner = sparc.cornerPoint;
  if (!corner) {
    sparc.isHandlingCorner = false;
    return;
  }
  
  // Ensure sparc is exactly at the corner
  sparc.x = corner.x;
  sparc.y = corner.y;
  
  // Find all borders that connect at this corner
  const connectedBorders = findConnectedBorders(corner, currentBorder);
  
  // If we found connected borders, choose one to follow
  if (connectedBorders.length > 0) {
    // Determine previous direction
    const prevDirX = Math.sign(sparc.velocity.x);
    const prevDirY = Math.sign(sparc.velocity.y);
    
    // Filter out borders that would cause reversing direction
    const validBorders = connectedBorders.filter(border => {
      // For current horizontal border, avoid connected horizontals going opposite direction
      if (currentBorder.w >= currentBorder.h && border.w >= border.h) {
        // Check if new direction would be opposite
        if ((prevDirX > 0 && border.x < corner.x) || (prevDirX < 0 && border.x > corner.x)) {
          return false;
        }
      }
      // For current vertical border, avoid connected verticals going opposite direction
      else if (currentBorder.w < currentBorder.h && border.w < border.h) {
        // Check if new direction would be opposite
        if ((prevDirY > 0 && border.y < corner.y) || (prevDirY < 0 && border.y > corner.y)) {
          return false;
        }
      }
      return true;
    });
    
    // Use all connected borders if no valid ones (prefer some movement over none)
    const borderPool = validBorders.length > 0 ? validBorders : connectedBorders;
    
    // Add randomness to path selection to prevent loops
    // Store the last few choices to avoid immediate repeats
    if (!sparc.lastChoices) sparc.lastChoices = [];
    
    // Create a weighted random selection
    // Borders that weren't recently chosen get higher weights
    let weightedBorders = [];
    for (let border of borderPool) {
      // Generate a unique ID for the border based on its properties
      const borderID = `${border.w >= border.h ? 'H' : 'V'}-${border.x.toFixed(0)}-${border.y.toFixed(0)}`;
      
      // Check if this border was chosen recently
      const wasTakenRecently = sparc.lastChoices.includes(borderID);
      
      // Add border to selection pool with weight based on recency
      const weight = wasTakenRecently ? 1 : 3;  // Higher weight if not recently chosen
      for (let i = 0; i < weight; i++) {
        weightedBorders.push(border);
      }
    }
    
    // Choose a random border from weighted pool
    const chosenBorder = random(weightedBorders);
    
    // Store this choice in history (limit to last 3 choices)
    const chosenID = `${chosenBorder.w >= chosenBorder.h ? 'H' : 'V'}-${chosenBorder.x.toFixed(0)}-${chosenBorder.y.toFixed(0)}`;
    sparc.lastChoices.unshift(chosenID);
    if (sparc.lastChoices.length > 3) sparc.lastChoices.pop();
    
    // Set velocity based on new border orientation
    if (chosenBorder.w >= chosenBorder.h) { // Horizontal
      sparc.velocity.y = 0;
      
      // Determine direction based on corner and border positions
      if (corner.x <= chosenBorder.x - chosenBorder.w/2 + 5) {
        sparc.velocity.x = sparcSpeed; // Go right from left edge
      } else if (corner.x >= chosenBorder.x + chosenBorder.w/2 - 5) {
        sparc.velocity.x = -sparcSpeed; // Go left from right edge
      } else {
        // Introduce randomness in the middle of the border
        // But with bias against previous direction to avoid ping-pong loops
        const bias = random();
        if (bias < 0.7) { // 70% chance to go in a different direction than before
          sparc.velocity.x = (prevDirX !== 0) ? -sparcSpeed * prevDirX : (random() > 0.5 ? sparcSpeed : -sparcSpeed);
        } else {
          sparc.velocity.x = (prevDirX !== 0) ? sparcSpeed * prevDirX : (random() > 0.5 ? sparcSpeed : -sparcSpeed);
        }
      }
    } else { // Vertical
      sparc.velocity.x = 0;
      
      // Determine direction based on corner and border positions
      if (corner.y <= chosenBorder.y - chosenBorder.h/2 + 5) {
        sparc.velocity.y = sparcSpeed; // Go down from top edge
      } else if (corner.y >= chosenBorder.y + chosenBorder.h/2 - 5) {
        sparc.velocity.y = -sparcSpeed; // Go up from bottom edge
      } else {
        // Introduce randomness in the middle of the border
        // But with bias against previous direction to avoid ping-pong loops
        const bias = random();
        if (bias < 0.7) { // 70% chance to go in a different direction than before
          sparc.velocity.y = (prevDirY !== 0) ? -sparcSpeed * prevDirY : (random() > 0.5 ? sparcSpeed : -sparcSpeed);
        } else {
          sparc.velocity.y = (prevDirY !== 0) ? sparcSpeed * prevDirY : (random() > 0.5 ? sparcSpeed : -sparcSpeed);
        }
      }
    }
    
    // Add a small random delay before we unset the handling flag
    // This helps prevent multiple corner handling events in quick succession
    const randomDelay = 300 + Math.floor(random() * 200);
    setTimeout(() => {
      sparc.isHandlingCorner = false;
    }, randomDelay);
    
    // Add a small amount of variability to speed to break up patterns
    sparc.maxSpeed = sparcSpeed * (0.9 + random() * 0.2);  // Speed varies by ±10%
    
  } else {
    // No valid connected borders, try to recover
    console.log("No connected borders found at corner, trying recovery");
    findAndMoveToNearestBorder(sparc);
    sparc.isHandlingCorner = false;
  }
}

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
      
      // Before reversing direction, check if there's a connecting border at this end
      const endPoint = (sparc.velocity.x > 0) ? 
        { x: border.x + border.w/2, y: border.y } : 
        { x: border.x - border.w/2, y: border.y };
      
      let foundConnection = false;
      
      // Look for vertical borders that connect at this endpoint
      for (let otherBorder of Borders) {
        if (otherBorder !== border && otherBorder.w < otherBorder.h) { // Vertical borders only
          const topPoint = { x: otherBorder.x, y: otherBorder.y - otherBorder.h/2 };
          const bottomPoint = { x: otherBorder.x, y: otherBorder.y + otherBorder.h/2 };
          
          // Check if either end of the vertical border is near our endpoint
          if (dist(endPoint.x, endPoint.y, otherBorder.x, topPoint.y) < 8 ||
              dist(endPoint.x, endPoint.y, otherBorder.x, bottomPoint.y) < 8) {
            
            // Found a connection! Update position and direction
            sparc.x = otherBorder.x;
            sparc.y = endPoint.y;
            sparc.velocity.x = 0;
            sparc.velocity.y = sparcSpeed * (random() > 0.5 ? 1 : -1); // Random direction
            foundConnection = true;
            break;
          }
        }
      }
      
      // If no connection found, reverse direction
      if (!foundConnection) {
        sparc.velocity.x *= -1;
      }
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
      
      // Before reversing direction, check if there's a connecting border
      const endPoint = (sparc.velocity.y > 0) ? 
        { x: border.x, y: border.y + border.h/2 } : 
        { x: border.x, y: border.y - border.h/2 };
      
      let foundConnection = false;
      
      // Look for horizontal borders that connect at this endpoint
      for (let otherBorder of Borders) {
        if (otherBorder !== border && otherBorder.w >= otherBorder.h) { // Horizontal borders only
          const leftPoint = { x: otherBorder.x - otherBorder.w/2, y: otherBorder.y };
          const rightPoint = { x: otherBorder.x + otherBorder.w/2, y: otherBorder.y };
          
          // Check if either end of the horizontal border is near our endpoint
          if (dist(endPoint.x, endPoint.y, leftPoint.x, otherBorder.y) < 8 ||
              dist(endPoint.x, endPoint.y, rightPoint.x, otherBorder.y) < 8) {
            
            // Found a connection! Update position and direction
            sparc.x = endPoint.x;
            sparc.y = otherBorder.y;
            sparc.velocity.x = sparcSpeed * (random() > 0.5 ? 1 : -1); // Random direction
            sparc.velocity.y = 0;
            foundConnection = true;
            break;
          }
        }
      }
      
      // If no connection found, reverse direction
      if (!foundConnection) {
        sparc.velocity.y *= -1;
      }
    }
  }

  sparc.patternSteps++;
  if (sparc.patternSteps >= sparc.patternDuration) {
    // Change movement pattern
    sparc.movementPattern = (sparc.movementPattern + 1) % 3;
    sparc.patternDuration = Math.floor(random(50, 150));
    sparc.patternSteps = 0;
  }
  // Use pattern to influence behavior
  switch(sparc.movementPattern) {
    case 0: // Standard movement
      // Default behavior, no change
      break;
    case 1: // Prefer direction changes
      // Increase chance of turning at next junction
      if (isAtBorderCorner(sparc, 15)) { // Increased detection radius
        handleCornerTurn(sparc, currentBorder);
      }
      break;
    case 2: // Prefer straight paths
      // Reduce chance of turning
      if (isAtBorderCorner(sparc, 5)) { // Reduced detection radius
        if (random() < 0.5) { // Only 50% chance to recognize corner
          handleCornerTurn(sparc, currentBorder);
        }
      }
      break;
  }

}
function breakSparxLoops(sparc) {
      // Check if the sparc has visited the same positions repeatedly
      if (!sparc.positionHistory) sparc.positionHistory = [];
      
      // Add current position to history
      sparc.positionHistory.unshift({x: sparc.x, y: sparc.y});
      if (sparc.positionHistory.length > 20) sparc.positionHistory.pop();
      
      // Check for repeating patterns (at least 6 points)
      if (sparc.positionHistory.length >= 12) {
        let repeatingPattern = true;
        for (let i = 0; i < 6; i++) {
          // Compare first half with second half
          const p1 = sparc.positionHistory[i];
          const p2 = sparc.positionHistory[i+6];
          
          // If any point doesn't match, it's not a repeating pattern
          if (dist(p1.x, p1.y, p2.x, p2.y) > 5) {
            repeatingPattern = false;
            break;
          }
        }
        
        // If we detected a loop, force a random direction change
        if (repeatingPattern) {
          console.log("Breaking sparx movement loop");
          // Find the nearest border and randomize direction
          findAndMoveToNearestBorder(sparc);
          
          // Randomize direction
          if (Math.abs(sparc.velocity.x) > Math.abs(sparc.velocity.y)) {
            // Currently moving horizontally, flip direction with bias to change
            if (random() < 0.8) sparc.velocity.x *= -1;
          } else {
            // Currently moving vertically, flip direction with bias to change
            if (random() < 0.8) sparc.velocity.y *= -1;
          }
          
          // Reset pattern history
          sparc.positionHistory = [];
          
          // Give it a short invulnerability to teleport effect
          sparc.isHandlingCorner = false;
        }
      }
}
function checkForStuckSparx() {
    for (let sparc of sparx) {
      // Check if sparc has been stuck in the same position
      if (!sparc.lastX) {
        sparc.lastX = sparc.x;
        sparc.lastY = sparc.y;
        sparc.stuckTime = 0;
      } else {
        // If position hasn't changed significantly
        if (dist(sparc.x, sparc.y, sparc.lastX, sparc.lastY) < 1) {
          sparc.stuckTime = (sparc.stuckTime || 0) + 1;
          
          // If stuck for too long (adjust threshold as needed)
          if (sparc.stuckTime > 90) { // About 1.5 seconds at 60fps
            console.log("Fixing stuck sparx");
            findAndMoveToNearestBorder(sparc);
            sparc.isHandlingCorner = false;
            sparc.stuckTime = 0;
          }
        } else {
          // Reset if moving normally
          sparc.lastX = sparc.x;
          sparc.lastY = sparc.y;
          sparc.stuckTime = 0;
        }
      }
    }
}
function repositionAllSparx() {
    for (let sparc of sparx) {
      // Reset sparc properties
      sparc.isHandlingCorner = false;
      sparc.cornerPoint = null;
      sparc.stuckTime = 0;
      
      // Check if the sparc is on any border
      let onAnyBorder = false;
      let currentBorder = null;
      
      for (let border of Borders) {
        if (isOnBorder(sparc, border, 5)) {
          onAnyBorder = true;
          currentBorder = border;
          break;
        }
      }
      
      // If on a border, make sure velocity aligns with it
      if (onAnyBorder && currentBorder) {
        if (currentBorder.w >= currentBorder.h) { // Horizontal
          sparc.y = currentBorder.y; // Snap to border
          sparc.velocity.y = 0;
          
          // Set a consistent horizontal velocity
          const movingRight = random() > 0.5;
          sparc.velocity.x = movingRight ? sparcSpeed : -sparcSpeed;
          
          // Check if we're near an edge and fix direction to avoid immediate reversal
          const leftEdge = currentBorder.x - currentBorder.w/2;
          const rightEdge = currentBorder.x + currentBorder.w/2;
          
          if (sparc.x < leftEdge + 10 && sparc.velocity.x < 0) {
            sparc.velocity.x = sparcSpeed; // Moving right if near left edge
          } else if (sparc.x > rightEdge - 10 && sparc.velocity.x > 0) {
            sparc.velocity.x = -sparcSpeed; // Moving left if near right edge
          }
        } else { // Vertical
          sparc.x = currentBorder.x; // Snap to border
          sparc.velocity.x = 0;
          
          // Set a consistent vertical velocity
          const movingDown = random() > 0.5;
          sparc.velocity.y = movingDown ? sparcSpeed : -sparcSpeed;
          
          // Check if we're near an edge and fix direction to avoid immediate reversal
          const topEdge = currentBorder.y - currentBorder.h/2;
          const bottomEdge = currentBorder.y + currentBorder.h/2;
          
          if (sparc.y < topEdge + 10 && sparc.velocity.y < 0) {
            sparc.velocity.y = sparcSpeed; // Moving down if near top edge
          } else if (sparc.y > bottomEdge - 10 && sparc.velocity.y > 0) {
            sparc.velocity.y = -sparcSpeed; // Moving up if near bottom edge
          }
        }
      } else {
        // Not on any border, move to a safe one
        const originalBorders = [Borders[0], Borders[1], Borders[2], Borders[3]];
        const safeBorder = random(originalBorders);
        
        // Position near the middle of the safe border
        if (safeBorder.w >= safeBorder.h) { // Horizontal
          sparc.x = safeBorder.x;
          sparc.y = safeBorder.y;
          sparc.velocity.x = random() > 0.5 ? sparcSpeed : -sparcSpeed;
          sparc.velocity.y = 0;
        } else { // Vertical
          sparc.x = safeBorder.x;
          sparc.y = safeBorder.y;
          sparc.velocity.x = 0;
          sparc.velocity.y = random() > 0.5 ? sparcSpeed : -sparcSpeed;
        }
      }
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

//---PLAYER MOVEMENT------------------------------------------------------
// In the setPlayerDirection function, change the speed values
function setPlayerDirection(direction) {
  PspeedX = 0; // Reset both speeds first
  PspeedY = 0;

  // Determine if player is on a border
  const onBorder = isPlayerOnBorder();
  
  // Set different speeds based on whether player is on border or not
  const borderSpeed = 3; // Speed when on border (keep as is)
  const offBorderSpeed = 3; // Slower speed when off border (new)
  
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
function stopMovement() {
  PspeedX = 0;
  PspeedY = 0;
  currentPlayerDirection = null; // Clear direction
}
function keyPressed() {

    // If player is invulnerable (blinking), ignore key presses
    if (playerInvinsible) {
      return;
    }
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

    // If player is invulnerable (blinking), ignore key presses
    if (playerInvinsible) {
      return;
    }
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
  const alignmentTolerance = 5;
  
  if (lastTrailSegmentPos) {
    // For horizontal movement - only snap when very close to horizontal
    if (Math.abs(y - lastTrailSegmentPos.y) < alignmentTolerance) {
      y = lastTrailSegmentPos.y; // Keep on the same horizontal line
    }
    // For vertical movement - only snap when very close to vertical
    else if (Math.abs(x - lastTrailSegmentPos.x) < alignmentTolerance) {
      x = lastTrailSegmentPos.x; // Keep on the same vertical line
    }
  }
  
  let segment = new trails.Sprite();
  segment.x = x;
  segment.y = y;
  segment.diameter = 1;
  segment.color = "#000000";
  
  currentTrail.push(segment);
  lastTrailSegmentPos = createVector(x, y);
}
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
    
    // Simplify the polygon to remove duplicate or nearly duplicate points
    const simplifiedVertices = simplifyPolygon(vertices, 3); // 3px tolerance
    
    // Fill the claimed area and get back the area percentage
    const areaPercentage = fillClaimedArea(simplifiedVertices);
    
    if (areaPercentage) {
      // Update game state
      claimedArea += areaPercentage;
      
      // Make sure we show a whole number for the score (multiply by lives for scoring multiplier)
      score += Math.floor(areaPercentage * 100 * lives);
      
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
    let createdBorders = [];
    
    // Ensure we create borders only along clear horizontal or vertical paths
    for (let i = 0; i < currentTrail.length - 1; i++) {
      const seg1 = currentTrail[i];
      const seg2 = currentTrail[i + 1];
      
      if (!seg1 || !seg2) {
        console.log(`Segment ${i} or ${i+1} is null, skipping`);
        continue;
      }
      // Calculate the actual distance between points
      const distance = dist(seg1.x, seg1.y, seg2.x, seg2.y);
      
      // Is this a horizontal, vertical or diagonal segment?
      const isHorizontal = Math.abs(seg1.y - seg2.y) < 1;
      const isVertical = Math.abs(seg1.x - seg2.x) < 1;
      
      // Only create a border if points are close enough to be legitimate connections
      if (distance <= trailSegmentDistance * 1.5) {
        // For perfectly horizontal segments
        if (isHorizontal) {
          let newBorder = new Borders.Sprite();
          newBorder.y = Math.round(seg1.y);
          newBorder.x = (seg1.x + seg2.x) / 2;
          newBorder.w = Math.abs(seg2.x - seg1.x);
          newBorder.h = 3; 
          newBorder.color = "#000000";
          newBorder.collider = 'k';
          createdBorders.push({
            type: "horizontal",
            x: newBorder.x,
            y: newBorder.y,
            w: newBorder.w,
            h: newBorder.h
          });
        } 
        // For perfectly vertical segments
        else if (isVertical) {
          let newBorder = new Borders.Sprite();
          newBorder.x = Math.round(seg1.x);
          newBorder.y = (seg1.y + seg2.y) / 2;
          newBorder.w = 3;
          newBorder.h = Math.abs(seg2.y - seg1.y);
          newBorder.color = "#000000";
          newBorder.collider = 'k';
          createdBorders.push({
            type: "vertical",
            x: newBorder.x,
            y: newBorder.y,
            w: newBorder.w,
            h: newBorder.h
          });
        }
        // For diagonal segments
        else {
          
          // First calculate the exact intermediate point (corner of the L)
          const cornerX = seg2.x;
          const cornerY = seg1.y;
          
        }
      } else {
        console.log(`  Distance too large (${distance.toFixed(2)} > ${trailSegmentDistance * 1.5}), skipping`);
      }
    } 
    // Handle sparx AFTER all borders are created
    for (let sparc of sparx) {
      sparc.isHandlingCorner = false;
      if (!isSparcOnBorder(sparc)) {
        findAndMoveToNearestBorder(sparc);
      }
    }
    
    // Clear trail segments AFTER processing all borders
    clearTrailSegments();
    
    console.log("=== END TRAIL CONVERSION ===");
    
  } catch (error) {
    console.error("Error in convertTrailsToBorders:", error);
  }
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
    claimedSprite.layer = 1;
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
    console.log("Creating clean borders for polygon with", polygon.length, "vertices");
    
    // First, remove any trail segments that are now inside the polygon
    for (let segment of currentTrail) {
      if (segment) {
        segment.remove();
      }
    }
    currentTrail = [];
    
    // Get game field boundaries
    const leftBoundary = gameField.x - gameField.w/2; 
    const rightBoundary = gameField.x + gameField.w/2;
    const topBoundary = gameField.y - gameField.h/2;
    const bottomBoundary = gameField.y + gameField.h/2;
    
    // Ensure the polygon is closed
    const firstVertex = polygon[0];
    const lastVertex = polygon[polygon.length - 1];
    
    if (firstVertex.x !== lastVertex.x || firstVertex.y !== lastVertex.y) {
      polygon.push({x: firstVertex.x, y: firstVertex.y});
    }
    
    // IMPORTANT: Better snapping to original borders
    // Adjust vertices to snap exactly to original borders
    for (let i = 0; i < polygon.length; i++) {
      // Snap to left/right borders
      if (Math.abs(polygon[i].x - leftBoundary) < 5) {
        polygon[i].x = leftBoundary;
      } else if (Math.abs(polygon[i].x - rightBoundary) < 5) {
        polygon[i].x = rightBoundary;
      }
      
      // Snap to top/bottom borders
      if (Math.abs(polygon[i].y - topBoundary) < 5) {
        polygon[i].y = topBoundary;
      } else if (Math.abs(polygon[i].y - bottomBoundary) < 5) {
        polygon[i].y = bottomBoundary;
      }
    }
    
    // Check if this is a border-connected polygon
    let skipEdges = [];
    
    for (let i = 0; i < polygon.length - 1; i++) {
      const p1 = polygon[i];
      const p2 = polygon[i + 1];
      
      // Check if this segment is on an existing border
      for (let border of Borders) {
        if ((isPointOnBorder(p1, border, 3) && isPointOnBorder(p2, border, 3)) ||
            (Math.abs(p1.x - p2.x) < 3 && Math.abs(p1.x - leftBoundary) < 3) ||
            (Math.abs(p1.x - p2.x) < 3 && Math.abs(p1.x - rightBoundary) < 3) ||
            (Math.abs(p1.y - p2.y) < 3 && Math.abs(p1.y - topBoundary) < 3) ||
            (Math.abs(p1.y - p2.y) < 3 && Math.abs(p1.y - bottomBoundary) < 3)) {
          skipEdges.push(i);
          break;
        }
      }
    }
    
    // Create borders with perfect alignment to the fill area
    let newBorders = [];
    
    for (let i = 0; i < polygon.length - 1; i++) {
      // Skip if this edge is on an existing border
      if (skipEdges.includes(i)) continue;
      
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
        newBorder.newBorder = true; // Mark as a new border
        newBorders.push(newBorder);
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
        newBorder.newBorder = true; // Mark as a new border
        newBorders.push(newBorder);
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
        horizBorder.w = Math.abs(midX - p1.x) + 1; // Add 1 to ensure overlap
        horizBorder.h = 3;
        horizBorder.color = "#000000";
        horizBorder.collider = 'k';
        horizBorder.newBorder = true; // Mark as a new border
        newBorders.push(horizBorder);
        
        // 2. Vertical segment (from intermediate point to p2)
        let vertBorder = new Borders.Sprite();
        vertBorder.x = p2.x;
        vertBorder.y = (midY + p2.y) / 2;
        vertBorder.w = 3;
        vertBorder.h = Math.abs(p2.y - midY) + 1; // Add 1 to ensure overlap
        vertBorder.color = "#000000";
        vertBorder.collider = 'k';
        vertBorder.newBorder = true; // Mark as a new border
        newBorders.push(vertBorder);
      }
    }
    
    // Special handling for junctions
    createJunctionConnections(newBorders);
    
    // After creating all new borders, force sparx to adjust
    setTimeout(() => {
      repositionAllSparx();
    }, 100);
    
  } catch (error) {
    console.error("Error creating borders from polygon:", error);
  }
}
// New function to ensure junctions are properly connected
function createJunctionConnections(newBorders) {
  // Get all original borders
  const originalBorders = Borders.filter(b => b.isOriginalBorder);
  
  // For each new border, check if it nearly touches an original border
  for (let newBorder of newBorders) {
    for (let origBorder of originalBorders) {
      // Skip if orientations don't allow for a junction (both horizontal or both vertical)
      if ((newBorder.w >= newBorder.h && origBorder.w >= origBorder.h) ||
          (newBorder.w < newBorder.h && origBorder.w < origBorder.h)) {
        continue;
      }
      
      // Get endpoints of new border
      let newBorderPoints = [];
      if (newBorder.w >= newBorder.h) { // Horizontal
        newBorderPoints.push({x: newBorder.x - newBorder.w/2, y: newBorder.y});
        newBorderPoints.push({x: newBorder.x + newBorder.w/2, y: newBorder.y});
      } else { // Vertical
        newBorderPoints.push({x: newBorder.x, y: newBorder.y - newBorder.h/2});
        newBorderPoints.push({x: newBorder.x, y: newBorder.y + newBorder.h/2});
      }
      
      // Get endpoints of original border
      let origBorderPoints = [];
      if (origBorder.w >= origBorder.h) { // Horizontal
        origBorderPoints.push({x: origBorder.x - origBorder.w/2, y: origBorder.y});
        origBorderPoints.push({x: origBorder.x + origBorder.w/2, y: origBorder.y});
      } else { // Vertical
        origBorderPoints.push({x: origBorder.x, y: origBorder.y - origBorder.h/2});
        origBorderPoints.push({x: origBorder.x, y: origBorder.y + origBorder.h/2});
      }
      
      // Check for near-intersections
      for (let newPoint of newBorderPoints) {
        for (let origPoint of origBorderPoints) {
          const distance = dist(newPoint.x, newPoint.y, origPoint.x, origPoint.y);
          
          // If points are close but not exactly touching, create a connecting border
          if (distance > 1 && distance < 10) {
            // Create a small connecting border
            let connector = new Borders.Sprite();
            connector.x = (newPoint.x + origPoint.x) / 2;
            connector.y = (newPoint.y + origPoint.y) / 2;
            
            if (Math.abs(newPoint.x - origPoint.x) > Math.abs(newPoint.y - origPoint.y)) {
              // Horizontal connector
              connector.w = distance + 1;
              connector.h = 3;
            } else {
              // Vertical connector
              connector.w = 3;
              connector.h = distance + 1;
            }
            
            connector.color = "#000000";
            connector.collider = 'k';
            connector.isConnector = true; // Mark as a connector border
            
            console.log(`Created junction connector between borders`);
          }
        }
      }
    }
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
    console.log("Creating claimed area with optimized rectangular fill");
    
    // Identify if this polygon connects to a border
    const isLeftBorderTouch = polygon.some(p => Math.abs(p.x - (gameField.x - gameField.w/2)) < 5);
    const isRightBorderTouch = polygon.some(p => Math.abs(p.x - (gameField.x + gameField.w/2)) < 5);
    const isTopBorderTouch = polygon.some(p => Math.abs(p.y - (gameField.y - gameField.h/2)) < 5);
    const isBottomBorderTouch = polygon.some(p => Math.abs(p.y - (gameField.y + gameField.h/2)) < 5);
    
    // Calculate bounds of the polygon
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (let vertex of polygon) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    }
    
    // Get game field boundaries 
    const leftBoundary = gameField.x - gameField.w/2;
    const rightBoundary = gameField.x + gameField.w/2;
    const topBoundary = gameField.y - gameField.h/2;
    const bottomBoundary = gameField.y + gameField.h/2;
    
    // Expand to exactly meet the borders
    if (isLeftBorderTouch) {
      minX = leftBoundary;
    } else {
      minX = Math.max(Math.floor(minX), leftBoundary);
    }
    
    if (isRightBorderTouch) {
      maxX = rightBoundary;
    } else {
      maxX = Math.min(Math.ceil(maxX), rightBoundary);
    }
    
    if (isTopBorderTouch) {
      minY = topBoundary;
    } else {
      minY = Math.max(Math.floor(minY), topBoundary);
    }
    
    if (isBottomBorderTouch) {
      maxY = bottomBoundary;
    } else {
      maxY = Math.min(Math.ceil(maxY), bottomBoundary);
    }
    
    // Calculate width, height and center of the fill area
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = minX + width/2;
    const centerY = minY + height/2;
    
    // Skip if dimensions are too small
    if (width < 2 || height < 2) {
      console.log("Area too small, skipping fill");
      return false;
    }
    
    // Create fill sprite
    const fillSprite = new Sprite();
    fillSprite.x = centerX;
    fillSprite.y = centerY;
    
    // Set dimensions - ensure no gaps by adding 0.5 pixels to overlap with borders
    fillSprite.w = width + 0.5;
    fillSprite.h = height + 0.5;
    
    // Use a different color than the game field to ensure visibility
    let fillColor;
    do {
      fillColor = "#FF0000";
    } while (fillColor === gameField.color);
    
    fillSprite.color = fillColor;
    fillSprite.opacity = 0.75; // Semi-transparent
    fillSprite.layer = 1; // Lowest layer, behind everything
    fillSprite.collider = 'n'; // No collision
    
    // Store for tracking
    window.claimedSprites = window.claimedSprites || [];
    window.claimedSprites.push(fillSprite);
    
    // Create borders after the fill to ensure they're on top
    createBordersFromPolygon(polygon);
    
    // IMPORTANT: Better area percentage calculation
    // Use the actual rectangle area instead of polygon area for more accuracy
    const rectangleArea = width * height;
    const fieldArea = gameField.w * gameField.h;
    
    // Calculate percentage of the field that was claimed
    let areaPercentage = (rectangleArea / fieldArea) * 125;
    
    // Remove caps for testing (or keep reasonable caps if you prefer)
    // areaPercentage = Math.min(areaPercentage, 50); // Cap at 50% (adjust as needed)
    // areaPercentage = Math.max(areaPercentage, 1); // Min 1% (adjust as needed)
    
    console.log(`Rectangle dimensions: ${width} x ${height}`);
    console.log(`Rectangle area: ${rectangleArea}, Field area: ${fieldArea}`);
    console.log(`Area claimed: ${areaPercentage.toFixed(2)}%`);
    
    return areaPercentage;
    
  } catch (error) {
    console.error("Error filling claimed area:", error);
    return false;
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
// Determine which side of the game area was claimed
function determineClaimedSide(polygon) {
  if (!polygon || polygon.length < 3) return "unknown";
  
  // Just return "smaller" as default for now
  // This simplification helps avoid errors
  return "smaller";
}
function simplifyPolygon(vertices, tolerance) {
  if (vertices.length <= 3) return vertices;
  
  let result = [vertices[0]];
  
  for (let i = 1; i < vertices.length; i++) {
    const prev = result[result.length - 1];
    const current = vertices[i];
    
    // Skip points that are too close to previous point
    if (dist(prev.x, prev.y, current.x, current.y) <= tolerance) {
      continue;
    }
    
    // Special handling for points that are on same vertical/horizontal line
    if (result.length > 1) {
      const prevPrev = result[result.length - 2];
      
      // Check if three points are collinear (on same horizontal or vertical line)
      if ((Math.abs(prev.y - prevPrev.y) < tolerance && Math.abs(current.y - prev.y) < tolerance) ||
          (Math.abs(prev.x - prevPrev.x) < tolerance && Math.abs(current.x - prev.x) < tolerance)) {
        // Replace middle point with current point
        result.pop();
      }
    }
    
    result.push(current);
  }
  
  // Ensure it's still a closed polygon
  const first = result[0];
  const last = result[result.length - 1];
  
  if (dist(first.x, first.y, last.x, last.y) > tolerance) {
    result.push({x: first.x, y: first.y});
  }
  
  return result;
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
  let exactPoint = null;
  
  for (let border of Borders) {
    let distance, point;
    
    // For horizontal borders
    if (border.w >= border.h) {
      distance = Math.abs(player.y - border.y);
      
      if (distance < minDistance && 
          player.x >= border.x - border.w/2 - 5 && 
          player.x <= border.x + border.w/2 + 5) {
        
        minDistance = distance;
        closestBorder = border;
        
        // Calculate exact intersection
        point = createVector(
          Math.max(Math.min(player.x, border.x + border.w/2), border.x - border.w/2),
          border.y
        );
        exactPoint = point;
      }
    } 
    // For vertical borders
    else {
      distance = Math.abs(player.x - border.x);
      
      if (distance < minDistance &&
          player.y >= border.y - border.h/2 - 5 && 
          player.y <= border.y + border.h/2 + 5) {
        
        minDistance = distance;
        closestBorder = border;
        
        // Calculate exact intersection
        point = createVector(
          border.x,
          Math.max(Math.min(player.y, border.y + border.h/2), border.y - border.h/2)
        );
        exactPoint = point;
      }
    }
  }
  
  // If we found an exact intersection point, use it
  if (exactPoint) {
    return exactPoint;
  }
  
  // Otherwise use a more general approach
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
// Flash the game field for visual feedback
function flashGameField() {
  let originalColor = gameField.color;
  gameField.color = "#FFFFFF";
  
  setTimeout(() => {
    gameField.color = originalColor;
  }, 200);
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
function isPointOnBorder(point, border, tolerance = 3) {
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
function getAllBorderCorners() {
  const corners = [];
  
  // First, get all border endpoints
  for (let border of Borders) {
    if (border.w >= border.h) { // Horizontal
      corners.push({x: border.x - border.w/2, y: border.y});
      corners.push({x: border.x + border.w/2, y: border.y});
    } else { // Vertical
      corners.push({x: border.x, y: border.y - border.h/2});
      corners.push({x: border.x, y: border.y + border.h/2});
    }
  }
  
  // Then, find all intersections between borders
  for (let i = 0; i < Borders.length; i++) {
    for (let j = i + 1; j < Borders.length; j++) {
      const border1 = Borders[i];
      const border2 = Borders[j];
      
      // Only check perpendicular borders (horizontal + vertical)
      if ((border1.w >= border1.h && border2.w < border2.h) || 
          (border1.w < border1.h && border2.w >= border2.h)) {
        const intersection = findBorderIntersectionPoint(border1, border2);
        if (intersection) {
          corners.push(intersection);
        }
      }
    }
  }
  
  // Deduplicate corners that are very close to each other
  const uniqueCorners = [];
  for (let i = 0; i < corners.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < uniqueCorners.length; j++) {
      if (dist(corners[i].x, corners[i].y, uniqueCorners[j].x, uniqueCorners[j].y) < 5) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      uniqueCorners.push(corners[i]);
    }
  }
  
  return uniqueCorners;
}
// Find the intersection point between two perpendicular borders
function findBorderIntersectionPoint(border1, border2) {
  // Ensure one is horizontal and one is vertical
  let horizontal, vertical;
  if (border1.w >= border1.h && border2.w < border2.h) {
    horizontal = border1;
    vertical = border2;
  } else if (border1.w < border1.h && border2.w >= border2.h) {
    horizontal = border2;
    vertical = border1;
  } else {
    return null; // Not perpendicular
  }
  
  // Check if borders actually intersect
  const horizontalLeft = horizontal.x - horizontal.w/2;
  const horizontalRight = horizontal.x + horizontal.w/2;
  const verticalTop = vertical.y - vertical.h/2;
  const verticalBottom = vertical.y + vertical.h/2;
  
  if (vertical.x >= horizontalLeft && vertical.x <= horizontalRight &&
      horizontal.y >= verticalTop && horizontal.y <= verticalBottom) {
    // Borders intersect, return the intersection point
    return {x: vertical.x, y: horizontal.y};
  }
  
  return null; // No intersection
}
function findConnectedBorders(corner, currentBorder) {
  const connectedBorders = [];
  
  // Use a larger tolerance at junctions between new and original borders
  let connectionTolerance = 8;
  // If current border is original or we're connecting to original, increase tolerance
  if (currentBorder && currentBorder.isOriginalBorder) {
    connectionTolerance = 12; // More forgiving when involving original borders
  }
  
  for (let border of Borders) {
    // Skip the current border
    if (border === currentBorder) continue;
    
    // Use even larger tolerance when connecting between original and new borders
    let checkTolerance = connectionTolerance;
    if ((currentBorder && currentBorder.isOriginalBorder && !border.isOriginalBorder) ||
        (border.isOriginalBorder && currentBorder && !currentBorder.isOriginalBorder)) {
      checkTolerance = 15; // Extra forgiveness at new-to-original junctions
    }
    
    // Check if this border connects to the corner
    if (border.w >= border.h) { // Horizontal border
      const leftPoint = {x: border.x - border.w/2, y: border.y};
      const rightPoint = {x: border.x + border.w/2, y: border.y};
      
      // Check if either end is close to the corner
      if (dist(corner.x, corner.y, leftPoint.x, leftPoint.y) < checkTolerance ||
          dist(corner.x, corner.y, rightPoint.x, rightPoint.y) < checkTolerance ||
          (Math.abs(corner.y - border.y) < checkTolerance && 
           corner.x >= leftPoint.x - checkTolerance && 
           corner.x <= rightPoint.x + checkTolerance)) {
        connectedBorders.push(border);
      }
    } else { // Vertical border
      const topPoint = {x: border.x, y: border.y - border.h/2};
      const bottomPoint = {x: border.x, y: border.y + border.h/2};
      
      // Check if either end is close to the corner
      if (dist(corner.x, corner.y, topPoint.x, topPoint.y) < checkTolerance ||
          dist(corner.x, corner.y, bottomPoint.x, bottomPoint.y) < checkTolerance ||
          (Math.abs(corner.x - border.x) < checkTolerance && 
           corner.y >= topPoint.y - checkTolerance && 
           corner.y <= bottomPoint.y + checkTolerance)) {
        connectedBorders.push(border);
      }
    }
  }
  
  return connectedBorders;
}
function initOriginalBorders() {
  // Mark the original borders specially
  for (let i = 0; i < 4; i++) {
    if (Borders[i]) {
      Borders[i].isOriginalBorder = true;
    }
  }
}
function markOriginalBorders() {
  for (let i = 0; i < 4; i++) {
    if (Borders[i]) {
      Borders[i].isOriginalBorder = true;
    }
  }
}
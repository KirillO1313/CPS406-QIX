let player;
let gameField;
let qix;

let color;
let pallete = ["#D88C9A", "#B6EFD4", "#fdffb6", "#8E7DBE", "#A0CCDA"];

let PspeedX = 0;
let PspeedY = 0;

function setup() {
	new Canvas(windowWidth, windowHeight);
	displayMode(CENTER);
	textAlign(CENTER);
	world.gravity.y = 0;
	world.gravity.x = 0;

	gameField = new Sprite();
		gameField.x = windowWidth/2;
		gameField.y = windowHeight/2;
		gameField.w = windowHeight - (windowHeight/8);
		gameField.h = windowHeight - (windowHeight/8);
		gameField.color = random(pallete);

	player = new Sprite();
		player.diameter = 25;
		player.x = windowWidth/2;
		player.y = gameField.y + gameField.h/2;
		player.velocity.x = 0;
		player.velocity.y = 0;
		player.color = "#8CB369"; 
		player.collider = 'k';

	qix = new Sprite();
		qix.x = gameField.x;
		qix.y = gameField.y - gameField.h/2;
		qix.w = 25;
		qix.h = 25;
		


	player.overlaps(gameField);
}

function draw() {
	background('#e3d5ca');

	player.velocity.x = PspeedX;
	player.velocity.y = PspeedY;

	player.x = constrain(player.x, 	windowWidth/2 - gameField.w/2, 	windowWidth/2 + gameField.w/2);
	player.y = constrain(player.y, 	windowHeight/2 - gameField.h/2, 	windowHeight/2 + gameField.h/2)
	


	//---Directions/Info---
		push();
			textSize(20);
			text('↑', width * 0.9, height -(height * 0.3));
			text('← move →', width * 0.9, height -(height * 0.2));
			text('↓', width * 0.9, height -(height * 0.1));
		pop();
}

function keyPressed() {   
	if (keyIsDown(40) === true ) { //DOWN ARROW KEY
		PspeedY = 3;
	}
	else if (keyIsDown(38) === true ) { //UP ARROW KEY 
		PspeedY = -3;
	}

	if (keyIsDown(39) === true ) { //RIGHT ARROW KEY
		PspeedX = 3;            
	} 
	else if (keyIsDown(37) === true ) { //LEFT ARROW KEY 
		PspeedX = -3;                
	} 
  }
  
  function keyReleased() {   
	if (keyCode === 40 || keyCode === 38) { //Player releasses 'downarrow' or 'uparrow' to 
		PspeedY = 0;						//stop moving; temporary, as this is against reqs
	}
	if (keyCode === 39 || keyCode === 37) { //Player releasses 'leftarrow' or 'rightarrow' to 
		PspeedX = 0;						//stop moving; temporary, as this is against reqs
	}
	
  }
// Creating p5() so that p5 functions can be used before setup.
new p5();
const FLOOR_HEIGHT = 50;
const socket = io("ws://localhost:8080");

// Colors
const BG_COLOR = color(150, 150, 255);
const BG_IMAGE = loadImage("p5-game/background.jpg");
let bgBlendValue = 0;
const GRASS_COLOR = color(77, 205, 25);
const GRASS_TOP_COLOR = color(54, 178, 3);
const PLAYER_COLOR = color(255)
const ENEMY_COLOR = color(255)
const TEXT_COLOR = color(255);
const VERY_SCARY_TEXT_COLOR = color(255, 0, 0);

// State
let gameState = "main-menu";
let challengeMode = false;
let immortal = false;

// Score keeping
let score = 0;
let highscore = 0;

// Entites in the game
let player;
let enemies = [];
let enemiesToBeDespawned = 0;
let spawnMultiplier;

// Important resources
const PIXEL_FONT = loadFont("p5-game/PixelEmulator-xq08.ttf")
const DINO_IMAGE = loadImage("p5-game/dino.png")
const ENEMY_IMAGE = loadImage("p5-game/gigachad.jpg")

function setup() {
  createCanvas(600, 400);
  drawingContext.imageSmoothingEnabled = false;
  textFont(PIXEL_FONT);

  // Change background based on value of potentiometer
  socket.on("background_change", (value) => {
    bgBlendValue = value / 4 - 50
  })
  // Jump or start a new game when the button is pressed on the Arduino
  socket.on("input_jump", () => {
    switch (gameState) {
      case "game":
        player.jump();
        break;
      case "main-menu":
        setupGame();
        break;
    }
  })
  // Sent right after the client connects. Meant to store highscore between client reloads.
  socket.on("current_highscore", current_highscore => {
    highscore = current_highscore;
  });
}

// Runs every frame.
function draw() {
  switch (gameState) {
    case "game":
      runGame();
      break;
    case "main-menu":
      runMenu();
      break;
    case "dead-screen":
      runDeadScreen()
      break;
  }
}
function setupGame() {
  // Configuring the game
  gameState = "game";
  score = 0;

  // Resetting enemies and the player
  spawnMultiplier = 1.3
  player = new Player(20, 20, 50, 50);
  enemies = [];
  enemiesToBeDespawned = 0;

  socket.emit("play_music", "mario")

  spawnEnemy();
}
// Called every frame while gameState == "game"
function runGame() {
  score++;

  drawEnvironment();

  // Updating and drawing all the enemies
  enemies.forEach(enemy => {
    enemy.update();
    enemy.draw();
  })

  // Updating and drawing the player
  player.update();
  player.draw();

  // Check for collisions between the player and the leftmost enemy.
  // All other enemies are not checked, as the player is permanently on the left side of the screen and this saves performance.
  player.checkCollision();
  despawnEnemies();

  // Displaying score in the top-left part of the screen.
  textAlign(LEFT);
  textSize(16);
  text("Score: " + score, 10, 10);
}
function runMenu() {
  // Drawing the background and configuring text styling
  background(0)
  textAlign(CENTER, CENTER);
  fill((challengeMode) ? VERY_SCARY_TEXT_COLOR : TEXT_COLOR);
  
  // Title
  textSize(32);
  text("ArDino run", width / 2, height / 5);

  // Instructions on how to play
  textSize(24);
  text("Press the button & don't die!", width / 2, height / 4 * 3);

  // Challenge mode
  textSize(16);
  text("Press C for challenge mode", width / 2, height / 4 * 3.5);

  // Dino graphic
  imageMode(CENTER);
  image(DINO_IMAGE, width / 2, height / 2, 150, 150);
}
function runDeadScreen() {
  // Drawing the background and configuring text styling
  background(0)
  textAlign(CENTER, CENTER);
  fill((challengeMode) ? VERY_SCARY_TEXT_COLOR : TEXT_COLOR);

  // Title
  textSize(32);
  text("You died!", width / 2, height / 4);

  // Score display
  textSize(24);
  text(`Your score: ${score}\nHighscore: ${highscore}`, width / 2, height / 2);
  
  // Instructions
  textSize(24);
  text("Press the button & don't die!", width / 2, height / 4 * 3);
}
// Registering player inputs
function keyPressed() {
  // 'I' is pressed. Player becomes immortal
  if (keyCode == 73) {
    immortal = !immortal;
  }
  // 'C' is pressed. Toggle challenge mode and send to server.
  if (keyCode == 67) {
    if (!challengeMode) {
      immortal = false;
      socket.emit("challenge_mode", "start_challenge");
      challengeMode = true;
    } else {
      socket.emit("challenge_mode", "stop");
      challengeMode = false;
    }
  }
  // Handling all the possible gamestates.
  switch (gameState) {
    case "game":
      if (keyCode == UP_ARROW || keyCode == 87 /*w*/ || keyCode == 32 /* space */) {
        player.jump();
      }
      break;
    // Code below works for 'main-menu' and 'dead-screen'.
    case "main-menu":
    case "dead-screen":
      // Space is pressed. Start game.
      if (keyCode == 32) {
        setupGame()
      }
      break;
  }
}
function drawEnvironment() {
  // Drawing the sky
  background(BG_COLOR);
  tint(255, bgBlendValue);
  image(BG_IMAGE, 0, 0);
  tint(255, 255);

  // Drawing the ground.
  strokeWeight(0);
  fill(GRASS_COLOR);
  rect(0, height - FLOOR_HEIGHT, width, FLOOR_HEIGHT);

  strokeWeight(5);
  stroke(GRASS_TOP_COLOR)
  line(0, height - FLOOR_HEIGHT, width, height - FLOOR_HEIGHT);
}
// Delete the enemies[0] (leftmost enemy) x amount of times. Counter is increased when an enemy goes out of view so it needs to be removed.
function despawnEnemies() {
  for (let i = 0; i < enemiesToBeDespawned; i++) {
    enemies.splice(0, 1)
  }
  enemiesToBeDespawned = 0;
}
function spawnEnemy() {
  if (gameState != "game") return;
  enemies.push(new Enemy(85, 85))
  let randWait = Math.floor((Math.random() * (1100 - 700 + 1) + 700)) * spawnMultiplier;
  // Using setTimeout instead of setInterval so the delay can change everytime an enemy spawns.
  // This is nice because it allows for random delays, and a delay that gets shorter as the game progresses to add challenge.
  // Recursion :O
  setTimeout(spawnEnemy, randWait);
}
// The player is dead. L
function dieLmaoUBad() {
  socket.emit("play_music", "dead");
  if (score > highscore) {
    highscore = score;
    socket.emit("new_highscore", highscore);
  }
  gameState = "dead-screen";
}
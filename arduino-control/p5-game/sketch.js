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

  socket.on("background_change", (value) => {
    //bgBlendValue = (value > 200) ? value / 4 : 0;
    bgBlendValue = value / 4 - 50
  })
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
  socket.on("current_highscore", current_highscore => {
    console.log("Received highscore from server: " + current_highscore)
    highscore = current_highscore;
  });
}

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
  gameState = "game";
  spawnMultiplier = 1.3
  player = new Player(20, 20, 50, 50);
  enemies = [];
  enemiesToBeDespawned = 0;

  score = 0;

  socket.emit("play_music", "mario")

  //enemySpawnInterval = setInterval(spawnEnemy, 1000)
  spawnEnemy();
}
function runGame() {
  score++;
  background(BG_COLOR);
  //blend(BG_IMAGE, 0, 0, 566, 701, 0, 0, 566, 701, ADD);
  tint(255, bgBlendValue);
  image(BG_IMAGE, 0, 0);
  tint(255, 255);
  drawEnvironment();


  enemies.forEach(enemy => {
    enemy.update();
    enemy.draw();
  })

  player.draw();
  player.update();

  player.checkCollision();
  despawnEnemies();

  textAlign(LEFT);
  textSize(16);
  text("Score: " + score, 10, 10);
}
function runMenu() {
  background(0)
  textAlign(CENTER, CENTER);
  fill(255);

  textSize(32);
  text("Ardino run", width / 2, height / 5);

  textSize(24);
  text("Press the button & don't die!", width / 2, height / 4 * 3);

  textSize(16);
  text("Press C for challenge mode", width / 2, height / 4 * 3.5);

  imageMode(CENTER);
  image(DINO_IMAGE, width / 2, height / 2, 150, 150);
}
function runDeadScreen() {
  background(0)
  textAlign(CENTER, CENTER);
  textSize(32);
  text("You died!", width / 2, height / 4);

  textSize(24);
  text(`Your score: ${score}\nHighscore: ${highscore}`, width / 2, height / 2);
  
  textSize(24);
  text("Press the button & don't die!", width / 2, height / 4 * 3);

}
function keyPressed() {
  if (keyCode == 73) {
    immortal = !immortal;
  }
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
  switch (gameState) {
    case "game":
      if (keyCode == UP_ARROW || keyCode == 87 /*w*/ || keyCode == 32 /* space */) {
        player.jump();
      }
      break;
    case "main-menu":
    case "dead-screen":
      if (keyCode == 32) {
        setupGame()
      }
      break;
  }
}
function drawEnvironment() {
  // Drawing the ground.
  strokeWeight(0);
  fill(GRASS_COLOR);
  rect(0, height - FLOOR_HEIGHT, width, FLOOR_HEIGHT);

  strokeWeight(5);
  stroke(GRASS_TOP_COLOR)
  line(0, height - FLOOR_HEIGHT, width, height - FLOOR_HEIGHT);
}
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
  setTimeout(spawnEnemy, randWait);
}
function dieLmaoUBad() {
  socket.emit("play_music", "dead");
  if (score > highscore) {
    highscore = score;
    socket.emit("new_highscore", highscore);
  }
  gameState = "dead-screen";
}
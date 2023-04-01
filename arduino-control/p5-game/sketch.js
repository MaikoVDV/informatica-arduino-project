// Creating p5() so that p5 functions can be used before setup.
new p5();
const FLOOR_HEIGHT = 50;
const socket = io("ws://localhost:8080");

// Colors
const SKY_COLOR = color(150, 150, 255);
const GRASS_COLOR = color(77, 205, 25);
const GRASS_TOP_COLOR = color(54, 178, 3);
const PLAYER_COLOR = color(255)
const ENEMY_COLOR = color(255)


let gameState = "main-menu";

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
  console.log("Created p5.js sketch.");
  textFont(PIXEL_FONT);
}

function draw() {
  switch (gameState) {
    case "game":
      runGame();
      break;
    case "main-menu":
      runMenu();
      break;
  }
}
function setupGame() {
  gameState = "game";
  spawnMultiplier = 1.3
  player = new Player(20, 20, 50, 50);
  enemies = [];
  enemiesToBeDespawned = 0;

  //enemySpawnInterval = setInterval(spawnEnemy, 1000)
  spawnEnemy();

}
function runGame() {
  background(SKY_COLOR);
  drawEnvironment();


  enemies.forEach(enemy => {
    enemy.update();
    enemy.draw();
  })

  player.draw();
  player.update();

  player.checkCollision();
  despawnEnemies();
}
function runMenu() {
  background(0)
  textAlign(CENTER, CENTER);
  fill(255);

  textSize(32);
  text("Ardino run", width / 2, height / 4);

  textSize(24);
  text("Press space & don't die", width / 2, height / 4 * 3);

  imageMode(CENTER);
  image(DINO_IMAGE, width / 2, height / 2, 150, 150);
}
function keyPressed() {
  switch (gameState) {
    case "game":
      if (keyCode == UP_ARROW || keyCode == 87 /*w*/ || keyCode == 32 /* space */) {
        player.jump();
      }
      break;
    case "main-menu":
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
  enemies.push(new Enemy(100, 100))
  let randWait = Math.floor((Math.random() * (1100 - 700 + 1) + 700)) * spawnMultiplier;
  setTimeout(spawnEnemy, randWait);
}
function dieLmaoUBad() {
  gameState = "main-menu";
}
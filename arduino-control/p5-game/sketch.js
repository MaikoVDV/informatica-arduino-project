// Creating p5() so that p5 functions can be used before setup.
new p5();
const FLOOR_HEIGHT = 50;

// Colors
const SKY_COLOR = color(150, 150, 255);
const GRASS_COLOR = color(77, 205, 25);
const GRASS_TOP_COLOR = color(54, 178, 3);
const PLAYER_COLOR = color(255)

let player;
let enemies = [];
let enemiesToBeDespawned = 0;

function setup() {
  createCanvas(600, 400);
  console.log("Created p5.js sketch.");
  player = new Player(20, 20, 50, 50);

  setInterval(spawnEnemy, 1000)
}

function draw() {
  background(SKY_COLOR);
  drawEnvironment();

  player.draw();
  player.update();

  enemies.forEach(enemy => {
    enemy.update();
    enemy.draw();
  })
  despawnEnemies();
}
function keyPressed() {
  if (keyCode == UP_ARROW || keyCode == 87 /*w*/ || keyCode == 32 /* space */) {
    player.jump();
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
  enemies.push(new Enemy(50, 50))
}

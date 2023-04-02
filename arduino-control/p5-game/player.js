// Making my main-man Newton proud
const GRAVITY = 1;
const MAX_GRAVITY = 50;

class Player {
  // Contructing the player
  constructor(x, y, sizeX, sizeY) {
    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.velY = 0;
    this.jumpForce = 20;
    this.onFloor = false;
  }

  update() {
    // Adding downward force on the velocity
    this.velY += GRAVITY;
    if (this.velY > MAX_GRAVITY) this.velY = MAX_GRAVITY;
    // Updating position with velocity
    this.y += this.velY;
    // Checking for collision with the ground
    if (this.y + this.sizeY > height - FLOOR_HEIGHT) {
      this.y = height - FLOOR_HEIGHT - this.sizeY;
      this.velY = 0;
      this.onFloor = true;
    } else {
      this.onFloor = false;
    }
  }
  jump() {
    if (this.onFloor) {
      this.velY = -this.jumpForce;
      socket.emit("led_toggle", "") // Not currently used by the server.
    }
  }
  draw() {
    strokeWeight(0);
    fill(PLAYER_COLOR);
    //rect(this.x, this.y, this.sizeX, this.sizeY);
    imageMode(CORNER);
    image(DINO_IMAGE, this.x, this.y, this.sizeX, this.sizeY);
  }
  checkCollision() {
    if (immortal) return; // Do nothing if the player can't die
    let firstEnemy = enemies[0]; // Getting the leftmost enemy
    if (!firstEnemy) return; // Exit if there are no enemies. Same as firstEnemy == undefined.

    // Checking for intersection between squares, while accounting for very weird p5.js coordinate system
    if (this.x + this.sizeX > firstEnemy.x && this.x < firstEnemy.x + firstEnemy.sizeX) {
      if (this.y + this.sizeY > firstEnemy.y && this.y < firstEnemy.y + firstEnemy.sizeY) {
        // If the player collides with the leftmost enemy, it is gameover.
        dieLmaoUBad();
      }
    }
  }
}

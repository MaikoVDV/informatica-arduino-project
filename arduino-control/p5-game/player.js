const GRAVITY = 1;
const MAX_GRAVITY = 50;

class Player {
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
    this.velY += GRAVITY;
    if (this.velY > MAX_GRAVITY) this.velY = MAX_GRAVITY;
    this.y += this.velY;
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
      // fetch("http://localhost:3000/toggle").then((res, err) => {
      // })
      socket.emit("led_toggle", "blah")
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
    let firstEnemy = enemies[0];
    if (!firstEnemy) return; // Exit if there are no enemies.
    if (this.x + this.sizeX > firstEnemy.x && this.x < firstEnemy.x + firstEnemy.sizeX) {
      if (this.y + this.sizeY > firstEnemy.y && this.y < firstEnemy.y + firstEnemy.sizeY) {
        dieLmaoUBad();
      }
    }
  }
}

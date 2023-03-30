class Enemy {
  constructor(sizeX, sizeY) {
    this.x = width; // Spawn at edge of screen
    this.y = height - FLOOR_HEIGHT - sizeY;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
  }
  update() {
    this.x -= 10;
    if (this.x + this.sizeX <= 0) {
      // Enemy is off screen. Needs to be removed.
      enemiesToBeDespawned++;
    }
  }
  draw() {
    strokeWeight(0);
    fill(ENEMY_COLOR);  
    rect(this.x, this.y, this.sizeX, this.sizeY)
  }
}

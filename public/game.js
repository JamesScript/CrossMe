let player;
let opponents = [];

function setup() {
  const gameContainer = $("#gameContainer")[0];
  const smallerDim = gameContainer.clientWidth < gameContainer.clientHeight ? gameContainer.clientWidth : gameContainer.clientHeight;
  const cnv = createCanvas(smallerDim, smallerDim);
  cnv.parent("gameContainer");
  player = new Player(100, 100);
  colorMode(HSB);
  noStroke();
  // frameRate(20);
}

function draw() {
  // Send the coordinates of player as proportion of width and height, as different players will have different sizes
  background(0);
  player.show();
  player.update();
  let infoPackage = {
    x: player.x / width,
    y: player.y / height,
    hue: player.hue,
    id: id,
    dir: player.dir,
    bullets: [] 
  };
  for (let i = 0; i < player.bullets.length; i++) {
    infoPackage.bullets.push([player.bullets[i].x / width, player.bullets[i].y / height]);
  }
  for (let i = 0; i < opponents.length; i++) {
    if (opponents[i].id !== id) {
      fill(opponents[i].hue, 100, 100);
      rect(opponents[i].x * width, opponents[i].y * height, player.w, player.h);
      for (let j = 0; j < opponents[i].bullets.length; j++) {
        fill(0, 100, 100);
        let bulletX = opponents[i].bullets[j][0] * width;
        let bulletY = opponents[i].bullets[j][1] * height;
        ellipse(bulletX, bulletY, width * 0.01);
        let playerMidX = player.x + player.w / 2;
        let playerMidY = player.y + player.h / 2;
        if (dist(bulletX, bulletY, playerMidX, playerMidY) < player.w) {
          socket.emit('chat message', name + ": OUCH!");
        }
      }
    }
  }
  socket.emit('player coordinates', JSON.stringify(infoPackage));
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = width * 0.03;
    this.h = height * 0.03;
    this.hue = floor(random(360));
    this.bullets = [];
    this.dir = 0; // 0 UP 1 RIGHT 2 DOWN 3 LEFT
    this.canShoot = true;
  }
  
  show() {
    for (let i = 0; i < this.bullets.length; i++) {
        this.bullets[i].show();
        this.bullets[i].update();
        if (this.bullets[i].offScreen()) {
            this.bullets.splice(i, 1);
        }
    }
    fill(this.hue, 100, 100);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    const eyeSize = width * 0.007;
    ellipse(this.x + this.w * (this.dir === 1 ? 0.75 : 0.25), this.y + this.h * (this.dir === 2 ? 0.75 : 0.25), eyeSize);
    ellipse(this.x + this.w * (this.dir === 3 ? 0.25 : 0.75), this.y + this.h * (this.dir === 0 ? 0.25 : 0.75), eyeSize);

  }
  
  update() {
    const speed = width * 0.01;
    if (keyIsDown(37)) {
      this.x -= speed;
      this.dir = 3;
    } 
    else if (keyIsDown(39)) {
      this.x += speed;
      this.dir = 1;
    }
    else if (keyIsDown(38)) {
      this.y -= speed;
      this.dir = 0;
    }
    else if (keyIsDown(40)) {
      this.y += speed;
      this.dir = 2;
    }
    if (keyIsDown(32) && this.canShoot) {
      const self = this;
      this.bullets.push(new Bullet(this.x + this.w / 2, this.y + this.h / 2, this.dir));
      this.canShoot = false;
      setTimeout(function() {
        self.canShoot = true;
      }, 200);
    }
    this.x = constrain(this.x, 0, width - this.w);
    this.y = constrain(this.y, 0, height - this.h);
  }
}

class Bullet {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
  }
  
  show() {
    fill(0, 100, 100);
    ellipse(this.x, this.y, width * 0.01);
  }
  
  update() {
    const speed = width * 0.015;
    let xVels = [0, speed, 0, -speed];
    let yVels = [-speed, 0, speed, 0];
    this.x += xVels[this.dir];
    this.y += yVels[this.dir];
  }
  
  offScreen() {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }
}
let player;

function setup() {
  const gameContainer = $("#gameContainer")[0];
  const smallerDim = gameContainer.clientWidth < gameContainer.clientHeight ? gameContainer.clientWidth : gameContainer.clientHeight;
  const cnv = createCanvas(smallerDim, smallerDim);
  cnv.parent("gameContainer");
  player = new Player(100, 100);
  // frameRate(20);
}

function draw() {
  background(0);
  player.show();
  player.update();
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = width * 0.03;
    this.h = height * 0.03;
  }
  
  show() {
    fill(255);
    rect(this.x, this.y, this.w, this.h);
  }
  
  update() {
    const speed = width * 0.01;
    if (keyIsDown(37)) {
      this.x -= speed;
    } 
    else if (keyIsDown(39)) {
      this.x += speed;
    }
    else if (keyIsDown(38)) {
      this.y -= speed;
    }
    else if (keyIsDown(40)) {
      this.y += speed;
    }
    this.x = constrain(this.x, 0, width - this.w);
    this.y = constrain(this.y, 0, height - this.h);
  }
}
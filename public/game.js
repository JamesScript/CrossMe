let player;
let opponents = [];
let walls = [];
let powerUp;
let inGame = false;
let canvasFixed = true;

function setup() {
    const gameContainer = $("#gameContainer")[0];
    const smallerDim = gameContainer.clientWidth < gameContainer.clientHeight ? gameContainer.clientWidth : gameContainer.clientHeight;
    const cnv = createCanvas(smallerDim, smallerDim);
    cnv.parent("gameContainer");
    colorMode(HSB);
    noStroke();
    cornersLevel();
    player = new Player(0, 0);
    player.findStartingPosition();
    socket.emit('get power up details');
}

function draw() {
    if (inGame) {
        // Send the coordinates of player as proportion of width and height, as different players will have different sizes
        background(0);
        if (player.tripping) {
            let blur = sin(frameCount / 8) * 2 + 3;
            $("canvas").css({filter: `blur(${blur}px)`, transform: `scale(${1 - blur / 50})`});
            translate(sin(frameCount / 2) * width * 0.01, 0);
            canvasFixed = false;
        } else if (!canvasFixed) {
            $("canvas").css({filter: `blur(0px)`, transform: `scale(1)`});
            canvasFixed = true;
        }
        // All bullets handled in player.show()
        if (player.alive) {
            player.show();
            player.update();
        }
        if (powerUp) {
            powerUp.show();
            powerUp.update();
        }
        for (let i = 0; i < walls.length; i++) {
            walls[i].show();
            walls[i].update();
        }
        renderOpponents();
        let infoPackage = {
            x: player.x / width,
            y: player.y / height,
            hue: player.hue,
            name: name,
            id: id,
            dir: player.dir,
            invincible: player.invincible,
            shielded: player.shielded,
            alive: player.alive,
            bullets: []
        };
        for (let i = 0; i < player.bullets.length; i++) {
            infoPackage.bullets.push([player.bullets[i].x / width, player.bullets[i].y / height]);
        }
        socket.emit('player coordinates', JSON.stringify(infoPackage));
    }
}

function windowResized() {
    let playerPropX = player.x / width;
    let playerPropY = player.y / height;
    const gameContainer = $("#gameContainer")[0];
    const smallerDim = gameContainer.clientWidth < gameContainer.clientHeight ? gameContainer.clientWidth : gameContainer.clientHeight;
    resizeCanvas(smallerDim, smallerDim);
    walls = [];
    player.x = playerPropX * width;
    player.y = playerPropY * height;
    player.w = powerUp.w = width * 0.03;
    player.h = powerUp.h = height * 0.03;
    cornersLevel();
}

function collides(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function renderHP() {
    $("#hpNumbers").text(`${player.hp} / 100`);
    $("#hpBarRed").css({width: `${player.hp}%`});
}

function gameMessage(msg) {
    socket.emit('game message', msg);
}

function trip(x, y) {
    push();
    rectMode(CENTER);
    translate(x + player.w/2, y + player.h/2);
    noFill();
    const count = 20;
    const frameGap = 20;
    const frameFr = frameCount % frameGap;
    const gap = width * 0.01;
    const inc = (frameFr / frameGap) * gap;
    for (let i = 0; i < count; i++) {
        let hue = map(frameFr, 0, frameGap, 0, 360);
        let alpha = map(i, 0, count, 1, 0);
        stroke((hue + i * 50) % 360, 100, 100, alpha);
        rect(0, 0, i * gap + inc, i * gap + inc);
    }
    pop();
    // let rSize = (frameCount % 5) * width * 0.01;
    // fill(random(360), 100, 100);
    // rect(this.x - rSize, this.y - rSize, this.w + rSize*2, this.h + rSize*2);
}
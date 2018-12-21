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
        invincible: player.invincible,
        bullets: []
    };
    for (let i = 0; i < player.bullets.length; i++) {
        infoPackage.bullets.push([player.bullets[i].x / width, player.bullets[i].y / height]);
    }
    for (let i = 0; i < opponents.length; i++) {
        if (opponents[i].id !== id) {
            if (!opponents[i].invincible || (opponents[i].invincible && frameCount % 2 === 0)) {
                fill(opponents[i].hue, 100, 100);
                rect(opponents[i].x * width, opponents[i].y * height, player.w, player.h);
                fill(0);
                const eyeSize = width * 0.007;
                ellipse(opponents[i].x * width + player.w * (opponents[i].dir === 1 ? 0.75 : 0.25), opponents[i].y * height + player.h * (opponents[i].dir === 2 ? 0.75 : 0.25), eyeSize);
                ellipse(opponents[i].x * width + player.w * (opponents[i].dir === 3 ? 0.25 : 0.75), opponents[i].y * height + player.h * (opponents[i].dir === 0 ? 0.25 : 0.75), eyeSize);
            }
            for (let j = 0; j < opponents[i].bullets.length; j++) {
                fill(0, 100, 100);
                let bulletX = opponents[i].bullets[j][0] * width;
                let bulletY = opponents[i].bullets[j][1] * height;
                ellipse(bulletX, bulletY, width * 0.01);
                let playerMidX = player.x + player.w / 2;
                let playerMidY = player.y + player.h / 2;
                let currentBullet = {x: bulletX, y: bulletY, w: width * 0.01, h: height * 0.01};
                if (collides(currentBullet, player) && !player.invincible) {
                    socket.emit('chat message', name + ": OUCH!");
                    socket.emit('splice bullet', JSON.stringify({id: opponents[i].id, bulletIndex: j}));
                    player.temporaryInvincibility(300);
                }
            }
        }
    }
    socket.emit('player coordinates', JSON.stringify(infoPackage));
}

function collides(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
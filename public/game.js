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
    frameRate(5);
    colorMode(HSB);
    noStroke();
    player = new Player(0, 0);
    socket.emit('update rooms');
    // jumpIn();
}

// TESTING PURPOSES!
function jumpIn() {
    name = "James";
    room = 261085;
    $("#enterName").hide();
    $("#lobby").hide();
    enterGame();
}

function draw() {
    // Do not draw anything to the canvas unless the user is not inside a room and active
    if (inGame) {
        background(0);
        // Visual effects of funky fungus
        if (player.tripping) {
            let blur = sin(frameCount / 8) * 2 + 3;
            $("canvas").css({filter: `blur(${blur}px)`, transform: `scale(${1 - blur / 50})`});
            translate(sin(frameCount / 2) * width * 0.01, 0);
            canvasFixed = false;
        } else if (!canvasFixed) {
            $("canvas").css({filter: `blur(0px)`, transform: `scale(1)`});
            canvasFixed = true;
        }
        // Player
        if (player.alive) {
            player.show();    // All bullets handled in player.show()
            player.update();
        }
        //Power Up
        if (powerUp) {
            powerUp.show();
            powerUp.update();
        }
        // Walls
        for (let i = 0; i < walls.length; i++) {
            walls[i].show();
        }
        for (let i = 0; i < walls.length; i++) {
            walls[i].update();
            if (walls[i].resetForLoop) {
                walls[i].resetForLoop = false;
                i = -1;
            }
        }
        // Render Opponents - function to render all other players is called here
        renderOpponents();
        updatePlayerDetails();
        // Update leader board every 10 frames
        if (frameCount % 10 === 0) {
            updateLeaderBoard();
        }
    }
}

function windowResized() {
    // Get coordinagtes of objects as proportions of height and width
    let playerPropX = player.x / width;
    let playerPropY = player.y / height;
    let powerUpPropX;
    let powerUpPropY;
    if (powerUp) {
        powerUpPropX = powerUp.x / width;
        powerUpPropY = powerUp.y / height;
    }
    const gameContainer = $("#gameContainer")[0];
    const smallerDim = gameContainer.clientWidth < gameContainer.clientHeight ? gameContainer.clientWidth : gameContainer.clientHeight;
    // Resize Canvas
    resizeCanvas(smallerDim, smallerDim);
    walls = [];
    // Relocate objects according to new width and height
    player.x = playerPropX * width;
    player.y = playerPropY * height;
    player.w = width * 0.03;
    player.h = height * 0.03;
    if (powerUp) {
        powerUp.x = powerUpPropX * width;
        powerUp.y = powerUpPropY * height;
        powerUp.w = width * 0.03;
        powerUp.h = height * 0.03;
    }
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
    const msgObject = {
        msg: msg,
        roomId: room
    };
    socket.emit('game message', JSON.stringify(msgObject));
}

// Visual effects of colours under each player
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
}

function enterGame() {
    inGame = true;
    updatePlayerDetails();
    socket.emit('update rooms');
    $("#messages").html("");
    $("#lobby").hide();
    // Build walls before finding starting position and getting power up - as these will need to be based on the walls
    walls = [];
    buildWalls(); // Request coordinates and dimensions from server
    player.findStartingPosition();
    getPowerUp();
}

function getPowerUp() {
    $.get("/powerUpDetails/"+room, function(data) {
        powerUp = new PowerUp(data.x, data.y, data.type, data.got);
    });
}

function updatePlayerDetails() {
    // Send the coordinates of player as proportion of width and height, as different players will have different sized canvases
    let infoPackage = {
        x: player.x / width,
        y: player.y / height,
        hue: player.hue,
        name: name,
        id: id,
        room: room,
        kills: player.kills,
        dir: player.dir,
        invincible: player.invincible,
        shielded: player.shielded,
        alive: player.alive,
        bullets: []
    };
    // Add bullets to the package to be sent to the server and other players
    for (let i = 0; i < player.bullets.length; i++) {
        infoPackage.bullets.push([player.bullets[i].x / width, player.bullets[i].y / height]);
    }
    $.get('/update/' + JSON.stringify(infoPackage), function(data) {
        // console.log(data);
    });
}

function updateLeaderBoard() {
    $("#killCount").text(player.kills);
    let toSort = opponents.slice().map(function(el) {
        return {name: el.name, kills: el.kills};
    });
    toSort.sort(function(a,b) {
        return b.kills - a.kills;
    });
    while (toSort.length > 3) {
        toSort.pop();
    }
    const killList = $("#killList");
    killList.html("");
    for (let i = 0; i < toSort.length; i++) {
        killList.append($("<li>").text(toSort[i].name + " : " + toSort[i].kills));
    }
}

// Get request dimensions and coordinates of walls from server
function buildWalls() {
    $.get("/walls/"+room, function(data) {
        for (let i = 0; i < data.length; i++) {
            walls.push(new Wall(data[i].x * width, data[i].y * height, data[i].w * width, data[i].h *  height));
        }
    });
}
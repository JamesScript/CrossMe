class PowerUp {
    constructor(x, y, type) {
        this.x = x * width;
        this.y = y * height;
        this.w = player.w;
        this.h = player.h;
        this.type = type;
        this.got = false;
        this.duration = 8000;
        this.respawnTime = 10000;
    }

    show() {
        if (!this.got) {
            push();
            noFill();
            rectMode(CENTER);
            translate(this.x + this.w / 2, this.y + this.h / 2);
            const rad = width * 0.005;
            const limit = 20;
            let frameFr = frameCount % limit;
            stroke(0, 0, 100, (limit - frameFr) / limit);
            rect(0, 0, frameFr * rad, frameFr * rad);
            pop();
            fill(50, 100, 100);
            rect(this.x, this.y, this.w, this.h);
            fill(0);
            textSize(width * 0.028);
            text("?", this.x + player.w * 0.24, this.y + player.h * 0.85);
            // text(this.type, this.x, this.y);
        }
    }

    update() {
        if (collides(this, player) && !this.got) {
            this.got = true;
            socket.emit('power up got');
            let typeName = this.type;
            if (typeName === "funkyFungus") {
                typeName = "funky fungus";
            } else if (typeName === "rapidFire") {
                typeName = "rapid fire";
            }
            gameMessage(name + " found some " + typeName);
            this[this.type](); // Call the method that contains the effect
            setTimeout(function() {
                spawnPowerUp();
            }, this.respawnTime);
        }
    }

    health() {
        player.hp += 30;
        renderHP();
    }

    speed() {
        player.speedBonus = 2;
        setTimeout(function(){
            player.speedBonus = 1;
        }, this.duration);
    }

    rapidFire() {
        player.fireRate = 50;
        setTimeout(function(){
            player.fireRate = 200;
        }, this.duration);
    }

    shield() {
        player.shielded = true;
        setTimeout(function(){
            player.shielded = false;
        }, this.duration);
    }

    slothadone() {
        player.speedBonus = 0.5;
        setTimeout(function(){
            player.speedBonus = 1;
        }, this.duration);
    }

    funkyFungus() {
        player.tripping = true;
        setTimeout(function(){
            player.tripping = false;
        }, this.duration);
    }
}

function spawnPowerUp() {
    const powerUpTypes = ["health", "speed", "rapidFire", "shield", "slothadone", "funkyFungus"];
    let potentialPowerUp = {x: random(width - player.w), y: random(height - player.h), w: player.h, h: player.h};
    let collidingWalls = true;
    while (collidingWalls) {
        collidingWalls = false;
        for (let i = 0; i < walls.length; i++) {
            if (collides(potentialPowerUp, walls[i])) {
                potentialPowerUp.x = random(width - player.w);
                potentialPowerUp.y = random(height - player.h);
                collidingWalls = true;
            }
        }
    }
    let powerUpPackage = {x: potentialPowerUp.x / width, y: potentialPowerUp.y / height, type: powerUpTypes[floor(random(powerUpTypes.length))]};
    socket.emit('spawn power up', JSON.stringify(powerUpPackage));
}
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.w = player.w;
        this.h = player.h;
        this.type = type;
        this.got = false;
        this.duration = 8000;
        this.respawnTime = 16000;
    }

    show() {
        if (!this.got) {
            fill(50, 100, 100);
            rect(this.x, this.y, this.w, this.h);
            text(this.type, this.x, this.y);
        }
    }

    update() {
        if (collides(this, player) && !this.got) {
            this.got = true;
            this[this.type](); // Call the method that contains the effect
            setTimeout(function() {
                spawnPowerUp();
            }, this.respawnTime);
        }
    }

    health() {
        player.hp += 30;
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

    slothamine() {
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
    const powerUpTypes = ["health", "speed", "rapidFire", "shield", "slothamine", "funkyFungus"];
    let potentialPowerUp = {x: random(width - player.w), y: random(height - player.h), w: player.h, h: player.h};
    let collidingWalls = true;
    while (collidingWalls) {
        for (let i = 0; i < walls.length; i++) {
            if (collides(potentialPowerUp, walls[i])) {
                potentialPowerUp.x = random(width - player.w);
                potentialPowerUp.y = random(height - player.h);
            } else if (i === walls.length - 1) {
                collidingWalls = false;
            }
        }
    }
    powerUp = new PowerUp(potentialPowerUp.x, potentialPowerUp.y, powerUpTypes[floor(random(powerUpTypes.length))]);
}
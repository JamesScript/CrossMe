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
        this.invincible = false;
        this.prevX = [];
        this.prevY = [];
        this.hp = 100;
        this.speedBonus = 1;
        this.fireRate = 200;
        this.shielded = false;
        this.tripping = false;
        this.alive = true;
        this.kills = 0;
        this.killedBy = "";
    }

    show() {
        // Show bullets first, as they will appear 'under' the character which looks better than the alternative
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].show();
            this.bullets[i].update();
            if (this.bullets[i].offScreen()) {
                this.bullets.splice(i, 1);
            } else {
                for (let j = 0; j < walls.length; j++) {
                    // If bullet hits the wall it can disappear from the game without calling server-side function
                    // Updates to user's bullets will be sent in the 'infoPackage' in draw()
                    if (collides(this.bullets[i], walls[j])) {
                        this.bullets.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }
        // Character will flash every other frame if temporarily invincible
        if (!this.invincible || (this.invincible && frameCount % 2 === 0)) {
            // Funky fungus visual effects
            if (this.tripping) {
                trip(this.x, this.y);
            }
            // Shielded
            if (this.shielded) {
                let sGap = width * 0.01 + sin(frameCount / 5) * (width * 0.01);
                fill(200, 100, 100);
                rect(this.x - sGap, this.y - sGap, this.w + sGap*2, this.h + sGap*2);
            }
            // Body
            fill(this.hue, 70, 100);
            rect(this.x, this.y, this.w, this.h);
            // Eyes
            fill(0);
            const eyeSize = width * 0.012;
            if (player.tripping) {
                // Eye colours go crazy during funky fungus effects
                const count = 100;
                let tripHue = map(frameCount % count, 0, count, 0, 360);
                fill(tripHue, 100, 100);
            }
            const eyeOne = [this.x + this.w * (this.dir === 1 ? 0.75 : 0.25), this.y + this.h * (this.dir === 2 ? 0.75 : 0.25)];
            const eyeTwo = [this.x + this.w * (this.dir === 3 ? 0.25 : 0.75), this.y + this.h * (this.dir === 0 ? 0.25 : 0.75)];
            ellipse(eyeOne[0], eyeOne[1], eyeSize);
            ellipse(eyeTwo[0], eyeTwo[1], eyeSize);
            fill(0, 0, 100);
            const xOff = 1.005;
            const yOff = 0.995;
            ellipse(eyeOne[0] * xOff, eyeOne[1] * yOff, eyeSize / 3);
            ellipse(eyeTwo[0] * xOff, eyeTwo[1] * yOff, eyeSize / 3);
        }
    }

    update() {
        // Keyboard controls
        this.keyboardControls();
        // Constrain character to canvas, can't go outside
        this.x = constrain(this.x, 0, width - this.w);
        this.y = constrain(this.y, 0, height - this.h);
        // Keep log of previous positions in arrays
        this.prevX.unshift(this.x);
        this.prevY.unshift(this.y);
        // Keep those arrays no longer than 10 elements
        if (this.prevX.length > 10) {
            this.prevX.pop();
        }
        if (this.prevY.length > 10) {
            this.prevY.pop();
        }
        // If healed beyond maximum health, set to maximum health
        if (this.hp > 100) {
            this.hp = 100;
            renderHP();
        }
        // Death
        if (this.hp <= 0) {
            this.death();
        }
    }

    keyboardControls() {
        // Check for speed bonus
        let speed = width * 0.01 * this.speedBonus;
        // LEFT
        if (keyIsDown(37)) {
            this.x -= speed;
            // If shift is held (16), do not change direction
            if (!keyIsDown(16)) this.dir = 3;
        }
        // RIGHT
        else if (keyIsDown(39)) {
            this.x += speed;
            if (!keyIsDown(16)) this.dir = 1;
        }
        // UP
        else if (keyIsDown(38)) {
            this.y -= speed;
            if (!keyIsDown(16)) this.dir = 0;
        }
        // DOWN
        else if (keyIsDown(40)) {
            this.y += speed;
            if (!keyIsDown(16)) this.dir = 2;
        }
        // Shoot
        if (keyIsDown(32) && this.canShoot) {
            const self = this;
            this.bullets.push(new Bullet(this.x + this.w / 2, this.y + this.h / 2, this.dir));
            this.canShoot = false;
            setTimeout(function () {
                self.canShoot = true;
            }, self.fireRate);
        }
    }

    death() {
        this.hp = 0;
        this.alive = false;
        // this.killedBy needs to be the user's ID not their name, in case of duplicate names
        gameMessage(name + " was killed by " + this.killedBy.name);
        socket.emit("kill increment", this.killedBy.id);
        this.deathCountdown(5);
        $("#deathScreen").addClass("appear");
        renderHP();
    }

    deathCountdown(seconds) {
        let self = this;
        if (seconds === 0) {
            return this.respawn();
        }
        $("#respawnCounter").text(seconds);
        setTimeout(function () {
            self.deathCountdown(seconds-1);
        }, 1000)
    }

    respawn() {
        this.hp = 100;
        this.alive = true;
        renderHP();
        $("#deathScreen").removeClass("appear").css({opacity: 0});
        this.findStartingPosition();
    }

    findStartingPosition() {
        // Recursive function, keeps running until user is not colliding with any walls
        this.x = random(width - this.w);
        this.y = random(height - this.h);
        for (let i = 0; i < walls.length; i++) {
            if (collides(walls[i], this)) {
                this.findStartingPosition();
                break;
            }
        }
    }

    temporaryInvincibility(time) {
        if (time > 1000) {
            time = 300;
        }
        this.invincible = true;
        let self = this;
        setTimeout(function () {
            self.invincible = false;
        }, time);
    }
}
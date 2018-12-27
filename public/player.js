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
        this.killedBy = "";
    }

    show() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].show();
            this.bullets[i].update();
            if (this.bullets[i].offScreen()) {
                this.bullets.splice(i, 1);
            } else {
                for (let j = 0; j < walls.length; j++) {
                    if (collides(this.bullets[i], walls[j])) {
                        this.bullets.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }
        if (!this.invincible || (this.invincible && frameCount % 2 === 0)) {
            if (this.tripping) {
                trip(this.x, this.y);
            }
            if (this.shielded) {
                let sGap = width * 0.01 + sin(frameCount / 5) * (width * 0.01);
                fill(200, 100, 100);
                rect(this.x - sGap, this.y - sGap, this.w + sGap*2, this.h + sGap*2);
            }
            fill(this.hue, 70, 100);
            rect(this.x, this.y, this.w, this.h);
            fill(0);
            const eyeSize = width * 0.007;
            if (player.tripping) {
                const count = 100;
                let tripHue = map(frameCount % count, 0, count, 0, 360);
                fill(tripHue, 100, 100);
            }
            ellipse(this.x + this.w * (this.dir === 1 ? 0.75 : 0.25), this.y + this.h * (this.dir === 2 ? 0.75 : 0.25), eyeSize);
            ellipse(this.x + this.w * (this.dir === 3 ? 0.25 : 0.75), this.y + this.h * (this.dir === 0 ? 0.25 : 0.75), eyeSize);
        }
    }

    update() {
        this.keyboardControls();
        this.x = constrain(this.x, 0, width - this.w);
        this.y = constrain(this.y, 0, height - this.h);
        this.prevX.unshift(this.x);
        this.prevY.unshift(this.y);
        if (this.prevX.length > 10) {
            this.prevX.pop();
        }
        if (this.prevY.length > 10) {
            this.prevY.pop();
        }
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
        let speed = width * 0.01 * this.speedBonus;
        if (keyIsDown(37)) {
            this.x -= speed;
            if (!keyIsDown(16)) this.dir = 3;
        }
        else if (keyIsDown(39)) {
            this.x += speed;
            if (!keyIsDown(16)) this.dir = 1;
        }
        else if (keyIsDown(38)) {
            this.y -= speed;
            if (!keyIsDown(16)) this.dir = 0;
        }
        else if (keyIsDown(40)) {
            this.y += speed;
            if (!keyIsDown(16)) this.dir = 2;
        }
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
        gameMessage(name + " was killed by " + this.killedBy);
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
        this.x = random(width - this.w);
        this.y = random(height - this.h);
        for (let i = 0; i < walls.length; i++) {
            if (collides(walls[i], this)) {
                this.findStartingPosition();
                break;
            }
        }

        // let wallCollision = true;
        // while (wallCollision) {
        //     wallCollision = false;
        //     this.x = random(width - this.w);
        //     this.y = random(height - this.h);
        //     for (let i = 0; i < walls.length; i++) {
        //         if (collides(walls[i], this)) {
        //             wallCollision = true;
        //             break;
        //         }
        //     }
        // }
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
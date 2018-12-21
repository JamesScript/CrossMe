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
    }

    show() {
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].show();
            this.bullets[i].update();
            if (this.bullets[i].offScreen()) {
                this.bullets.splice(i, 1);
            }
        }
        if (!this.invincible || (this.invincible && frameCount % 2 === 0)) {
            fill(this.hue, 100, 100);
            rect(this.x, this.y, this.w, this.h);
            fill(0);
            const eyeSize = width * 0.007;
            ellipse(this.x + this.w * (this.dir === 1 ? 0.75 : 0.25), this.y + this.h * (this.dir === 2 ? 0.75 : 0.25), eyeSize);
            ellipse(this.x + this.w * (this.dir === 3 ? 0.25 : 0.75), this.y + this.h * (this.dir === 0 ? 0.25 : 0.75), eyeSize);
        }
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
            setTimeout(function () {
                self.canShoot = true;
            }, 200);
        }
        this.x = constrain(this.x, 0, width - this.w);
        this.y = constrain(this.y, 0, height - this.h);
    }

    temporaryInvincibility(time) {
        this.invincible = true;
        let self = this;
        setTimeout(function () {
            self.invincible = false;
        }, time);
    }
}
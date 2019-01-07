class Bullet {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.w = width * 0.007;
        this.h = height * 0.007;
        this.dir = dir;
    }

    show() {
        let hue = player.tripping ? (frameCount * 10) % 360 : 0;
        fill(hue, 70, 100);
        ellipse(this.x, this.y, this.w);
    }

    update() {
        const speed = width * 0.02;
        let xVels = [0, speed, 0, -speed];
        let yVels = [-speed, 0, speed, 0];
        this.x += xVels[this.dir];
        this.y += yVels[this.dir];
    }

    offScreen() {
        return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
    }
}
class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    show() {
        let hue = player.tripping ? (frameCount * 10) % 360 : 195;
        fill(hue, 25, 90);
        rect(this.x, this.y, this.w, this.h);
    }

    update() {
        while (collides(this, player)) {
            player.prevX.shift();
            player.prevY.shift();
            player.x = player.prevX[0];
            player.y = player.prevY[0];
        }
    }
}
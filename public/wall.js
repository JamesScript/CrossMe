class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    show() {
        let hue = player.tripping ? (frameCount * 10) % 360 : 195;
        let sat = player.tripping ? 80 : 25;
        fill(hue, sat, 90);
        rect(this.x, this.y, this.w, this.h);
    }

    update() {
        const self = this;
        const pushHorizontal = function() {
            // Determine whether player was previously on the left or right of the center of the wall
            if (player.prevX[0] + player.w / 2 < self.x + self.w / 2) {
                player.x = self.x - player.w;
            } else {
                player.x = self.x + self.w;
            }
        };
        const pushVertical = function() {
            // Determine whether player was previously on the above or bottom of the center of the wall
            if (player.prevY[0] + player.h / 2 < self.y + self.h / 2) {
                player.y = self.y - player.h;
            } else {
                player.y = self.y + self.h;
            }
        };
        // Push to edge
        if (collides(this, player)) {
            if (player.y > this.y && player.y + player.h < this.y + this.h) {
                pushHorizontal();
            } else if (player.x > this.x && player.x + player.w < this.x + this.w) {
                pushVertical();
            } else {
                pushHorizontal();
                pushVertical();
            }
        }
        // Collision detection
        // while (collides(this, player)) {
        //     player.prevX.shift();
        //     player.prevY.shift();
        //     player.x = player.prevX[0];
        //     player.y = player.prevY[0];
        // }
    }
}
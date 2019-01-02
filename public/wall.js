class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.resetForLoop = false;
    }

    show() {
        let hue = player.tripping ? (frameCount * 10) % 360 : 195;
        let sat = player.tripping ? 80 : 25;
        fill(hue, sat, 90);
        rect(this.x, this.y, this.w, this.h);
        const lineHeight = height * 0.02;
        const lineWidth = width * 0.04;
        for (let i = 0; i < floor(this.h / lineHeight); i++) {
            stroke(hue, sat, 70);
            line(this.x, this.y + i * lineHeight, this.x + this.w - 1, this.y + i * lineHeight - 1);
            for (let j = 0; j < ceil(this.w / lineWidth); j++) {
                let xPos = this.x + j * lineWidth;
                if (i % 2 === 0) {
                    xPos += lineWidth / 2;
                }
                if (xPos < this.x + this.w - 1) {
                    line(xPos, this.y + i * lineHeight, xPos, this.y + i * lineHeight + lineHeight - 1);
                }
            }
            noStroke();
        }
    }

    update() {
        const self = this;
        const pushHorizontal = function() {
            // Determine whether player was previously on the left or right of the center of the wall
            if (player.prevX[0] + player.w / 2 < self.x + self.w / 2) {
                player.x = self.x - player.w;
                // Failsafe that prevents infinite loop on some devices
                while (collides(self, player)) {
                      player.x--;
                }
            } else {
                player.x = self.x + self.w;
                while (collides(self, player)) {
                      player.x++;
                }
            }
            self.resetForLoop = true;
        };
        const pushVertical = function() {
            // Determine whether player was previously on the above or bottom of the center of the wall
            if (player.prevY[0] + player.h / 2 < self.y + self.h / 2) {
                player.y = self.y - player.h;
                while (collides(self, player)) {
                      player.y--;
                }
            } else {
                player.y = self.y + self.h;
                while (collides(self, player)) {
                      player.y++;
                }
            }
            self.resetForLoop = true;
        };
        // Push to edge
        if (collides(this, player)) {
            if (player.y > this.y && player.y + player.h < this.y + this.h) {
                pushHorizontal();
                console.log("horizontal");
            } else if (player.x > this.x && player.x + player.w < this.x + this.w) {
                pushVertical();
                console.log("vertical");
            } else {
                pushHorizontal();
                pushVertical();
                console.log("both");
            }
        }
    }
}
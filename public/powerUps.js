class PowerUp {
    constructor(x, y, type, got) {
        this.x = x * width;
        this.y = y * height;
        this.w = player.w;
        this.h = player.h;
        this.type = type;
        this.got = got;
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
            rect(0, 0, frameFr * rad + player.w / 2, frameFr * rad + player.h / 2);
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
            socket.emit('power up got', room);
            // Reformatting camel case to normal English
            let typeName = this.type;
            if (typeName === "funkyFungus") {
                typeName = "funky fungus";
            } else if (typeName === "rapidFire") {
                typeName = "rapid fire";
            }
            gameMessage(name + " found some " + typeName);
            this[this.type](); // Call the method that contains the effect
        }
    }

    health() {
        player.hp += 30;
        renderHP();
    }

    speed() {
        player.speedBonus = 1.5;
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

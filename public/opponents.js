function renderOpponents() {
    for (let i = 0; i < opponents.length; i++) {
        if (opponents[i].id !== id && opponents[i].alive) {
            // Show enemies
            if (!opponents[i].invincible || (opponents[i].invincible && frameCount % 2 === 0)) {
                if (player.tripping) {
                    trip(opponents[i].x * width, opponents[i].y * height);
                    // let rSize = (frameCount % 5) * width * 0.01;
                    // fill(random(360), 100, 100);
                    // rect(opponents[i].x * width - rSize, opponents[i].y * height - rSize, player.w + rSize*2, player.h + rSize*2);
                }
                if (opponents[i].shielded) {
                    let sGap = width * 0.01 + sin(frameCount / 5) * (width * 0.01);
                    fill(200, 100, 100);
                    rect(opponents[i].x * width - sGap, opponents[i].y * height - sGap, player.w + sGap*2, player.h + sGap*2);
                }
                fill(opponents[i].hue, 100, 100);
                rect(opponents[i].x * width, opponents[i].y * height, player.w, player.h);
                fill(0);
                const eyeSize = width * 0.007;
                ellipse(opponents[i].x * width + player.w * (opponents[i].dir === 1 ? 0.75 : 0.25), opponents[i].y * height + player.h * (opponents[i].dir === 2 ? 0.75 : 0.25), eyeSize);
                ellipse(opponents[i].x * width + player.w * (opponents[i].dir === 3 ? 0.25 : 0.75), opponents[i].y * height + player.h * (opponents[i].dir === 0 ? 0.25 : 0.75), eyeSize);
            }
            // Look for bullets to be harmed by
            for (let j = 0; j < opponents[i].bullets.length; j++) {
                fill(0, 100, 100);
                let bulletX = opponents[i].bullets[j][0] * width;
                let bulletY = opponents[i].bullets[j][1] * height;
                ellipse(bulletX, bulletY, width * 0.01);
                // let playerMidX = player.x + player.w / 2;
                // let playerMidY = player.y + player.h / 2;
                let currentBullet = {x: bulletX, y: bulletY, w: width * 0.01, h: height * 0.01};
                if (collides(currentBullet, player)) {
                    // socket.emit('chat message', name + ": OUCH!");
                    if (!player.invincible) {
                        player.hp -= player.shielded ? 2 : 10;
                        renderHP();
                        player.temporaryInvincibility(300);
                        if (player.hp <= 0) {
                            player.killedBy = opponents[i].name;
                        }
                    }
                    socket.emit('splice bullet', JSON.stringify({id: opponents[i].id, bulletIndex: j}));
                }
            }
        }
    }
}
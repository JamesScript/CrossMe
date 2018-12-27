function renderOpponents() {
    for (let i = 0; i < opponents.length; i++) {
        // Only render opponent if they're not you (as you will be in the players array) and obviously only if they're alive
        if (opponents[i].id !== id && opponents[i].alive) {
            // Show enemies
            // This if statement makes the character flash every other frame if they're temporarily invincible
            if (!opponents[i].invincible || (opponents[i].invincible && frameCount % 2 === 0)) {
                // Visual effects if user is under influence of funky fungs
                if (player.tripping) {
                    trip(opponents[i].x * width, opponents[i].y * height);
                }
                // Visual effects of shield on opponent
                if (opponents[i].shielded) {
                    let sGap = width * 0.01 + sin(frameCount / 5) * (width * 0.01);
                    fill(200, 100, 100);
                    rect(opponents[i].x * width - sGap, opponents[i].y * height - sGap, player.w + sGap*2, player.h + sGap*2);
                }
                // Body
                fill(opponents[i].hue, 100, 100);
                rect(opponents[i].x * width, opponents[i].y * height, player.w, player.h);
                // Eyes
                fill(0);
                const eyeSize = width * 0.007;
                ellipse(opponents[i].x * width + player.w * (opponents[i].dir === 1 ? 0.75 : 0.25), opponents[i].y * height + player.h * (opponents[i].dir === 2 ? 0.75 : 0.25), eyeSize);
                ellipse(opponents[i].x * width + player.w * (opponents[i].dir === 3 ? 0.25 : 0.75), opponents[i].y * height + player.h * (opponents[i].dir === 0 ? 0.25 : 0.75), eyeSize);
            }
            // Look for bullets to be harmed by
            for (let j = 0; j < opponents[i].bullets.length; j++) {
                // Draw bullets
                fill(0, 100, 100);
                // X and Y coordinates are array elements 0 and 1 respectively
                let bulletX = opponents[i].bullets[j][0] * width;
                let bulletY = opponents[i].bullets[j][1] * height;
                ellipse(bulletX, bulletY, width * 0.01);
                // bullet made into temporary object so that it can be checked with Collision function
                let currentBullet = {x: bulletX, y: bulletY, w: width * 0.01, h: height * 0.01};
                // If enemy's bullet hits you
                if (collides(currentBullet, player)) {
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
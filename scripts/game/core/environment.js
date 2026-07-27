class Environment {
    constructor() {
        this.objects = [];
    }

    update() {
        this.handleEnemySpawning();
        this.updateObjects();
        this.resolveEntityCollisions();
        this.objects = this.objects.filter(a => !a.delete);
    };

    handleEnemySpawning() {
        const player = game.getPlayer();
        if (!player) return;

        const timeOfDay = game.world.getTimeOfDay();
        const maxAmount = timeOfDay == 'night' ? 300 : 10;
        const enemies = this.objects.filter(a => a.type == 'zombie');
        if (enemies.length < maxAmount) this.spawnNewEnemy(player);
        else if (enemies.length >= maxAmount) this.deleteFurthestEnemy(player, enemies);
    }

    spawnNewEnemy(player) {
        const dist = 35 + Math.random() * 15;
        const dir = Math.random() * 360;
        const cors = Math.distToMove(dist, dir);
        const x = player.x + cors.x, y = player.y + cors.y;
        const block = game.world.getBlock(x, y);
        if (block.solid) return false;

        const enemy = new Zombie(x, y);
        this.objects.push(enemy);
    }

    deleteFurthestEnemy(player, enemies) {
        let furthest = null;
        let furthestDist = 0;
        for (const enemy of enemies) {
            const visible = user.cam.checkVisibilityOfRect(enemy.x, enemy.y);
            if (visible) {
                const dist = Math.distTo(player.x, player.y, enemy.x, enemy.y);
                const dir = Math.dirTo(player.x, player.y, enemy.x, enemy.y);
                const lineOfSightBlocked = raycast(player.x, player.y, dir, dist);
                if (!lineOfSightBlocked) continue;
            }

            const dist = Math.distTo(player.x, player.y, enemy.x, enemy.y);
            if (dist > furthestDist) {
                furthest = enemy;
                furthestDist = dist;
            }
        }
        if (!furthest) return;
        furthest.delete = true;
    }

    updateObjects() {
        for (var o of this.objects) {
            // skip objects with no update function
            if (!typeof o.update == 'function') {
                console.error(`${o} does not have a update function`);
                continue;
            }

            const inRenderDistance = game.getPlayer().isObjectInRenderDistance(o);
            if (!inRenderDistance) {
                o.delete = true;
                continue;
            }

            // update object
            o.update();
        }
    }

    resolveEntityCollisions() {
        for (let n = 0; n < this.objects.length; n++) {
            const o = this.objects[n];
            if (o.normalCollisionsDisabled) continue;

            for (let n2 = n + 1; n2 < this.objects.length; n2++) {
                const o2 = this.objects[n2];
                if (o2.normalCollisionsDisabled) continue;

                // skip entities that are too far away
                const dist = Math.distTo(o.x, o.y, o2.x, o2.y);
                if (dist > o.radius + o2.radius) continue;

                const dir = Math.dirTo(o.x, o.y, o2.x, o2.y);
                const accel = Math.distToMove(0.02, 180 + dir);

                o.move.x += accel.x;
                o.move.y += accel.y;

                o2.move.x -= accel.x;
                o2.move.y -= accel.y;

                // IDK why but this doesn't work
                /*
                const overlap = dist - (o.radius + o2.radius);
                const move = Math.distToMove(overlap * 0.5, dir);

                const oColliding = o.checkIfCollidingWithVoxel(o.x + move.x, o.x + move.x);
                const o2Colliding = o2.checkIfCollidingWithVoxel(o2.x - move.x, o2.x - move.x);
                if (o2Colliding) {
                    o2.x -= move.x * 2;
                    o2.y -= move.y * 2;
                } else if (oColliding) {
                    o.x += move.x * 2;
                    o.y += move.y * 2;
                } else {
                    o.x += move.x;
                    o.y += move.y;

                    o2.x -= move.x;
                    o2.y -= move.y;
                }
                    */
            }
        }
    }

    draw() {
        for (var o of this.objects) {
            // skip objects with no draw function
            if (!typeof o.draw == 'function') {
                console.error(`${o} does not have a draw function`);
                continue;
            }

            //const visible = game.getPlayer().isObjectVisible(o);
            //if (!visible) continue;//ctx.globalAlpha = 0.25;
            const block = game.world.getBlock(o.x, o.y);
            ctx.globalAlpha = block.light - 0.1;

            // translate to object position
            ctx.save();
            ctx.translate(o.x, o.y);

            ctx.save();
            if (o.angle) ctx.rotate(o.angle * Math.PI / 180);

            // draw object
            o.draw();

            ctx.restore();

            o.drawHealthbar();

            ctx.restore();

            ctx.globalAlpha = 1;
        }
    }
}
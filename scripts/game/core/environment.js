class Environment {
    constructor() {
        this.objects = [];
        this.AMOUNT_OF_ZOMBIES_DAY = 5;
        this.AMOUNT_OF_ZOMBIES_NIGHT = 300;
        this.MIN_SPAWN_DIST = 35;
    }

    reset() {
        this.objects = [];
        this.objects.push(new Player(user, 0, 0));

        const amount = 0;
        for (let n = 0; n < amount; n++) {
            const angle = 360 / amount * n;
            const { x, y } = Math.distToMove(40, angle);
            this.objects.push(new Zombie(x, y));
        }
    }

    update() {
        //this.handleEnemySpawning();
        this.updateObjects();
        this.resolveEntityCollisions();
        this.objects = this.objects.filter(a => !a.delete);
    };

    handleEnemySpawning() {
        const player = game.getPlayer();
        if (!player) return;

        const timeOfDay = game.world.getTimeOfDay();
        const maxAmount = timeOfDay == 'night' ? this.AMOUNT_OF_ZOMBIES_NIGHT : this.AMOUNT_OF_ZOMBIES_DAY;
        const enemies = this.objects.filter(a => a.type == 'zombie');
        if (enemies.length < maxAmount) this.spawnNewEnemy(player);
        else if (enemies.length >= maxAmount) this.deleteFurthestEnemy(player, enemies);
    }

    spawnNewEnemy(player) {
        const dist = this.MIN_SPAWN_DIST + Math.random() * 15;
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

            // translate to object position
            ctx.save();
            ctx.translate(o.x, o.y);

            const block = game.world.getBlock(o.x, o.y);
            ctx.globalAlpha = block.light - 0.1;

            // draw object
            ctx.save();
            if (o.angle) ctx.rotate(o.angle * Math.PI / 180);
            o.draw();
            ctx.restore();

            // draw healthbar
            o.drawHealthbar();
            ctx.globalAlpha = 1;

            o.drawHitbox();
            ctx.restore();

        }
    }

    checkIfPlayerIsSafe() {
        const player = game.getPlayer();
        if (!player) return;

        // create a new path
        const path = new Path(player, game.world.pathfindingManager);

        // calculate the area of a circle with diameter MIN_SPAWN_DIST
        // this is the max amount of cells that must be checked before the player is determined safe
        const dist = this.MIN_SPAWN_DIST;
        const area = Math.PI * dist * dist

        path.end.x = player.x;
        path.end.y = player.y - dist;

        const pathIsPossible = path.calculate(500, true);
        if (pathIsPossible === null) return true; // player is enclosed

        // player is not enclosed
        return false;
    }
}
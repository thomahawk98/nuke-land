class Environment {
    constructor() {
        this.objects = [];
    }

    update() {
        this.updateObjects();
        this.resolveEntityCollisions();
        this.objects = this.objects.filter(a => !a.delete);
    };

    updateObjects() {
        for (var o of this.objects) {
            // skip objects with no update function
            if (!typeof o.update == 'function') {
                console.error(`${o} does not have a update function`);
                continue;
            }

            const inRenderDistance = game.getPlayer().isObjectInRenderDistance(o);
            if (!inRenderDistance) continue;

            // update object
            o.update();
        }
    }

    resolveEntityCollisions() {
        for (let n = 0; n < this.objects.length; n++) {
            for (let n2 = n + 1; n2 < this.objects.length; n2++) {
                const o = this.objects[n];
                const o2 = this.objects[n2];

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
            if (o.angle) ctx.rotate(o.angle * Math.PI / 180);

            // draw object
            o.draw();

            ctx.restore();

            ctx.globalAlpha = 1;
        }
    }
}
class Environment {
    constructor() {
        this.objects = [];
    }

    update() {
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
        this.objects = this.objects.filter(a => !a.delete);
    };

    draw() {
        for (var o of this.objects) {
            // skip objects with no draw function
            if (!typeof o.draw == 'function') {
                console.error(`${o} does not have a draw function`);
                continue;
            }

            const visible = game.getPlayer().isObjectVisible(o);
            if (!visible) continue;

            // translate to object position
            ctx.save();
            ctx.translate(o.x, o.y);
            if (o.angle) ctx.rotate(o.angle * Math.PI / 180);

            // draw object
            o.draw();

            ctx.restore();
        }
    }
}
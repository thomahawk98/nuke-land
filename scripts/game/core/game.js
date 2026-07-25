class Game {
    constructor() {
        this.t = 0;
        this.world = new World();
        this.debug = false;
    }

    tick() {
        this.t++;
        this.update();
        this.draw();
    };

    update() {
        if (!this.initialized) {
            this.reset();
            this.initialized = true;
        }
        this.world.update();
    };

    reset() {
        this.world.reset();
    }

    draw() {
        ctx.save();
        user.cam.alignViewport();

        this.world.draw();

        ctx.restore();
    };
    getPlayer() {
        return this.world.env.objects.find(a => a.type == 'player');
    };

}
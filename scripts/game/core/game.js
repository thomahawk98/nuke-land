class Game {
    constructor() {
        this.t = 0;
        this.world = new World();
        this.debug = true;
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

        ctx.fillStyle = 'black';
        ctx.font = '2px super-crawler';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Hello, World!', 0, 0);

        this.world.draw();

        ctx.restore();
    };
    getPlayer() {
        return this.world.env.objects.find(a => a.type == 'player');
    };

}
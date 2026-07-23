class Game {
    constructor() {
        this.t = 0;
        this.world = new World();
        this.debug = true;
        this.objects = {
            objects: [],
            update: function () {
                for (var o of this.objects) {
                    // skip objects with no update function
                    if (!typeof o.update == 'function') {
                        console.error(`${o} does not have a update function`);
                        continue;
                    }

                    // update object
                    o.update();
                }
                this.objects = this.objects.filter(a => !a.delete);
            },
            draw: function () {
                for (var o of this.objects) {
                    // skip objects with no draw function
                    if (!typeof o.draw == 'function') {
                        console.error(`${o} does not have a draw function`);
                        continue;
                    }

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
        this.objects.update();
    };

    reset() {
        this.objects.objects = [];
        this.objects.objects.push(new Player(user, 0, 0));
        const amount = 10;
        for (let n = 0; n < amount; n++) {
            const angle = 360 / amount * n;
            const { x, y } = Math.distToMove(10, angle);
            this.objects.objects.push(new Zombie(x, y));
        }
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
        this.objects.draw();

        ctx.restore();
    };
    getPlayer() {
        return this.objects.objects.find(a => a.type == 'player');
    };

}
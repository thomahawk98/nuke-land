class Game {
    constructor() {
        this.world = new World();
        this.objects = {
            objects: [
                new Player(user, 0, 0),
            ],
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
        this.update();
        this.draw();
    };

    update() {
        this.objects.update();
    };

    draw() {
        ctx.save();
        user.cam.alignViewport();

        ctx.fillStyle = 'black';
        ctx.font = '2px super-crawler';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Hello, World!', 0, 0);

        this.objects.draw();

        ctx.restore();
    };
    getPlayer() {
        return this.objects.find(a => a.type == 'player');
    };

}
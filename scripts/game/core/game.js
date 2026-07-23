var game = {
    tick: function () {
        this.update();
        this.draw();
    },
    update: function () {
        this.objects.update();
    },
    draw: function () {
        ctx.save();
        user.cam.alignViewport();

        ctx.fillStyle = 'black';
        ctx.font = '40px super-crawler';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Hello, World!', 0, 0);

        this.objects.draw();

        ctx.restore();
    },
    objects: {
        objects: [],
        update: function () {
            for (var o of this.objects) {
                typeof o.update == 'function'
                    ? o.update()
                    : console.error(`${o} does not have an update function`);
            }
            this.objects = this.objects.filter(a => !a.delete);
        },
        draw: function () {
            for (var o of this.objects) {
                typeof o.draw == 'function'
                    ? o.draw()
                    : console.error(`${o} does not have a draw function`);
            }
        },
    }
}
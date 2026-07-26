class Game {
    constructor() {
        this.t = 0;
        this.page = 'audio check';
        this.world = new World();
        this.menu = new Menu();
        this.music = new Music();
        this.debug = false;
    }

    tick() {
        this.t += 1.5;
        this.update();
        this.draw();
    };

    update() {
        if (this.page == 'audio check') this.audioCheckPage.update();
        else if (this.page == 'menu') this.menu.update();
        else if (this.page == 'game') {
            if (!this.initialized) {
                this.reset();
                this.initialized = true;
            }
            this.world.update();
        }

        if (this.page !== 'audio check') this.music.update();
    };

    reset() {
        this.world.reset();
    }

    draw() {
        if (this.page == 'audio check') this.audioCheckPage.draw();
        else if (this.page == 'menu') this.menu.draw();
        else if (this.page == 'game') {
            ctx.save();
            user.cam.alignViewport();

            this.world.draw();

            ctx.restore();
        }
    };

    audioCheckPage = {
        draw: function () {
            const size = 70 + Math.sin(game.t * 0.02) * 3;
            ctx.f(size);

            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Click to enable audio', canvas.width * 0.5, canvas.height * 0.5);
        },
        update() {
            if (user.mouse.left.click) game.page = 'menu';
        }
    }

    getPlayer() {
        return this.world.env.objects.find(a => a.type == 'player');
    };

}
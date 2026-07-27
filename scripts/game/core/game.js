class Game {
    constructor() {
        this.t = 0;
        this.page = 'audio check';
        
        this.debug = false;
        this.lastUpdate = performance.now();

        this.world = new World();
        this.menu = new Menu();
        this.audioManager = new AudioManager();
    }

    tick() {
        const now = performance.now();
        const difference = now - this.lastUpdate;
        this.lastUpdate = now;
        this.t += difference * 0.1;

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

            this.gameOverMenu.update();
        }

        if (this.page !== 'audio check') this.audioManager.update();
    };

    reset() {
        this.t = 0;
        this.gameOver = false;
        this.gameOverMenu.animation = 0;
        delete this.timeAtGameFinish;
        
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

            this.gameOverMenu.draw();
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
    };

    gameOverMenu = {
        buttons: [
            new Button(500, 525, 300, 100, 'Restart', () => {
                game.reset();
            }),
            new Button(500, 665, 300, 100, 'Quit', () => {
                game.reset();
                game.page = 'menu';
            }),
        ],
        animation: 0,
        x: 0, y: 0,
        closedCors: { x: -1000, y: 0 },
        openCors: { x: 0, y: 0 },
        update: function () {
            if (game.gameOver) this.animation = Math.min(this.animation + 0.01, 1);
            else this.animation = Math.max(0, this.animation - 0.01);

            const ease = Math.easeInOut(this.animation);
            this.x = this.openCors.x * ease + this.closedCors.x * (1 - ease);
            this.y = this.openCors.y * ease + this.closedCors.y * (1 - ease);

            if (this.animation < 1) return;

            for (const button of this.buttons) {
                button.update();
            }
        },
        draw: function () {
            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.save();
            ctx.translate(canvas.width * 0.5, canvas.height * 0.5);

            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillCorneredRect(-300, -300, 600, 600, 50);

            ctx.restore();

            for (const button of this.buttons) {
                button.draw();
            }

            ctx.translate(canvas.width * 0.5, canvas.height * 0.5);

            const nightCyclesSurvived = Math.floor(game.timeAtGameFinish / game.world.CYCLE_LENGTH);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.f(85);
            ctx.fillText('Game Over!', 0, -200);
            ctx.f(35);
            ctx.fillText(`You survived ${nightCyclesSurvived} Night Cycle${nightCyclesSurvived == 1 ? '' : 's'}`, 0, -125);
            ctx.fillText('Thanks for playing!', 0, -75);

            ctx.restore();
        },
    }

    getPlayer() {
        return this.world.env.objects.find(a => a.type == 'player');
    };
}
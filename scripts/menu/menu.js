class Menu {
    constructor() {
        this.buttons = [];
        this.loadButtons();
    }

    loadButtons() {
        this.buttons = [
            new Button(500, 500, 300, 100, 'Play', () => {
                game.page = 'game';
                game.music.playSound('Click.mp3');
                game.t = 0;
            }),
        ]
    }

    update() {
        for (const button of this.buttons) {
            button.update();
        }
    }

    draw() {
        this.drawTitle();
        for (const button of this.buttons) {
            button.draw();
        }
    }

    drawTitle(x = canvas.width * 0.5, y = 300) {
        ctx.save();
        ctx.translate(x, y);
        if (user.mouse.inBox(x - 300, y - 50, 600, 100)) ctx.scale(1.1, 1.1); // SKIBIDI but whatever
        ctx.rotate(Math.sin(game.t * 0.02) * 2 * Math.PI / 180);

        const title = document.title.toUpperCase();
        ctx.fillStyle = 'white';
        ctx.f(100);
        ctx.fillText(title, 0, 0);

        ctx.restore();
    }
}
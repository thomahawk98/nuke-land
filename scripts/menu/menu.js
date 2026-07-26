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
        this.drawCredits();
    }

    drawTitle(x = canvas.width * 0.5, y = 250) {
        ctx.save();
        ctx.translate(x, y);
        if (user.mouse.inBox(x - 300, y - 50, 600, 100)) ctx.scale(1.1, 1.1); // SKIBIDI but whatever
        ctx.rotate(Math.sin(game.t * 0.02) * 2 * Math.PI / 180);

        const title = document.title.toUpperCase();
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.f(125);
        ctx.fillText(title, 0, 0);

        ctx.restore();
    }

    drawCredits(x = canvas.width * 0.5, y = canvas.width * 0.5 + 350) {
        const credits = [
            'Programming by Thomas Butler',
            'Artwork by Thomas Butler',
            'Music by Thomas Butler',
            'SFX from Pixabay.com',
        ]

        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.f(30);
        for (let n = 0; n < credits.length; n++) {
            const credit = credits[n];
            const spacing = 55;
            const creditsHeight = credits.length * spacing;
            ctx.fillText(credit, 0, -creditsHeight * 0.5 + spacing * n);
        }

        ctx.restore();
    }
}
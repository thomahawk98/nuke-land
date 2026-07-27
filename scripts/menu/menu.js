class Menu {
    constructor() {
        this.buttons = [];
        this.imgSrcs = [
            { src: 'Player.png', x: 150, y: 400, angle: 45 },
            { src: 'Zombie.png', x: 800, y: 100, angle: 45 },
            { src: 'Axe.png', x: 500, y: 375, angle: 0 },
            { src: 'Shotgun.png', x: 600, y: 650, angle: 20 },
            { src: 'Shotgun Ammo.png', x: 900, y: 400, angle: 20 },
            { src: 'Pistol Ammo.png', x: 100, y: 850, angle: -20 },
            { src: 'Machete.png', x: 300, y: 100, angle: -90 },
            { src: 'Zombie.png', x: 850, y: 800, angle: 135 },
            { src: 'Food.png', x: 225, y: 625, angle: -20 },
        ]
        this.loadButtons();
    }

    loadButtons() {
        this.buttons = [
            new Button(500, 500, 300, 100, 'Play', () => {
                game.page = 'game';
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
        for (const o of this.imgSrcs) {
            ctx.save();
            ctx.translate(o.x, o.y);
            ctx.rotate((o.angle + Math.sin(game.t * 0.02) * 4) * Math.PI / 180);
            ctx.scale(100, 100);

            ctx.drawImage(images.get(o.src), -0.5, -0.5, 1, 1);

            ctx.restore();
        }

        for (const button of this.buttons) {
            button.draw();
        }

        this.drawTitle();
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
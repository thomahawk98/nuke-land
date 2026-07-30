class Menu {
    constructor() {
        this.page = 'play';
        this.buttons = [];
        this.imgSrcs = [
            { src: 'Player.png', x: 150, y: 400, angle: 45 },
            { src: 'Zombie 0.png', x: 800, y: 100, angle: 225 },
            { src: 'Axe.png', x: 500, y: 375, angle: 0 },
            { src: 'Shotgun.png', x: 600, y: 650, angle: 20 },
            { src: 'Shotgun Ammo.png', x: 900, y: 400, angle: 20 },
            { src: 'Pistol Ammo.png', x: 100, y: 850, angle: -20 },
            { src: 'Machete.png', x: 300, y: 100, angle: -90 },
            { src: 'Zombie 1.png', x: 850, y: 800, angle: 315 },
            { src: 'Food.png', x: 225, y: 625, angle: -20 },
        ]
        this.loadButtons();
    }

    loadButtons(page = this.page) {
        if (page == 'play') {
            this.buttons = [
                new Button(500, 500, 300, 100, 'Play', () => {
                    this.page = 'mode select';
                    this.loadButtons();
                }),
            ]
        } else if (page == 'mode select') {
            this.buttons = [
                new Button(500, 375, 400, 100, 'Easy', () => {
                    game.page = 'game';
                    game.mode = 'easy';
                    game.t = 0;
                }, {
                    drawHovered: function () {
                        ctx.save();
                        ctx.translate(250, 0);
                        ctx.drawImage(images.get('Bat.png'), -50, -50, 100, 100);
                        ctx.restore();
                    }
                }),
                new Button(500, 500, 400, 100, 'Normal', () => {
                    game.page = 'game';
                    game.mode = 'normal';
                    game.t = 0;
                }, {
                    drawHovered: function () {
                        ctx.save();
                        ctx.translate(250, 0);
                        ctx.drawImage(images.get('Axe.png'), -50, -50, 100, 100);
                        ctx.restore();
                    }
                }),
                new Button(500, 625, 400, 100, 'Impossible', () => {
                    game.page = 'game';
                    game.mode = 'impossible';
                    game.t = 0;
                }, {
                    drawHovered: function () {
                        ctx.save();
                        ctx.translate(250, 0);
                        ctx.drawImage(images.get('Spiked Bat.png'), -50, -50, 100, 100);
                        ctx.restore();
                    }
                }),
            ]
        }
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

        if (this.page == 'play') {
            const title = document.title.toUpperCase();
            ctx.fillStyle = 'white';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.f(125);
            ctx.fillText(title, 0, 0);
        } else if (this.page == 'mode select') {
            ctx.fillStyle = 'white';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.f(100);
            ctx.fillText('Select a mode:', 0, -20);
        }

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
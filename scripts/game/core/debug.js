class Debug {
    constructor() {
        this.enabled = false;
        this.showPathfindingGrid = false;
        this.showEntityHitboxes = true;
        this.showStructureCenters = true;
        this.showChunkBorders = true;
        this.controlMenu = new DebugControlMenu(this);
    }
}

class DebugControlMenu {
    constructor() {
        this.options = [];
        this.buttons = [];
        this.x = 0;
        this.y = 100;
    };

    init() {
        const options = Object.entries(game.debug)
            .filter(a => a[0] !== 'controlMenu')
            .map(a => a = { name: camelToSentence(a[0]), key: a[0], value: a[1] });

        this.options = options;
        const buttonWidth = 75;
        const buttonHeight = 25;

        let maxTextWidth = -Infinity;
        for (let n = 0; n < options.length; n++) {
            const option = options[n];
            ctx.f(25);
            const textWidth = ctx.measureText(option.name).width;
            if (textWidth > maxTextWidth) maxTextWidth = textWidth;
            const { x, y } = this.getOptionCors(n);

            const button = new Button(x + textWidth + buttonWidth * 0.5 + 10, y, buttonWidth, buttonHeight, '', () => {
                game.debug[option.key] = !game.debug[option.key];
            }, {
                changeText: function () {
                    this.text = game.debug[option.key];
                },
                textSize: 20,
                borderWidth: 2,
            });

            this.buttons.push(button);
        }

        this.width = maxTextWidth + buttonWidth + 50;
        this.height = this.options.length * 25 + 75;
    }

    update() {
        if (!this.initialized) {
            this.init();
            this.initialized = true;
        }

        if (!game.debug.enabled) return;
        for (const button of this.buttons) {
            button.update();
        }
    };

    draw() {
        if (!game.debug.enabled) return;

        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.f(40);
        ctx.fillText('Debug Menu', this.x + this.width * 0.5, this.y + 35);

        for (let n = 0; n < this.options.length; n++) {
            this.drawOption(n);
        }
        for (const button of this.buttons) {
            button.draw();
        }
    };

    drawOption(n) {
        const option = this.options[n];
        const { x, y } = this.getOptionCors(n);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.f(25);
        ctx.fillText(option.name, x, y);
    };

    getOptionCors(n) {
        return {
            x: this.x + 25,
            y: this.y + 75 + 25 * n
        }
    }
}
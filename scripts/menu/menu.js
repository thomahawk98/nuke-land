class Menu {
    constructor() {
        this.buttons = [];
        this.loadButtons();
    }

    loadButtons() {
        this.buttons = [
            new Button(500, 500, 300, 100, 'Play', () => {
                game.page = 'game';
            }),
        ]
    }

    update() {
        for (const button of this.buttons) {
            button.update();
        }
    }

    draw() {
        for (const button of this.buttons) {
            button.draw();
        }
    }
}
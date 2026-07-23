class KeyTracker {
    constructor() {
        this.down = {};
        this.up = {};

        KeyTracker.linkToEvents(this);
    }

    static linkToEvents(keys) {
        window.addEventListener('keydown', (event) => {
            keys.down[event.key] = true;
        });
        window.addEventListener('keyup', (event) => {
            keys.down[event.key] = false;
            keys.up[event.key] = true;
        });
    }

    clear() {
        this.up = {};
    }
}
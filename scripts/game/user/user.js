class User {
    constructor(canvas) {
        this.mouse = new MouseTracker(canvas);
        this.keys = new KeyTracker();
        this.cam = new Camera(canvas, this);
    }

    tick() {
        this.update();
    }

    update() {
        this.cam.update();
    }

    clear() {
        this.mouse.clear();
        this.keys.clear();
    }
}
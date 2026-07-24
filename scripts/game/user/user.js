class User {
    constructor(canvas) {
        this.mouse = new MouseTracker(canvas);
        this.keys = new KeyTracker();
        this.cam = new Camera(canvas, this);
        this.interface = new Interface(this);
    }

    tick() {
        this.update();
        this.draw();
    }

    update() {
        this.cam.update();
        this.interface.update();
    }

    draw() {
        this.interface.draw();
    }

    clear() {
        this.mouse.clear();
        this.keys.clear();
    }
}
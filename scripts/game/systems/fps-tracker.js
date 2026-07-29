class FPSTracker {
    constructor() {
        this.last = performance.now();
        this.fps = 60;
    }

    update() {
        const now = performance.now();
        const dt = now - this.last;
        this.last = now;

        const currentFPS = 1000 / dt;

        // Smooth FPS
        this.fps += (currentFPS - this.fps) * 0.1;

        return dt * 0.1;
    }

    draw() {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.f(20);

        ctx.fillStyle =
            this.fps <= 10 ? 'red' :
            this.fps <= 20 ? 'orange' :
            this.fps <= 30 ? 'yellow' :
            'lime';

        ctx.fillText(Math.round(this.fps), canvas.width - 10, 10);
    }
}
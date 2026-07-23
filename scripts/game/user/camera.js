class Camera {
    constructor(canvas, user) {
        this.user = user;

        this.x = 0;
        this.y = 0;

        this.speed = 0.1;
        this.zoom = 1;
        this.snap = 0.05;

        this.target = {
            x: 0,
            y: 0,
            zoom: 25
        }
    }

    update() {
        this.respondToControls();
        this.moveToTarget();
    }

    respondToControls() {
        if (this.user.keys.down['ArrowLeft']) this.target.x -= this.speed;
        if (this.user.keys.down['ArrowUp']) this.target.y -= this.speed;
        if (this.user.keys.down['ArrowRight']) this.target.x += this.speed;
        if (this.user.keys.down['ArrowDown']) this.target.y += this.speed;
    }

    moveToTarget() {
        this.x = this.x * (1 - this.snap) + this.target.x * this.snap;
        this.y = this.y * (1 - this.snap) + this.target.y * this.snap;
        this.zoom = this.zoom * (1 - this.snap) + this.target.zoom * this.snap;
    }

    checkVisibilityOfRect(x, y, w = 1, h = 1) {
        const viewport = this.getViewport();

        const visible = (
            x + w > viewport.left &&
            y + h > viewport.top &&
            x < viewport.right &&
            y < viewport.bottom
        );
        return visible;
    }

    getViewport() {
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(canvas.width, canvas.height);
        const viewport = {
            left: topLeft.x,
            right: bottomRight.x,
            top: topLeft.y,
            bottom: bottomRight.y
        }
        return viewport;
    }

    alignViewport() {
        ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x, -this.y);
    }

    worldToScreen(x, y) {
        return {
            x: (x - this.x) * this.zoom + canvas.width / 2,
            y: (y - this.y) * this.zoom + canvas.height / 2
        };
    }

    screenToWorld(x, y) {
        return {
            x: (x - canvas.width / 2) / this.zoom + this.x,
            y: (y - canvas.height / 2) / this.zoom + this.y
        };
    }
}
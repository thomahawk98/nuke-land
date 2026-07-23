class Player {
    constructor(user, x, y) {
        this.user = user;
        this.type = 'player';

        this.x = x;
        this.y = y;
        this.move = { x: 0, y: 0 };

        this.accel = 0.01;
        this.accelTarget = { x: 0, y: 0 };

        this.GENERATION_DISTANCE = 5;
        this.RENDER_DISTANCE = 4;
    }

    update() {
        this.respondToControls();
        this.updateAcceleration();
        this.updateMotion();
    }

    respondToControls() {
        if (this.user.keys.down['w']) this.accelTarget.y--;
        if (this.user.keys.down['a']) this.accelTarget.x--;
        if (this.user.keys.down['s']) this.accelTarget.y++;
        if (this.user.keys.down['d']) this.accelTarget.x++;
    }

    updateAcceleration() {
        if(this.accelTarget.x == 0 && this.accelTarget.y == 0) return; // no acceleration required
        const angle = Math.dirTo(0, 0, this.accelTarget.x, this.accelTarget.y);
        const accel = Math.distToMove(this.accel, angle);
        this.move.x += accel.x;
        this.move.y += accel.y;

        // reset accel target for next iteration
        this.accelTarget = { x: 0, y: 0 };
    }

    updateMotion() {
        const friction = 0.1;
        const damping = 1 - friction;

        this.move.x *= damping;
        this.move.y *= damping;

        this.x += this.move.x;
        this.y += this.move.y;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(-0.5, -0.5, 1, 1);
    }

}
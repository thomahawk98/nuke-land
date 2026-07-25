class Entity {
    constructor(x, y) {
        this.type = 'unknown entity';

        this.x = x;
        this.y = y;
        this.move = { x: 0, y: 0 };

        this.accel = 0.01;
        this.accelTarget = { x: 0, y: 0 };

        this.meleReload = 0;

        this.health = 100;
        this.maxHealth = 100;

        this.angle = 0;
        this.directionFricionMultipliers = { x: 1, y: 1 };
    }

    update() {
        this.updateVitals();
        this.updateAcceleration();
        this.updateMotion();
    }

    updateVitals() {
        if (this.meleReload > 0) this.meleReload--;
        if (this.health <= 0) this.dead = true;
        if (this.dead) this.delete = true;
    }

    updateAcceleration() {
        if (this.accelTarget.x == 0 && this.accelTarget.y == 0) return; // no acceleration required
        const angle = Math.dirTo(0, 0, this.accelTarget.x, this.accelTarget.y);
        const accel = Math.distToMove(this.accel, angle);
        this.move.x += accel.x;
        this.move.y += accel.y;

        // reset accel target for next iteration
        this.accelTarget = { x: 0, y: 0 };
    }

    updateMotion() {
        // multiply friction by the objects directional friction multipliers
        // objects like cars will obviously have more friction sideways than forwards and backwards
        const surfaceFriction = { x: 0.1, y: 0.1 };
        const worldFrictionMultipliers = Math.rotate(0, 0, this.directionFricionMultipliers.x, this.directionFricionMultipliers.y, this.angle); // rotate to the objects angle
        const friction = {
            x: surfaceFriction.x * worldFrictionMultipliers.x,
            y: surfaceFriction.y * worldFrictionMultipliers.y
        }

        const damping = {
            x: 1 - friction.x,
            y: 1 - friction.y,
        };

        this.move.x *= damping.x;
        this.move.y *= damping.y;

        this.x += this.move.x;
        this.y += this.move.y;
    }

    drawHealthbar(x = 0, y = -0.75, size = 1) {
        const percent = Math.clamp01(this.health / this.maxHealth);
        ctx.save();
        ctx.translate(x, y);

        ctx.lineWidth = 0.25;
        ctx.lineCap = 'round';

        ctx.strokeStyle = 'rgb(0,100,0)';
        ctx.beginPath();
        ctx.moveTo(-size * 0.5, 0);
        ctx.lineTo(size * 0.5, 0);
        ctx.stroke();

        if (percent !== 0) {
            ctx.strokeStyle = 'rgb(0,255,0)';
            ctx.beginPath();
            ctx.moveTo(-size * 0.5, 0);
            ctx.lineTo(-size * 0.5 + size * percent, 0);
            ctx.stroke();
        }

        ctx.restore();
    }
}
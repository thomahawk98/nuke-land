class Entity {
    constructor(x, y) {
        this.type = 'unknown entity';

        this.x = x;
        this.y = y;
        this.move = { x: 0, y: 0 };

        this.accel = 0.01;
        this.accelTarget = { x: 0, y: 0 };

        this.health = 100;
        this.maxHealth = 100;

        this.angle = 0;

        this.damage = 10;
        this.range = 2;
        this.knockback = 0.25;
        this.reload = 0;
        this.maxMeleReload = 50;
        this.angleOfAttack = 75; // only matters for the player

        this.invincibility = 0;

        this.radius = 0.5;
    }

    update() {
        this.updateVitals();
        this.updateAcceleration();
        this.updateMotion();
    }

    updateVitals() {
        if (this.reload > 0) this.reload--;
        if (this.invincibility > 0) this.invincibility--;
        if (this.decay !== undefined) this.decay > 0 ? this.decay-- : this.delete = true;
        if (this.health <= 0) this.dead = true;
        if (this.dead) this.delete = true;

        this.prevX = this.x;
        this.prevY = this.y;
    }

    updateAcceleration() {
        if (this.accelTarget.x == 0 && this.accelTarget.y == 0) return; // no acceleration required
        const angle = Math.dirTo(0, 0, this.accelTarget.x, this.accelTarget.y);
        const accel = Math.distToMove(this.accel, angle);
        this.move.x += accel.x;
        this.move.y += accel.y;

        this.angle = angle;

        // reset accel target for next iteration
        this.accelTarget = { x: 0, y: 0 };
    }

    updateMotion() {
        const friction = this.friction !== undefined ? this.friction : 0.1;
        const damping = 1 - friction;

        this.move.x *= damping;
        this.move.y *= damping;

        if (this.normalCollisionsDisabled) {
            this.x += this.move.x;
            this.y += this.move.y;
        } else {
            const xCollision = this.checkIfCollidingWithVoxel((this.x + this.move.x), this.y);
            const yCollision = this.checkIfCollidingWithVoxel(this.x, (this.y + this.move.y));

            const friction = 0.1;
            const restitution = 0.5;
            if (xCollision) {
                this.move.x = -this.move.x * restitution;
                this.move.y = this.move.y * (1 - friction);
            } else this.x += this.move.x;

            if (yCollision) {
                this.move.y = -this.move.y * restitution;
                this.move.x = this.move.x * (1 - friction);
            } else this.y += this.move.y;
        }
    }

    checkIfCollidingWithVoxel(x = this.x, y = this.y) {
        const w = 0.9, h = 0.9;
        const bounds = [x - w * 0.5, y - h * 0.5, w, h];
        const blocks = game.world.getBlocksInRectangle(...bounds);
        for (const block of blocks) {
            if (block.solid) return true;
        }
        return false;
    }

    drawHealthbar(x = 0, y = -0.75, size = 1) {
        if (this.health == this.maxHealth) return;
        if (this.invincibility % 25 > 12.5) return;

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

    performMeleAttack(item) {
        if (!item) item = {
            type: 'fists',
            damage: this.damage,
            range: this.range,
            knockback: this.knockback,
            maxMeleReload: this.maxMeleReload,
            angleOfAttack: this.angleOfAttack
        };

        if (this.reload > 0) return;
        this.reload = item.maxMeleReload;

        const enemies = this.getEnemiesInMeleAttackRange(item);
        for (const enemy of enemies) {
            enemy.takeDamage(item.damage);

            const angle = Math.dirTo(this.x, this.y, enemy.x, enemy.y);
            const knockback = Math.distToMove(item.knockback, angle);
            enemy.move.x += knockback.x;
            enemy.move.y += knockback.y;
        }

        // play sounds
        this.playAttackSound(item, enemies.length > 0);
    }

    playAttackSound(item, hit) {
        if (!hit) {
            game.audioManager.playSound('Whoosh');
            return;
        }
        
        if (item.type == 'axe') game.audioManager.playSound('Axe Hit Flesh');
        else if (item.type == 'machete') game.audioManager.playSound('Machete Hit Flesh');
        else game.audioManager.playSound('Thud Against Flesh');
    }

    getEnemiesInMeleAttackRange(item) {
        const range = item ? item.range : this.range;
        return game.world.env.objects
            .filter(a =>
                Math.distTo(this.x, this.y, a.x, a.y) < range &&
                this.isEnemy(a) &&
                a.invincibility == 0
            )
            .filter(a => {
                const dist = Math.distTo(this.x, this.y, a.x, a.y);
                const dir = Math.dirTo(this.x, this.y, a.x, a.y);
                const lineOfSightBlocked = raycast(this.x, this.y, dir, dist, false, true);
                return !lineOfSightBlocked;
            });
    }

    isEnemy(o) {
        return o !== this;
    }

    takeDamage(amount) {
        if (this.invincibility > 0) return; // can't be damaged
        this.health -= amount;
        this.invincibility = 100; // 0.5s of invincibility after taking damage
    }

    checkIfMovedBlocks() {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        return x !== Math.floor(this.prevX) || y !== Math.floor(this.prevY);
    }
}
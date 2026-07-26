class Bullet extends Entity {
    constructor(shooter, data) {
        super(shooter.x, shooter.y);
        this.type = 'bullet';
        this.normalCollisionsDisabled = true;

        this.health = 1;
        this.maxHealth = 1;

        this.from = shooter;

        const angle = data.angle + Math.random() * data.bulletSpread - data.bulletSpread * 0.5;
        const speed = data.bulletSpeed;

        const move = Math.distToMove(speed, angle);
        this.move = move;
        this.angle = angle;

        this.damage = data.bulletDamage;
        this.knockback = data.bulletKnockback;

        this.decay = 50;
        this.friction = 0;
        this.radius = 0.25;

        delete this.invincibility;
        delete this.accel;
        delete this.accelTarget;
        delete this.range;
        delete this.angleOfAttack;
        delete this.meleReload;
        delete this.maxMeleReload;
    }

    update() {
        this.updateVitals();
        this.updateMotion();

        const blockCollision = this.checkBlockCollisions();
        if (blockCollision) this.impact(blockCollision, false);

        const entityCollision = this.checkEntityCollisions();
        if (entityCollision) this.impact(entityCollision, true);
    }

    checkBlockCollisions() {
        const movedBlocks = this.checkIfMovedBlocks();
        if (!movedBlocks) return false;

        const block = game.world.getBlock(this.x, this.y);
        if (!block || !block.solid) return false;
        return block;
    }

    checkEntityCollisions() {
        for (const o of game.world.env.objects) {
            if (o == this) continue;
            if (o == this.from) continue;
            if (o.type == 'bullet') continue;

            const collided = this.x > o.x - 0.5 && this.y > o.y - 0.5 && this.x < o.x + 0.5 && this.y < o.y + 0.5; // SKIBIDI accurate implement hitboxes here
            if (collided) return o;
        }

        return false;
    }

    impact(collider, entityCollision) {
        if (collider instanceof Entity) { // collided with entity
            collider.takeDamage(this.damage);

            collider.move.x += this.move.x * this.knockback;
            collider.move.y += this.move.y * this.knockback;

            game.music.playSound(`Bullet Hit Flesh.mp3`);

        } else { // collided with block
            game.music.playSound(`Bullet Impact ${Math.round(Math.random() * 2)}.mp3`);
            if (collider.type == 'glass') {
                game.music.playSound('Glass Breaking.mp3');
                collider.solid = false; // break glass
            }
        }

        this.delete = true;
    }

    draw() {
        ctx.strokeStyle = 'rgba(100,100,100,0.25)';
        ctx.lineWidth = 0.1;
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}
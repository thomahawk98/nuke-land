class Zombie extends Entity {
    constructor(x, y) {
        super(x, y);
        this.type = 'zombie';
        this.accel = 0.008;

        this.health = 200;
        this.maxHealth = 200;

        this.detectionRange = 20;
        this.targetPosition = { x, y };

        this.randomWaitTime = Math.round(Math.random() * 500);
        this.urgency = 0.99;

        this.damage = 50;
        this.range = 1.25;
        this.knockback = 0.2;
        this.maxMeleReload = 100;

        this.pathFinder = new PathFinder(this, game.world.pathfindingGrid);
    }

    update() {
        this.updateVitals();
        this.updateTargetToPlayer();
        if (this.randomWaitTime > 0) {
            this.randomWaitTime--;
            if (this.randomWaitTime <= 0) this.pickRandomTarget();
        } else {
            this.updatePathToTarget();
            this.followPath();
        }
        this.updateAcceleration();
        this.updateMotion();

        // update to use item if zombies can hold items
        const enemiesInRange = this.getEnemiesInMeleAttackRange();
        if (enemiesInRange.length !== 0) this.performMeleAttack();

        if (Math.random() < 0.00025) {
            game.music.playSound(`Zombie ${Math.round(Math.random() * 7)}.mp3`, 0.5);
        }

        this.pathFinder.update();
    }

    updateTargetToPlayer() {
        const player = game.getPlayer();
        if (!player) return false;

        const timeOfDay = game.world.getTimeOfDay();
        if (timeOfDay == 'night') {
            this.targetPlayer(player);
            return true;
        }

        // check if the zombie can see the player
        const dist = Math.distTo(this.x, this.y, player.x, player.y);
        if (dist > this.detectionRange) return false;

        const dir = Math.dirTo(this.x, this.y, player.x, player.y);
        const lineOfSightBlocked = raycast(this.x, this.y, dir, dist);
        if (lineOfSightBlocked) return false;

        this.targetPlayer(player);
        return true;
    }

    targetPlayer(player) {
        this.targetPosition.x = player.x;
        this.targetPosition.y = player.y;
        this.randomWaitTime = 0;
        this.urgency = 0.99;
    }

    pickRandomTarget() {
        this.targetPosition.x = this.x + Math.random() * 20 - 10;
        this.targetPosition.y = this.y + Math.random() * 20 - 10;
        this.urgency *= 0.95;
    }

    updatePathToTarget() {
        this.pathFinder.updatePathTo(this.targetPosition.x, this.targetPosition.y);
    }

    followPath() {
        const target = this.pathFinder.getCurrentTargetInPath();

        // pause and wait if reached the end of path
        if (!target) {
            const maxSeconds = (1 - this.urgency) * 1000;
            this.randomWaitTime = Math.round(Math.random() * maxSeconds);
            return;
        }

        // update accelTarget
        const dir = Math.dirTo(this.x, this.y, target.x, target.y);
        const move = Math.distToMove(1, dir);
        this.accelTarget = move;
    }

    draw() {
        ctx.save();
        ctx.rotate(Math.PI);
        ctx.scale(1.5, 1.5);

        ctx.drawImage(images.get('Zombie.png'), -0.5, -0.5, 1, 1);

        ctx.restore();
    }

    isEnemy(o) {
        return o.type == 'player';
    }
}
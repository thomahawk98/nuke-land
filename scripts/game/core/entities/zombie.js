class Zombie extends Entity {
    constructor(x, y) {
        super(x, y);
        this.type = 'zombie';
        this.accel = 0.005;

        this.health = 200;
        this.maxHealth = 200;

        this.detectionRange = 20;
        this.targetPosition = { x, y };

        this.randomWaitTime = Math.round(Math.random() * 500);
        this.urgency = 0.99;

        this.damage = 40;
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
        //if (enemiesInRange.length !== 0) this.performMeleAttack();
    }

    updateTargetToPlayer() {
        const player = game.getPlayer();
        if (!player) return false;

        const dist = Math.distTo(this.x, this.y, player.x, player.y);
        if (dist > this.detectionRange) return false;
        
        const dir = Math.dirTo(this.x, this.y, player.x, player.y);
        const lineOfSightBlocked = raycast(this.x, this.y, dir, dist);
        if(lineOfSightBlocked) return false;

        this.targetPosition.x = player.x;
        this.targetPosition.y = player.y;
        this.randomWaitTime = 0;
        this.urgency = 0.99;
        return true;
    }

    pickRandomTarget() {
        this.targetPosition.x = this.x + Math.random() * 20 - 10;
        this.targetPosition.y = this.y + Math.random() * 20 - 10;
        this.urgency *= 0.95;
    }

    updatePathToTarget() {
        this.pathFinder.getPathTo(this.targetPosition.x, this.targetPosition.y);
    }

    followPath() {
        let target = this.pathFinder.path.steps[2];
        if (!target) target = this.pathFinder.path.steps[1];
        if (!target) {
            const maxSeconds = (1 - this.urgency) * 1000;
            this.randomWaitTime = Math.round(Math.random() * maxSeconds);
            return;
        }

        const dir = Math.dirTo(this.x, this.y, target.x + 0.5, target.y + 0.5);
        const move = Math.distToMove(1, dir);
        this.accelTarget = move;
    }

    draw() {
        ctx.fillStyle = 'rgb(0,200,0)';
        ctx.fillRect(-0.5, -0.5, 1, 1);
        this.drawHealthbar();
    }

    isEnemy(o) {
        return o.type == 'player';
    }
}
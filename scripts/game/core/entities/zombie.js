class Zombie extends Entity {
    constructor(x, y) {
        super(x, y);
        this.type = 'zombie';
        this.accel = 0.005;
        this.detectionRange = 20;
        this.targetPosition = { x, y };

        this.pathFinder = new PathFinder(this, game.world.pathfindingGrid);
    }

    update() {
        this.updateTargetToPlayer();
        this.updatePathToTarget();
        this.followPath();
        this.updateAcceleration();
        this.updateMotion();
    }

    updateTargetToPlayer() {
        const player = game.getPlayer();
        if (!player) return;
        
        const dist = Math.distTo(this.x, this.y, player.x, player.y);
        if (dist > this.detectionRange) return;

        this.targetPosition.x = player.x;
        this.targetPosition.y = player.y;
    }

    updatePathToTarget() {
        this.pathFinder.getPathTo(this.targetPosition.x, this.targetPosition.y);
    }

    followPath() {
        const target = this.pathFinder.path.steps[2];
        if (!target) return;

        const dir = Math.dirTo(this.x, this.y, target.x + 0.5, target.y + 0.5);
        const move = Math.distToMove(1, dir);
        this.accelTarget = move;
    }

    draw() {
        ctx.fillStyle = 'rgb(0,200,0)';
        ctx.fillRect(-0.5, -0.5, 1, 1);
    }
}
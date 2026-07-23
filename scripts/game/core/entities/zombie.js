class Zombie extends Entity {
    constructor(x, y) {
        super(x, y);
        this.type = 'zombie';
        this.accel = 0.005;

        this.pathFinder = new PathFinder(this, game.world.pathfindingGrid);
    }

    update() {
        this.targetPlayer();
        this.updateAcceleration();
        this.updateMotion();
    }

    targetPlayer() {
        const player = game.getPlayer();
        if (!player) return;

        const pathSteps = this.pathFinder.getPathTo(player.x, player.y);
        const target = pathSteps[2];
        if (!target) return;

        const dir = Math.dirTo(this.x, this.y, target.x, target.y);
        const move = Math.distToMove(1, dir);
        this.accelTarget = move;
    }

    draw() {
        ctx.fillStyle = 'rgb(0,200,0)';
        ctx.fillRect(-0.5, -0.5, 1, 1);
    }
}
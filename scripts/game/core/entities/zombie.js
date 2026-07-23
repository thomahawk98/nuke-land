class Zombie extends Entity {
    constructor(x, y) {
        super(x, y);
        this.type = 'zombie';
        
        this.pathFinder = new PathFinder(this, game.world.pathfindingGrid);
    }

    update() {
        this.targetPlayer();
        this.updateAcceleration();
        this.updateMotion();
    }

    targetPlayer() {
        const player = game.getPlayer();
        if(!player) return;

        const pathSteps = this.pathFinder.getPathTo(player.x, player.y);
        const target = pathSteps[1];
        if(!target) return;
        
        this.accelTarget = target;
    }

    draw() {
        ctx.fillStyle = 'rgb(0,200,0)';
        ctx.fillRect(-0.5, -0.5, 1, 1);
    }
}
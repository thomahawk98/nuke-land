class Player extends Entity {
    constructor(user, x, y) {
        super(x, y);
        this.user = user;
        this.type = 'player';

        this.inventory = new Inventory(this);
        this.inventory.open = true;
        user.interface.openInventories.push(this.inventory);

        this.GENERATION_DISTANCE = 5;
        this.RENDER_DISTANCE = 4;
    }

    isObjectInRenderDistance(o) {
        const { x: ox, y: oy } = game.world.chunkManager.getChunkCors(o.x, o.y);
        const { x: px, y: py } = game.world.chunkManager.getChunkCors(this.x, this.y);
        const dx = ox - px;
        const dy = oy - py;
        return dx * dx + dy * dy < this.RENDER_DISTANCE * this.RENDER_DISTANCE;
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

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(-0.5, -0.5, 1, 1);
    }
}
class Player extends Entity {
    constructor(user, x, y) {
        super(x, y);
        this.user = user;
        this.type = 'player';

        this.inventory = new Inventory(this, 4, 3);

        // add random items to player inventory (remove later)
        for (let n = 0; n < this.inventory.width * this.inventory.height; n++) {
            if (Math.random() < 0.5) {
                const count = Math.ceil(Math.random() * 5);
                const item = new Item('test item', { slot: n }, count);
                this.inventory.items[n] = item;
            }
        }
        this.inventory.items[0] = new Item('machete', { slot: 0 });

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
        this.updateAcceleration();
        this.updateMotion();
    }

    updateControls() { // called by user updateControls() function
        if (this.user.keys.down['w']) this.accelTarget.y--;
        if (this.user.keys.down['a']) this.accelTarget.x--;
        if (this.user.keys.down['s']) this.accelTarget.y++;
        if (this.user.keys.down['d']) this.accelTarget.x++;

        // switch inventory slots
        for (let n = 0; n < this.inventory.width; n++) {
            if (this.user.keys.down[n + 1]) {
                this.inventory.selectedSlotIndex = n;
            }
        }

        if (this.user.mouse.left.click) {
            this.attackWithItem();
        }

        if (this.user.mouse.right.click) {
            this.useItem();
        }
    }

    attackWithItem() {
        const item = this.inventory.getSelectedItem();
        if (item.type == 'gun') {
            item.fire();
        } else {
            this.performMeleAttack(item);
        }
    }

    performMeleAttack(item) {
        if (!item) item = {};
        item.type ??= 'fists';
        item.damage ??= 10;
        item.range ??= 2;
        item.knockback ??= 0.25;

        const enemies = this.getEnemiesInMeleAttackRange(item);
        for (const enemy of enemies) {
            enemy.health -= item.damage;

            const angle = Math.dirTo(this.x, this.y, enemy.x, enemy.y);
            const knockback = Math.distToMove(item.knockback, angle);
            enemy.move.x += knockback.x;
            enemy.move.y += knockback.y;
        }
    }

    getEnemiesInMeleAttackRange(item) {
        return game.world.env.objects
            .filter(a => a !== this && Math.distTo(this.x, this.y, a.x, a.y) < item.range);
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(-0.5, -0.5, 1, 1);
    }
}
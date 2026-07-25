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

        this.inventory.items[0] = new Item('axe', { slot: 0 });
        this.inventory.items[1] = new Item('machete', { slot: 1 });
        this.inventory.items[2] = new Item('bat', { slot: 2 });

        this.GENERATION_DISTANCE = 5;
        this.RENDER_DISTANCE = 4;
    }

    isObjectVisible(o) {
        const inRenderDistance = this.isObjectInRenderDistance(o);
        if (!inRenderDistance) return false;

        const angle = Math.dirTo(this.x, this.y, o.x, o.y);
        const distance = Math.distTo(this.x, this.y, o.x, o.y);
        const lineOfSightBlocked = raycast(this.x, this.y, angle, distance);
        if (lineOfSightBlocked) return false;

        return true;
    }

    isObjectInRenderDistance(o) {
        const { x: ox, y: oy } = game.world.chunkManager.getChunkCors(o.x, o.y);
        const { x: px, y: py } = game.world.chunkManager.getChunkCors(this.x, this.y);
        const dx = ox - px;
        const dy = oy - py;
        return dx * dx + dy * dy < this.RENDER_DISTANCE * this.RENDER_DISTANCE;
    }

    update() {
        this.updateVitals();
        this.updateAcceleration();
        this.updateMotion();
        this.inventory.updateItems();

        // prevent the player from being deleted idk
        this.delete = false;
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

    useItem() {

    }

    getEnemiesInMeleAttackRange(item) {
        return game.world.env.objects
            .filter(a => {
                // check if object is an enemy
                const isEnemy = this.isEnemy(a);
                if (!isEnemy) return false;

                // check if enemy is outside of range
                const dist = Math.distTo(this.x, this.y, a.x, a.y);
                if (dist > item.range) return false;

                // check if enemy is outside angle of attack
                const world = this.user.getMouseWorldCors();
                const angleOfAttack = item.angleOfAttack || this.angleOfAttack;
                const angle = Math.dirTo(this.x, this.y, a.x, a.y);
                const angleToMouse = Math.dirTo(this.x, this.y, world.x, world.y);
                const angleDifference = Math.abs(Math.turn(angle, angleToMouse));
                if (angleDifference > angleOfAttack) return false;

                // yay!
                return true;
            });
    }

    updateLineOfSight() {
        const distance = 60;
        const amount = 360;
        const lightStrength = 0.5 + 0.5 * game.world.daylight;
        for (let n = 0; n < amount; n++) {
            const angle = 360 / amount * n;
            const blocks = raycast(Math.round(this.x), Math.round(this.y), angle, distance, true);
            for (let n = 0; n < blocks.length; n++) {
                const block = blocks[n];
                if(!block) continue;
                const light = Math.pow(lightStrength, n);
                block.light += light;
            }
        }
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(-0.5, -0.5, 1, 1);
        this.drawHealthbar();
    }
}
class Player extends Entity {
    constructor(user, x, y) {
        super(x, y);
        this.user = user;
        this.type = 'player';

        this.inventory = new Inventory(this, 4, 3);
        /*
        this.inventory.items[0] = new Item('machete', { slot: 0 });
        this.inventory.items[1] = new Item('food', { slot: 1 }, 4);
        */
        const gun = new Item('pistol', { slot: 0 });
        gun.ammo = Infinity;
        this.inventory.items[0] = gun;
        //this.inventory.items[1] = new Item('ammo', { slot: 1 }, 4);


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
        if (this.dead) {
            if (!game.gameOver) {
                game.gameOver = true;
                game.timeAtGameFinish = game.t;
            }
            return;
        }

        this.updateVitals();
        this.updateAcceleration();
        this.updateMotion();
        this.inventory.updateItems();

        // prevent the player from being deleted idk
        this.delete = false;
        const world = this.user.getMouseWorldCors();
        this.angle = Math.dirTo(this.x, this.y, world.x, world.y);
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

        if (this.user.keys.up[' ']) {
            // open all doors in player's vacinity
            const RANGE = 3;
            for (let x = -RANGE; x <= RANGE; x++) {
                for (let y = -RANGE; y <= RANGE; y++) {
                    // check if a block exists and if it's a door
                    const block = game.world.getBlock(this.x + x, this.y + y);
                    if (!block || block.type !== 'door') continue;

                    // check if door is outside opening range
                    const dist = Math.distTo(0, 0, x, y);
                    if (dist > RANGE) continue;

                    block.solid = !block.solid;
                    game.world.setBlock(this.x + x, this.y + y, block);
                }
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
        this.performMeleAttack(item);
    }

    useItem() {
        if (this.reload > 0) return;
        const item = this.inventory.getSelectedItem();
        if (!item) return;
        if (item.type == 'pistol' || item.type == 'shotgun') this.shootGun(item);
        if (item.type == 'food') this.eat(item);
    }

    shootGun(item) {
        if (item.ammo <= 0) {
            if (item.type == 'pistol') game.audioManager.playSound('Pistol Empty');
            if (item.type == 'shotgun') game.audioManager.playSound('Shotgun Empty');
            return;
        }

        const world = this.user.getMouseWorldCors();
        const angle = Math.dirTo(this.x, this.y, world.x, world.y);

        // fire the gun's bullets
        for (let n = 0; n < item.numberOfBullets; n++) {
            const data = {
                angle: angle,
                bulletSpread: item.bulletSpread,
                bulletSpeed: item.bulletSpeed,
                bulletDamage: item.bulletDamage,
                bulletKnockback: item.bulletKnockback,
            }

            const bullet = new Bullet(this, data);
            game.world.env.objects.push(bullet);
        }

        item.ammo--;
        this.reload = item.maxRangedReload;

        if (item.type == 'pistol') game.audioManager.playSound('Pistol Firing');
        else if (item.type == 'shotgun') {
            game.audioManager.playSound('Shotgun Firing');
            game.audioManager.playSound('Shotgun Reloading');
        }
        else game.audioManager.playSound('Gun Firing');
    }

    eat(item) {
        const healing = item.nourishment || 25;
        this.health = Math.min(this.health + healing, this.maxHealth);
        item.count--;

        if (item.count <= 0) {
            item.delete = true;
            return;
        }
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
            })
            .filter(a => {
                const dist = Math.distTo(this.x, this.y, a.x, a.y);
                const dir = Math.dirTo(this.x, this.y, a.x, a.y);
                const lineOfSightBlocked = raycast(this.x, this.y, dir, dist, false, true);
                return !lineOfSightBlocked;
            });;
    }

    updateLineOfSight() {
        const distance = 60;
        const amount = 360;
        const lightStrength = 0.5 + 0.5 * game.world.daylight;
        for (let n = 0; n < amount; n++) {
            const angle = 360 / amount * n;
            const blocks = raycast(Math.floor(this.x), Math.floor(this.y), angle, distance, true);
            for (let n = 0; n < blocks.length; n++) {
                const block = blocks[n];
                if (!block) continue;
                const light = Math.pow(lightStrength, n);
                block.light += light;
            }
        }
    }

    draw() {
        ctx.save();
        ctx.scale(1.5, 1.5);

        ctx.drawImage(images.get('Player.png'), -0.5, -0.5, 1, 1);

        ctx.restore();

        if (!this.dead) this.drawItem();
    }

    drawItem() {
        const item = this.inventory.getSelectedItem();
        if (!item) return;

        const HAND_OFFSET = {
            x: 0.35, y: -0.45
        }

        ctx.save();
        ctx.rotate(this.getItemAngleOffset(item) * Math.PI / 180);
        ctx.translate(0, -0.5); // grip point
        ctx.rotate(this.getReloadAngleOffset(item) * Math.PI / 180);
        ctx.translate(HAND_OFFSET.x, HAND_OFFSET.y); // player hand position
        ctx.scale(0.02, 0.02);

        item.draw();

        ctx.restore();
    }

    getReloadAngleOffset(item) {
        const itemReload = !item ? this.maxMeleReload :
            item.type == 'shotgun' || item.type == 'pistol' ? item.maxRangedReload : item.maxMeleReload;
        const percent = this.reload / itemReload;

        return percent * 90;
    }

    getItemAngleOffset(item) {
        switch (item.type) {
            case 'axe':
            case 'machete':
            case 'bat':
                return -45;

            case 'pistol':
            case 'shotgun':
                return -45;

            default:
                return 0;
        }
    }
}
class Item {
    constructor(type, data, count = 1, inventory = true) {
        this.type = type;
        this.count = count;

        if (inventory) {
            this.slot = data.slot;
        } else {
            this.x = data.x;
            this.y = data.y;
        }

        const stats = Item.getStatsForType(type);
        for (const [key, value] of Object.entries(stats)) {
            this[key] = value;
        }

        this.damage ??= 1;
        this.range ??= 2;
        this.knockback ??= 0.2;
        this.maxMeleReload ??= 50;
    }

    static getStatsForType(type) {
        // get standard stats
        const stats = {
            maxStackSize: Item.getMaxStackSizeForType(type),
        };

        // get miscellaneous stats
        const miscStats = Item.getMiscStatsForType(type);
        for (const [key, value] of Object.entries(miscStats)) {
            stats[key] = value;
        }

        return stats;
    }

    static getMaxStackSizeForType(type) {
        switch (type) {
            case 'machete':
            case 'axe':
            case 'bat':
            case 'pistol':
            case 'shotgun':
                return 1;
            default: return 16;
        }
    }

    static getMiscStatsForType(type) {
        switch (type) {
            case 'test item':
                return {
                    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                };
            case 'machete':
                return {
                    damage: 35,
                    knockback: 0.25,
                    range: 4.5,
                    maxMeleReload: 75,
                    angleOfAttack: 45,
                };
            case 'axe':
                return {
                    damage: 65,
                    knockback: 0.35,
                    range: 3.5,
                    maxMeleReload: 150,
                    angleOfAttack: 75,
                };
            case 'bat':
                return {
                    damage: 25,
                    knockback: 0.5,
                    range: 3.5,
                    maxMeleReload: 100,
                    angleOfAttack: 90,
                };
            case 'pistol':
                return {
                    bulletDamage: 50,
                    bulletKnockback: 0.2,
                    bulletSpeed: 0.5,
                    bulletSpread: 2,
                    numberOfBullets: 1,
                    maxRangedReload: 25,
                    range: 10,
                    ammo: 12,
                    maxAmmo: 12
                };
            case 'shotgun':
                return {
                    bulletDamage: 25,
                    bulletKnockback: 0.15,
                    bulletSpeed: 0.35,
                    bulletSpread: 30,
                    numberOfBullets: 6,
                    maxRangedReload: 100,
                    range: 7,
                    ammo: 8,
                    maxAmmo: 8
                };
            default: return {}
        }
    }

    update() {

    }

    draw() {
        if (this.type == 'axe') {
            ctx.drawImage(images.get('Axe.png'), -25, -25, 50, 50);
        } else if (this.type == 'machete') {
            ctx.drawImage(images.get('Machete.png'), -25, -25, 50, 50);
        } else if (this.type == 'bat') {
            ctx.drawImage(images.get('Bat.png'), -25, -25, 50, 50);
        } else if (this.type == 'shotgun') {
            ctx.drawImage(images.get('Shotgun.png'), -25, -25, 50, 50);
        } else if (this.type == 'pistol') {
            ctx.drawImage(images.get('Pistol.png'), -25, -25, 50, 50);
        } else if (this.type == 'food') {
            ctx.drawImage(images.get('Food.png'), -25, -25, 50, 50);
        } else if (this.type == 'ammo') {
            if (this.subtype == 'shotgun') ctx.drawImage(images.get('Shotgun Ammo.png'), -25, -25, 50, 50);
            if (this.subtype == 'pistol') ctx.drawImage(images.get('Pistol Ammo.png'), -25, -25, 50, 50);
        } else {
            ctx.fillStyle = this.color ? this.color : 'red';
            ctx.fillRect(-25, -25, 50, 50);
        }
    }

    drawCount() {
        const x = 20, y = -20;

        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'black';
        ctx.fillRect(-10, -10, 20, 20);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.count, 0, 0)

        ctx.restore();
    }


    drawAmmoCount() {
        const x = 0, y = 20;

        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'black';
        ctx.fillRect(-15, -10, 30, 20);

        ctx.fillStyle = this.ammo > 0 ? 'white' : 'red';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.ammo, 0, 0)

        ctx.restore();
    }
}
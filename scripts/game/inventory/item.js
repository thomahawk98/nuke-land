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
                return 1;
            default: return 99;
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
                    color: 'silver',
                    damage: 25,
                    knockback: 0.35,
                    range: 4.5,
                };
            case 'axe':
                return {
                    color: 'red',
                    damage: 50,
                    knockback: 0.5,
                    range: 3.5,
                    maxMeleReload: 100,
                };
            default: return {}
        }
    }

    update() {
    }

    draw() {
        ctx.fillStyle = this.color ? this.color : 'red';
        ctx.fillRect(-25, -25, 50, 50);

        if (this.count !== 1) this.drawCount();
    }

    drawCount() {
        const x = 20, y = -20;

        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'black';
        ctx.fillRect(-10, -10, 20, 20);

        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.count, 0, 0)

        ctx.restore();
    }
}
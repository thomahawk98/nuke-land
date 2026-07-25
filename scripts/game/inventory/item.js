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
                    range: 4,
                };
            default: return {}
        }
    }

    draw() {
        ctx.fillStyle = this.color ? this.color : 'red';
        ctx.fillRect(-25, -25, 50, 50);

        if (this.count !== 1) {
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
}
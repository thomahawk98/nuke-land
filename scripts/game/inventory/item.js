class Item {
    constructor(inventory = false, data) {
        for (const [key, value] of Object.entries(data)) {
            this[key] = value;
        }
    }

    draw() {
        if (this.type == 'test item') ctx.fillStyle = this.color;
        ctx.fillRect(-25, -25, 50, 50);
    }
}
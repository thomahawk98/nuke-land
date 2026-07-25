class Interface {
    constructor(user) {
        this.user = user;
        this.inventoryManager = new InventoryManager();
    }

    update() {
        this.inventoryManager.update();
    }

    draw() {
        this.inventoryManager.draw();
        this.drawPlayerHotbar();
    }

    drawPlayerHotbar() {
        const player = game.getPlayer();
        if (!player || !player.inventory) return;

        const inventory = player.inventory;

        ctx.save();
        ctx.translate(canvas.width * 0.5, canvas.height + inventory.totalHeight * 0.5 - inventory.spacing);
        ctx.globalAlpha = 1 - inventory.animation;

        // draw only the items up to the inventory.width
        for (let n = 0; n < inventory.width; n++) {
            const cors = inventory.getLocalSlotCors(n);
            const selected = n == inventory.selectedSlotIndex;

            ctx.save();
            ctx.translate(cors.x, cors.y);

            inventory.drawSlot(selected);
            inventory.drawItem(n, selected);

            ctx.restore();
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }
}
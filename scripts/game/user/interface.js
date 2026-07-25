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
            if (selected) this.drawMeleReloadOverlay(player);

            ctx.restore();
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawMeleReloadOverlay(player) {
        const item = player.inventory.getSelectedItem();
        const percent = player.meleReload / (item.maxMeleReload || 100);

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.rect(-40, -40, 80, 80);
        ctx.closePath();

        ctx.save();
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 60, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * percent);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
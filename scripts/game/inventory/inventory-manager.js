class InventoryManager {
    constructor() {
        this.openInventories = [];
    }

    update() {
        for (const inventory of this.openInventories) {
            inventory.update();
        }

        // filter out inventories that arent open and animation is 0
        this.openInventories = this.openInventories.filter(a => a.open || a.animation > 0);
    }

    toggle() {
        if (this.openInventories.length == 0) {
            const player = game.getPlayer();
            if (!player) return;

            this.openInventory(player.inventory);
        } else {
            for (const inventory of this.openInventories) {
                this.closeInventory(inventory);
            }
        }
    }

    openInventory(inventory) {
        if (!inventory) return;

        inventory.open = true;
        inventory.animation = 0;
        this.openInventories.push(inventory);
    }

    closeInventory(inventory) {
        inventory.open = false;
        inventory.animation = 1;
    }

    draw() {
        for (const inventory of this.openInventories) {
            inventory.draw();
        }
    }
}
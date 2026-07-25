class InventoryManager {
    constructor() {
        this.displayedInventories = [];
        this.itemHeldByMouse = false;
    }

    update() {
        for (const inventory of this.displayedInventories) {
            inventory.update();
        }

        // filter out inventories that arent open and animation is 0
        this.displayedInventories = this.displayedInventories
            .filter(a => a.open || a.animation > 0);
    }

    updateControls() { // called by user updateControls() function
        const mouseIndexes = this.getMouseInventoryAndSlotIndexes();
        if (mouseIndexes === false) return; // SKIBIDI change this later

        // get item under mouse
        const [mouseInventoryIndex, mouseSlotIndex] = mouseIndexes;
        const itemUnderMouse = this.displayedInventories[mouseInventoryIndex].items[mouseSlotIndex];

        const player = game.getPlayer();
        if (!player) return;

        // move items around with keys
        for (let n = 0; n < player.inventory.width; n++) {
            const key = n + 1;
            if (user.keys.up[key]) {
                this.displayedInventories[mouseInventoryIndex].items[mouseSlotIndex] = player.inventory.items[n];
                player.inventory.items[n] = itemUnderMouse;
            }
        }

        if (user.mouse.left.click) {
            this.displayedInventories[mouseInventoryIndex].items[mouseSlotIndex] = this.itemHeldByMouse;
            this.itemHeldByMouse = itemUnderMouse;
        }
    }

    getMouseInventoryAndSlotIndexes() {
        for (let n = 0; n < this.displayedInventories.length; n++) {
            const inventory = this.displayedInventories[n];

            const lx = user.mouse.x - inventory.x;
            const ly = user.mouse.y - inventory.y;

            const index = inventory.getIndexFromLocalCors(lx, ly);
            if (index === false) continue; // mouse is not inside this inventory

            return [n, index];
        }
        return false;
    }

    toggle(player) {
        const openInventoryCount = this.getOpenInventoryCount();
        if (openInventoryCount > 0) {
            this.closeAllInventories();
        } else {
            this.openInventory(player.inventory);

            // open all chests in player's vacinity
            const RANGE = 5;
            for (let x = -RANGE; x <= RANGE; x++) {
                for (let y = -RANGE; y <= RANGE; y++) {
                    // check if a block exists and if it's a chest
                    const block = game.world.getBlock(player.x + x, player.y + y);
                    if (!block || block.type !== 'chest') continue;

                    // check if chest is outside opening range
                    const dist = Math.distTo(0, 0, x, y);
                    if (dist > RANGE) continue;

                    if (!block.inventory) console.log(`chest: ${block} does not have an inventory`);
                    this.openInventory(block.inventory);
                }
            }
        }
    }

    getOpenInventoryCount() {
        let count = 0;
        for (const inventory of this.displayedInventories) {
            if (inventory.open) count++;
        }
        return count;
    }

    closeAllInventories() {
        for (const inventory of this.displayedInventories) {
            this.closeInventory(inventory);
        }
    }

    closeInventory(inventory) {
        inventory.open = false;
    }

    openInventory(inventory) {
        if (!inventory) return;

        inventory.open = true;
        if (!this.displayedInventories.includes(inventory)) this.displayedInventories.push(inventory);
    }

    draw() {
        for (const inventory of this.displayedInventories) {
            inventory.draw();
        }

        if (this.itemHeldByMouse) {
            const item = this.itemHeldByMouse;
            ctx.save();
            ctx.translate(user.mouse.x, user.mouse.y);
            ctx.scale(1.1, 1.1);

            item.draw();

            ctx.restore();
        }

        // test mouse index function

        /*
        const mouseIndexes = this.getMouseInventoryAndSlotIndexes();
        if(!mouseIndexes) return;

        const inventory = this.displayedInventories[mouseIndexes[0]];
        const localCors = inventory.getLocalSlotCors(mouseIndexes[1]);
        const x = inventory.x + localCors.x - inventory.size * 0.5;
        const y = inventory.y + localCors.y - inventory.size * 0.5;

        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.fillRect(x, y, inventory.size, inventory.size);
        */
    }
}
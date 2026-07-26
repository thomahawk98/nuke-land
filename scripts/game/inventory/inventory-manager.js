class InventoryManager {
    constructor() {
        this.displayedInventories = [];
        this.itemHeldByMouse = false;
    }

    update() {
        // sort player inventories to the bottom
        this.displayedInventories = this.displayedInventories
            .sort((a, b) => {
                const aValue = a.container.type == 'player' ? 1 : 0;
                const bValue = b.container.type == 'player' ? 1 : 0;
                return aValue - bValue;
            });

        // space inventories evenly on the y axis
        this.spaceInventories();

        // update all the inventories
        for (const inventory of this.displayedInventories) {
            inventory.update();
        }

        // filter out inventories that arent open and animation is 0
        this.displayedInventories = this.displayedInventories
            .filter(a => a.open || a.animation > 0);
    }

    spaceInventories(cx = canvas.width * 0.5, cy = canvas.height * 0.5, gap = 50) {
        const contentHeight =
            this.displayedInventories.reduce((sum, inv) => sum + inv.totalHeight, 0) +
            gap * (this.displayedInventories.length - 1);

        // top of the entire stack
        let y = cy - contentHeight * 0.5;

        for (const inventory of this.displayedInventories) {
            // position inventory by its center
            inventory.openCors.x = cx;
            inventory.openCors.y = y + inventory.totalHeight * 0.5;

            // advance to the next inventory
            y += inventory.totalHeight + gap;
        }
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
            const RANGE = 3;
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

        this.drawHoveredItemDescription();
    }

    drawHoveredItemDescription() {
        const mouseIndexes = this.getMouseInventoryAndSlotIndexes();
        const inventory = this.displayedInventories[mouseIndexes[0]];
        if(!inventory) return;

        const item = inventory.items[mouseIndexes[1]];
        if(!item) return;

        ctx.save();
        ctx.translate(user.mouse.x, user.mouse.y);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 100, 40);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.f(20);
        ctx.fillStyle = 'white';
        ctx.fillText(item.type.charAt(0).toUpperCase() + item.type.slice(1), 50, 20);

        ctx.restore();
    }
}
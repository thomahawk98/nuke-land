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
        const player = game.getPlayer();
        if (!player) return;

        // move items around with keys
        for (let n = 0; n < player.inventory.width; n++) {
            const key = n + 1;
            if (user.keys.up[key]) {
                // swap locations
                const item = player.inventory.items[n];
                const itemUnderMouse = this.getItemUnderMouse();
                this.setItemUnderMouse(item);
                player.inventory.items[n] = itemUnderMouse;
            }
        }

        if (user.mouse.left.click) {
            // swap locations
            const item = this.itemHeldByMouse;
            const itemUnderMouse = this.getItemUnderMouse();
            this.setItemUnderMouse(item);
            this.itemHeldByMouse = itemUnderMouse;
        }
    }

    setItemUnderMouse(item) {
        const mouseIndexes = this.getMouseInventoryAndSlotIndexes();
        if (mouseIndexes === false) return false;

        const [inventoryIndex, slotIndex] = mouseIndexes;
        this.displayedInventories[inventoryIndex].items[slotIndex] = item;
    }

    getItemUnderMouse(item) {
        const mouseIndexes = this.getMouseInventoryAndSlotIndexes();
        if (mouseIndexes === false) return false;

        const [inventoryIndex, slotIndex] = mouseIndexes;
        return this.displayedInventories[inventoryIndex].items[slotIndex];
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
        if (!this.displayedInventories.includes(inventory))
            this.displayedInventories.push(inventory);
    }

    getBestIndexForItemInInventory(inventory, item) {
        // compile a list of available slots
        const takenSlots = inventory.items.filter(o => !inventory.itemsMergable(o, item)).map(a => a = a.slot); // indexes occupied by other unmergable items
        let availableSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].filter(a => !takenSlots.includes(a));

        //remove the slots in the same row as the item if empty slots in other rows exist
        if (item.slot !== "just picked up") {
            const filteredSlots = availableSlots.filter(a => Math.floor(a / inventory.width) !== Math.floor(item.slot / inventory.width));
            if (filteredSlots.length > 0) availableSlots = filteredSlots;
        }

        if (availableSlots.length <= 0) return false; // can't move item anywhere

        // compile a lidt of available merges
        availableSlots = availableSlots.sort((a, b) => a - b);
        const availableMerges = [];
        for (var slot of availableSlots) {
            var itemInSlot = inventory.items.find(a => a.slot == slot);
            if (itemInSlot) availableMerges.push(slot);
        }

        // choose combining with another item over jumping to a new slot
        const slots = availableMerges.length > 0 ? availableMerges : availableSlots;
        return slots[0]; // this is the best slot in this inventory for this item
    };

    tryCombining(o1, o2) {
        if (this.itemsMergable(o1, o2)) {
            this.mergeItems(o1, o2);
            return true;
        } else if (this.canBeLoaded(o1, o2)) {
            this.loadAmmo(o1, o2);
            return true;
        }
        return false;
    };

    itemsMergable(o1, o2) {
        return (
            o1 && o2 &&
            o1.type == o2.type &&
            o1.slot !== o2.slot &&
            o1.count < Items.getMaxStackSizeForType(o1.type)
        )
    };

    mergeItems(item1, item2) { // this is the same function as load ammo?!?
        var maxStackSize = Item.getMaxStackSizeForType(item1.type);
        var amountTransfered = Math.min(maxStackSize - item1.count, item2.count);
        // don't transfer more than the stack can hold, or more than the item has

        item1.count += amountTransfered;
        item2.count -= amountTransfered;

        if (item2.count > 0) return false; // the whole stack was not transferred

        item2.delete = true;
        return true; // the whole stack was transfered
    };

    canBeLoaded(gun, ammo) {
        if (!gun || !gun) return false;
        var compatible = this.getGunAmmoCompatibility(o1, o2);
        if (!compatible) return false;

        //are there less bullets than gun max bullet capacity?
        if (gun.ammo >= (gun.maxCapacity || 99)) return false;
        else return true;
    };

    getGunAmmoCompatibility(gun, ammo) {
        if (ammo.type !== "ammo") return false;
        if (gun.type !== "shotgun" && loader.type !== 'pistol') return false;
        if (ammo.subtype !== gun.type) return false; // incompatible ammo
        return true; // yay!
    };

    loadAmmo(gun, ammo) {
        var maxCapacity = gun.maxCapacity || 99;
        var amountTransfered = Math.min(maxCapacity - gun.ammo, ammo.count); //don't transfer more than the stack can hold, or more than the item has

        item.count += amountTransfered;
        ammo.count -= amountTransfered;

        if (ammo.count > 0) return false; // the whole stack was not transferred

        ammo.delete = true;
        return true; // the whole stack was transfered
    };

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
        if (!inventory) return;

        const item = inventory.items[mouseIndexes[1]];
        if (!item) return;

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
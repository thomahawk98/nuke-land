class InventoryManager {
    constructor() {
        this.displayedInventories = [];
        this.itemHeldByMouse = false;
    }

    update() {
        if (this.itemHeldByMouse.delete) this.itemHeldByMouse = false;

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

        this.updateMouseLeft();
    }

    updateMouseLeft() {
        if (user.mouse.left.click) {
            if (user.keys.down['Shift']) {
                const itemUnderMouse = this.getItemUnderMouse();
                if (itemUnderMouse == null) return;

                const mouseIndexes = this.getMouseInventoryAndSlotIndexes();
                this.moveItemToBestIndex(itemUnderMouse, mouseIndexes[0], mouseIndexes[1]);
            } else {
                this.swapMouseItems();
            }
        }
    }

    moveItemToBestIndex(item, currentInventoryIndex, currentIndex) {
        const inventory = this.displayedInventories[currentInventoryIndex];
        if (!inventory || !item) return false;

        // Keep merging while there are compatible stacks.
        while (item.count > 0) {
            const bestIndex = this.getBestIndexForItem(
                item,
                inventory,
                currentIndex
            );

            if (bestIndex === undefined) {
                // No more places to put the item.
                return false;
            }

            const destination = inventory.items[bestIndex];

            if (destination) {
                // Merge into an existing stack.
                const fullyMerged = this.mergeItems(destination, item);

                if (fullyMerged) {
                    // Entire item was transferred.
                    inventory.items[currentIndex] = false;
                    return true;
                }

                // Partial merge.
                // DO NOT change currentIndex.
                // The original item is still located at currentIndex.
                continue;
            }

            // Move the remaining item into an empty slot.
            inventory.items[currentIndex] = false;
            inventory.items[bestIndex] = item;

            return true;
        }

        return false;
    }


    getBestIndexForItem(item, inventory, currentIndex = undefined) {
        if (!inventory || !item) return undefined;

        const itemRow =
            currentIndex === undefined
                ? undefined
                : this.getRow(currentIndex, inventory);

        let firstMergeable = undefined;
        let firstEmpty = undefined;
        let firstEmptySameRow = undefined;

        for (let n = 0; n < inventory.items.length; n++) {
            const other = inventory.items[n];

            // Never select the slot the item currently occupies.
            if (n === currentIndex) continue;

            if (other) {
                if (
                    firstMergeable === undefined &&
                    this.itemsMergeable(other, item)
                ) {
                    // Prefer mergeable slots outside the current row.
                    if (
                        itemRow === undefined ||
                        this.getRow(n, inventory) !== itemRow
                    ) {
                        return n;
                    }

                    firstMergeable = n;
                }

                continue;
            }

            // Empty slot.
            if (firstEmpty === undefined) {
                firstEmpty = n;
            }

            // Remember an empty slot in the same row as a fallback.
            if (
                firstEmptySameRow === undefined &&
                itemRow !== undefined &&
                this.getRow(n, inventory) === itemRow
            ) {
                firstEmptySameRow = n;
            }

            // Prefer empty slots outside the current row.
            if (
                itemRow === undefined ||
                this.getRow(n, inventory) !== itemRow
            ) {
                return n;
            }
        }

        // Fall back to a mergeable slot in the same row.
        if (firstMergeable !== undefined) {
            return firstMergeable;
        }

        // Then an empty slot in the same row.
        if (firstEmptySameRow !== undefined) {
            return firstEmptySameRow;
        }

        // Finally, any empty slot.
        return firstEmpty;
    }

    getRow(index, inventory) {
        return Math.floor(index / inventory.width);
    }

    swapMouseItems() {
        // swap locations
        const item = this.itemHeldByMouse;
        const itemUnderMouse = this.getItemUnderMouse();
        if (itemUnderMouse == null) return false;

        const combined = this.tryCombining(itemUnderMouse, item);
        if (!combined) {
            this.setItemUnderMouse(item);
            this.itemHeldByMouse = itemUnderMouse;
        }
    }

    setItemUnderMouse(item) {
        const mouseIndexes = this.getMouseInventoryAndSlotIndexes();
        if (mouseIndexes === false) return null;

        const [inventoryIndex, slotIndex] = mouseIndexes;
        this.displayedInventories[inventoryIndex].items[slotIndex] = item;
    }

    getItemUnderMouse(item) {
        const mouseIndexes = this.getMouseInventoryAndSlotIndexes();
        if (mouseIndexes === false) return null;

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

                    const dir = Math.dirTo(0, 0, x, y);
                    const lineOfSightBlocked = raycast(player.x, player.y, dir, dist, false, true);
                    if (lineOfSightBlocked && lineOfSightBlocked !== block) continue;

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

    tryCombining(o1, o2) {
        if (this.itemsMergeable(o1, o2)) {
            this.mergeItems(o1, o2);
            return true;
        } else if (this.canBeLoaded(o1, o2)) {
            this.loadAmmo(o1, o2);
            return true;
        }
        return false;
    };

    itemsMergeable(o1, o2) {
        return (
            o1 && o2 &&
            o1.type == o2.type &&
            o1.subtype == o2.subtype &&
            o1.count < Item.getMaxStackSizeForType(o1.type)
        );
    };

    mergeItems(item1, item2) {
        var maxStackSize = Item.getMaxStackSizeForType(item1.type);
        var amountTransfered = Math.min(maxStackSize - item1.count, item2.count);

        item1.count += amountTransfered;
        item2.count -= amountTransfered;

        return item2.count <= 0;
    };

    canBeLoaded(gun, ammo) {
        if (!gun || !ammo) return false;
        var compatible = this.getGunAmmoCompatibility(gun, ammo);
        //console.log(compatible, gun, ammo)
        if (!compatible) return false;

        //are there less bullets than gun max bullet capacity?
        if (gun.ammo >= gun.maxAmmo) return false;
        else return true;
    };

    getGunAmmoCompatibility(gun, ammo) {
        if (ammo.type !== "ammo") return false;
        if (gun.type !== "shotgun" && gun.type !== 'pistol') return false;
        if (ammo.subtype !== gun.type) return false; // incompatible ammo
        return true; // yay!
    };

    loadAmmo(gun, ammo) {
        var amountTransfered = Math.min(gun.maxAmmo - gun.ammo, ammo.count); //don't transfer more than the stack can hold, or more than the item has

        gun.ammo += amountTransfered;
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

        const h = item.subtype ? 55 : 40;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 100, h);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.f(20);
        ctx.fillText(item.type.charAt(0).toUpperCase() + item.type.slice(1), 50, 20);
        if (item.subtype) {
            ctx.f(14);
            ctx.fillText(item.subtype, 50, 40);
        }

        ctx.restore();
    }
}
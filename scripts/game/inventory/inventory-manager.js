class InventoryManager {
    constructor() {
        this.displayedInventories = [];
        this.itemHeldByMouse = false;
    }

    update() {
        if (this.itemHeldByMouse.delete || this.itemHeldByMouse.count <= 0) this.itemHeldByMouse = false;

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
        if (!item) return false;

        const currentInventory = this.displayedInventories[currentInventoryIndex];

        // Search every other inventory first.
        const inventorySearchList = this.displayedInventories
            .sort((a, b) => {
                const aScore = a.container.type === 'player' ? 0 : 1;
                const bScore = b.container.type === 'player' ? 0 : 1;
                return aScore - bScore;
            })
            .filter(inventory => inventory !== currentInventory);

        // First try to merge into existing stacks.
        for (const inventory of inventorySearchList) {
            const fullyMerged = this.mergeItemInInventory(item, inventory);

            if (fullyMerged) {
                if (currentInventory) {
                    currentInventory.items[currentIndex] = false;
                }

                return true;
            }
        }

        // Then try to move the remaining stack into an empty slot.
        for (const inventory of inventorySearchList) {
            const movedSuccessfully = this.moveItemIntoInventory(item, inventory);

            if (movedSuccessfully) {
                if (currentInventory) {
                    currentInventory.items[currentIndex] = false;
                }

                return true;
            }
        }

        // Finally search the original inventory.
        if (!currentInventory) return false;

        const fullyMerged = this.mergeItemInInventory(item, currentInventory);
        if (fullyMerged) {
            currentInventory.items[currentIndex] = false;
            return true;
        }

        const movedSuccessfully = this.moveItemIntoInventory(item, currentInventory, currentIndex);
        if (movedSuccessfully) {
            currentInventory.items[currentIndex] = false;
            return true;
        }

        return false;
    }


    mergeItemInInventory(item, inventory) {
        for (let n = 0; n < inventory.items.length; n++) {
            const destination = inventory.items[n];

            if (!destination) continue;
            if (!this.itemsMergeable(destination, item)) continue;

            const fullyMerged = this.mergeItems(destination, item);

            if (fullyMerged) {
                return true;
            }
        }

        return false;
    }


    moveItemIntoInventory(item, inventory, currentIndex = -1) {
        const currentRow =
            currentIndex === -1
                ? -1
                : Math.floor(currentIndex / inventory.width);

        // First try slots outside the current row.
        for (let n = 0; n < inventory.items.length; n++) {
            const destination = inventory.items[n];

            if (destination) continue;

            const destinationRow = Math.floor(n / inventory.width);

            if (destinationRow === currentRow) continue;

            // Move the actual Item instance.
            inventory.items[n] = item;

            return true;
        }

        // If this is a move from an existing inventory,
        // allow the same row as a fallback.
        if (currentIndex !== -1) {
            for (let n = 0; n < inventory.items.length; n++) {
                const destination = inventory.items[n];

                if (destination) continue;

                inventory.items[n] = item;

                return true;
            }
        }

        return false;
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

            // open the closest chest
            const chest = player.getNearestChest();
            if (chest) {
                if (!chest.inventory) console.log(`chest: ${chest} does not have an inventory`);
                this.openInventory(chest.inventory);
            }
            
            // open all nearby chests
            /*
        const chests = player.getNearbyChests();
        for (const chest of chests) {
            this.openInventory(chest.chest.inventory);
        }
            */
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
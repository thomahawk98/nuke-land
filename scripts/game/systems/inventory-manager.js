class InventoryManager {
    constructor() {
        this.openInventories = [];
    }

    update() {

    }

    draw() {
        for (const inventory of this.openInventories) {
            inventory.draw();
        }
    }
}
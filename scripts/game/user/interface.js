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
    }
}
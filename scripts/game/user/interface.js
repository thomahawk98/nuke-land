class Interface {
    constructor(user) {
        this.user = user;
        this.openInventories = [];
    }
    
    update() {
    }

    draw() {
        for(const inventory of this.openInventories) {
            inventory.draw();
        }
    }
}
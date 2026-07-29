class User {
    constructor(canvas) {
        this.mouse = new MouseTracker(canvas);
        this.keys = new KeyTracker();
        this.cam = new Camera(canvas, this);
        this.interface = new Interface(this);
    }

    tick() {
        this.update();
        this.draw();
    }

    update() {
        this.cam.update();
        this.interface.update();
        this.updateControls();
    }

    updateControls() {
        const player = game.getPlayer();
        if (!player) return; // console.error('player not defined');
        
        // toggle player inventory
        if (this.keys.up['e']) {
            this.interface.inventoryManager.toggle(player);
        }

        // close all inventories
        if (this.keys.up['esc']) {
            this.interface.inventoryManager.closeAllInventories();
        }

        if(this.keys.up['Control']) {
            game.debug = !game.debug;
        }

        // pass controls onto player or inventory manager depending on if an inventory is open
        const anyInventoryOpen = this.interface.inventoryManager.getOpenInventoryCount() > 0;
        if (anyInventoryOpen) {
            this.interface.inventoryManager.updateControls();
        } else {
            player.updateControls();
        }
    }

    draw() {
        this.interface.draw();
    }

    clear() {
        this.mouse.clear();
        this.keys.clear();
    }

    getMouseWorldCors() {
        return this.cam.screenToWorld(this.mouse.x, this.mouse.y);
    }
}
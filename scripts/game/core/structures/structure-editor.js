class StructureEditor {
    constructor() {
        this.enabled = false;

        this.blockType = "grass";

        // key = "x,y", value = { x, y, type }
        this.blocks = new Map();
    }

    tick() {
        if (!this.enabled) return;

        this.update();
        this.draw();
    }

    update() {
        const world = user.getMouseWorldCors();
        const x = Math.floor(world.x);
        const y = Math.floor(world.y);

        const key = `${x},${y}`;

        const blockTypes = [
            'grass',
            'dirt',
            'stone',
            'planks',
            'bricks',
            'wool',
            'glass',
            'chest',
            'door',
        ];
        for (let n = 0; n < 9; n++) {
            if (user.keys.down[n + 1]) {
                this.blockType = blockTypes[n];
            }
        }

        // Place block
        if (user.mouse.left.down) {
            const block = { x, y, type: this.blockType };
            block.solid = user.keys.down['Shift'];
            this.blocks.set(key, block);
        }

        // Remove block
        if (user.mouse.right.down) {
            this.blocks.delete(key);
        }

        // Export structure
        if (user.keys.up.Enter) {
            const structure = [...this.blocks.values()]
                .sort((a, b) => a.y - b.y || a.x - b.x);

            console.log(JSON.stringify(structure));
        }
    }

    draw() {
        //black background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save()
        user.cam.alignViewport();

        const topLeft = user.cam.screenToWorld(0, 0);
        const bottomRight = user.cam.screenToWorld(canvas.width, canvas.height);

        ctx.lineWidth = 0.2;
        ctx.strokeStyle = 'red';
        ctx.line(0, topLeft.y, 0, bottomRight.y);
        ctx.line(topLeft.x, 0, bottomRight.x, 0);


        this.drawBlocks();
        this.drawCursorPreview();

        ctx.restore();
    }

    drawBlocks() {
        const chunk = new Chunk(0, 0, 16);
        for (const block of this.blocks.values()) {
            if (!block.solid) ctx.globalAlpha = 0.5;

            ctx.fillStyle = chunk.getBlockColor(block);
            ctx.fillRect(block.x, block.y, 1, 1);

            ctx.globalAlpha = 1;
        }

    }

    drawCursorPreview() {
        // Draw cursor preview
        const world = user.getMouseWorldCors();
        const x = Math.floor(world.x);
        const y = Math.floor(world.y);

        ctx.lineWidth = 0.2;
        ctx.strokeStyle = "white";
        ctx.strokeRect(x, y, 1, 1);
    }
}
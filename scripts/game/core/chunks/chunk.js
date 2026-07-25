class Chunk {
    constructor(cx, cy, SIZE) {
        this.cx = cx;
        this.cy = cy;

        this.SIZE = SIZE;

        this.blocks = Array(SIZE * SIZE).fill(false);
    }

    updateBlockLighting() {
        for (const block of this.blocks) {
            if (typeof block == 'object') block.light = 0.1; // out of sight block
        }
    }

    worldToLocalCors(wx, wy) {
        return {
            x: wx - this.cx * this.SIZE,
            y: wy - this.cy * this.SIZE,
        };
    }

    localToWorldCors(lx, ly) {
        return {
            x: lx + this.cx * this.SIZE,
            y: ly + this.cy * this.SIZE,
        };
    }

    setBlock(block) {
        const x = block.x, y = block.y;
        if (x == undefined || y == undefined) return console.log('block pos not defined');

        if (block.type == 'chest' && !block.inventory) {
            const CHEST_SIZE = 3;
            block.inventory = new Inventory(block, CHEST_SIZE, CHEST_SIZE);

            const chestContents = generateChestContents(CHEST_SIZE * CHEST_SIZE, block.lootPool);
            block.inventory.items = chestContents;
        }

        const index = this.getBlockIndex(x, y);
        this.blocks[index] = block;
    }

    getBlock(lx, ly) {
        if (lx < 0 || lx > this.SIZE || ly < 0 || ly > this.SIZE)
            console.log(`Chunk.getBlock() coordinates must local to the chunk: (${lx}, ${ly})`);

        const index = this.getBlockIndex(lx, ly);
        return this.blocks[index];
    }

    getBlockIndex(lx, ly) {
        return lx + ly * this.SIZE;
    }

    draw() {
        this.drawBlocks();
        if (game.debug) this.drawDebugOutline();
    }

    drawBlocks() {
        if (!this.generated) return false;
        for (const o of this.blocks) {
            if (!o) continue; // no block here

            const { x, y } = this.localToWorldCors(o.x, o.y);
            const visibleToCam = user.cam.checkVisibilityOfRect(x, y);
            if (!visibleToCam) continue;

            const light = o.light//Math.max(game.world.daylight, o.light);
            const alpha = Math.clamp01(light * (o.solid ? 1 : 0.75));
            ctx.globalAlpha = alpha;

            const color = this.getBlockColor(o);
            ctx.fillStyle = color;
            ctx.fillRect(o.x, o.y, 1, 1);

            ctx.globalAlpha = 1;
        }
    }

    getBlockColor(block) {
        switch (block.type) {
            case 'deep water':
                return 'rgb(0,50,255)';
            case 'water':
                return 'rgb(0,100,255)';
            case 'sand':
                return 'rgb(225, 185, 100)';
            case 'dry grass':
                return 'rgb(96, 153, 43)';
            case 'grass':
                return 'rgb(21, 117, 34)';
            case 'dead grass':
                return 'rgb(46, 82, 25)';
            case 'dirt':
                return 'rgb(95, 27, 0)';
            case 'gravel':
                return 'rgb(129, 109, 96)';
            case 'stone':
                return 'rgb(150, 150, 150)';
            case 'snow':
                return 'rgb(225, 225, 225)';
            case 'chest':
                return 'rgb(58, 28, 2)';
            case 'door':
                return 'rgb(74, 82, 32)';
            case 'planks':
                return 'rgb(175, 114, 61)';
            case 'bricks':
                return 'rgb(95, 26, 26)';
            case 'wool':
                return 'rgb(197, 24, 24)';
            case 'glass':
                return 'rgb(168, 220, 255)';
            default:
                return 'rgb(255,0,255)';
        }
    }

    drawDebugOutline() {
        const BORDER_SIZE = 0.1;

        const color = !this.generated ? 'rgb(255,0,0)' : (this.cx + this.cy) % 2 == 0 ? 'rgb(0,100,255)' : 'rgb(0,200,0)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.1;
        ctx.strokeRect(BORDER_SIZE, BORDER_SIZE, this.SIZE - BORDER_SIZE * 2, this.SIZE - BORDER_SIZE * 2);
    }
}
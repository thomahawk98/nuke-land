class Chunk {
    constructor(cx, cy, SIZE) {
        this.cx = cx;
        this.cy = cy;

        this.SIZE = SIZE;

        this.blocks = Array(SIZE * SIZE).fill(false);
    }

    localToWorldCors(lx, ly) {
        return {
            x: lx + this.cx * this.SIZE,
            y: ly + this.cy * this.SIZE,
        }
    }

    setBlock(block) {
        const x = block.x, y = block.y;
        if (x == undefined || y == undefined) return console.log('block pos not defined');

        const index = this.getBlockIndex(x, y);
        this.blocks[index] = block;
    }

    getBlock(lx, ly) {
        if (lx < 0 || lx > this.SIZE || ly < 0 || ly > this.SIZE)
            console.log('Chunk.getBlock() coordinates must local to the chunk.');

        const index = this.getBlockIndex(x, y);
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
            const visible = user.cam.checkVisibilityOfRect(x, y);

            const color = this.getBlockColor(o);
            ctx.fillStyle = color;
            ctx.fillRect(o.x, o.y, 1, 1);
        }
    }

    getBlockColor(block) {
        switch (block.type) {
            case 'deep water':
                return 'rgb(0,50,255)'
            case 'water':
                return 'rgb(0,100,255)'
            case 'sand':
                return 'rgb(225, 185, 100)'
            case 'dry grass':
                return 'rgb(96, 153, 43)'
            case 'grass':
                return 'rgb(21, 117, 34)'
            case 'dead grass':
                return 'rgb(46, 82, 25)'
            case 'dirt':
                return 'rgb(94, 53, 20)'
            case 'gravel':
                return 'rgb(129, 109, 96)'
            case 'stone':
                return 'rgb(150, 150, 150)'
            case 'snow':
                return 'rgb(225, 225, 225)'
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
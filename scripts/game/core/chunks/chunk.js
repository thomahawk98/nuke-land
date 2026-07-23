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
        return x + y * this.SIZE;
    }

    draw() {
        if (!this.generated) return false;
        for (const o of this.blocks) {
            if (!o) continue; // no block here

            const { x, y } = this.localToWorldCors(o.x, o.y);
            const visible = user.cam.checkVisibility(x, y);
        }
    }
}
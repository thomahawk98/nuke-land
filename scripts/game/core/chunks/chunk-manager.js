class ChunkManager {
    constructor(seed) {
        this.seed = seed;

        this.generator = new ChunkGenerator(this);
        this.chunks = new Map();
        this.CHUNK_SIZE = 16;

        this.prevPlayerCors = {};
    }

    update() {
        // check if player moved between chunks
        const player = game.getPlayer();
        const chunkCors = this.getChunkCors(player.x, player.y);
        if (chunkCors.x !== this.prevPlayerCors.x || chunkCors.y !== this.prevPlayerCors.y) {
            this.generateChunksAroundPlayer(player);
            this.prevPlayerCors = chunkCors;
        }
    }

    getBlock(wx, wy) {
        const chunkCors = this.getChunkCors(wx, wy);
        const chunk = this.getChunk(chunkCors.x, chunkCors.y);
        if(!chunk) return false; // no chunk at block location

        const lx = Math.modulo(wx, this.CHUNK_SIZE);
        const ly = Math.modulo(wy, this.CHUNK_SIZE);
        const block = chunk.getBlock(lx, ly);
        return block;
    }

    getChunk(cx, cy) {
        const key = this.getChunkKey(cx, cy);
        return this.chunks.get(key);
    }

    setChunk(chunk) {
        const key = this.getChunkKey(chunk.cx, chunk.cy);
        this.chunks.set(key, chunk);
    }

    getChunkKey(cx, cy) {
        return `${cx},${cy}`;
    }

    getChunkCors(wx, wy) {
        const cx = Math.floor(wx / this.CHUNK_SIZE);
        const cy = Math.floor(wy / this.CHUNK_SIZE);
        return { x: cx, y: cy };
    }

    generateChunksAroundPlayer(player) {
        const GENERATION_DISTANCE = player.GENERATION_DISTANCE;
        const chunkCors = this.getChunkCors(player.x, player.y);
        for (let x = -GENERATION_DISTANCE; x <= GENERATION_DISTANCE; x++) {
            for (let y = -GENERATION_DISTANCE; y <= GENERATION_DISTANCE; y++) {
                const cx = chunkCors.x + x;
                const cy = chunkCors.y + y;

                if (Math.distTo(chunkCors.x, chunkCors.y, cx, cy) > GENERATION_DISTANCE) continue;

                const chunk = this.getChunk(cx, cy);
                if (chunk && chunk.generated) continue; // chunk does not need to be generated

                this.generator.generateChunk(cx, cy);
            }
        }
    }

    draw() {
        const player = game.getPlayer();
        const RENDER_DISTANCE = player.RENDER_DISTANCE;
        const chunkCors = this.getChunkCors(player.x, player.y);

        const chunkMap = this.chunks;

        for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
            for (let y = -RENDER_DISTANCE; y <= RENDER_DISTANCE; y++) {
                const cx = chunkCors.x + x;
                const cy = chunkCors.y + y;
                if (Math.distTo(chunkCors.x, chunkCors.y, cx, cy) > RENDER_DISTANCE) continue;

                // check if chunk exists
                const chunk = this.getChunk(cx, cy);
                if (!chunk) {
                    console.warn('no chunk exist at:', cx, cy);
                    continue;
                }

                // check if chunk is visible
                const { x: wx, y: wy } = chunk.localToWorldCors(0, 0);
                const visible = user.cam.checkVisibilityOfRect(wx, wy, chunk.SIZE, chunk.SIZE);
                if (!visible) continue;

                ctx.save();
                ctx.translate(chunk.cx * this.CHUNK_SIZE, chunk.cy * this.CHUNK_SIZE);

                chunk.draw();

                ctx.restore();
            }
        }
    }
}
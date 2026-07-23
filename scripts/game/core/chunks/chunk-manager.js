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
        const chunkCors = this.getChunkCors(player.x, player.y);
        if (chunkCors.x !== this.prevPlayerCors.x || chunkCors.y !== this.prevPlayerCors.y) {
            this.generateChunksAroundPlayer();
        }
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

    generateChunksAroundPlayer() {
        const player = game.getPlayer();
        const GENERATION_DISTANCE = player.generationDistance;
        const chunkCors = this.getChunkCors(player.x, player.y);
        for (let x = -GENERATION_DISTANCE; x <= GENERATION_DISTANCE; x++) {
            for (let y = -GENERATION_DISTANCE; y <= GENERATION_DISTANCE; y++) {
                const cx = chunkCors.x + x;
                const cy = chunkCors.y + y;

                const chunk = this.getChunk(cx, cy);
                if(chunk && chunk.generated) continue; // chunk does not need to be generated
                
                this.generator.generateChunk(cx, cy);
            }
        }
    }
}
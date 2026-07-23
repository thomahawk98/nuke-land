class World {
    constructor() {
        this.seed = Math.round(Math.random() * 10000);
        this.chunkManager = new ChunkManager(this.seed);
    }

    draw() {
        const player = game.getPlayer();
        const RENDER_DISTANCE = player.renderDistance;
        const chunkCors = this.getChunkCors(player.x, player.y);

        const chunkMap = this.chunkManager.chunks;

        for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
            for (let y = -RENDER_DISTANCE; y <= RENDER_DISTANCE; y++) {
                const cx = chunkCors.x + x;
                const cy = chunkCors.y + y;

                const chunk = this.chunkManager.getChunk(cx, cy);
                if (!chunk) return console.warn('no chunk exist at:', cx, cy);

                chunk.draw();
            }
        }
    }
}
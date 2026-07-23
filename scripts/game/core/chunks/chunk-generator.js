class ChunkGenerator {
    constructor(manager) {
        this.manager = manager;
        this.seed = this.manager.seed;
    }

    generateChunk(cx, cy) {
        const CHUNK_SIZE = this.manager.CHUNK_SIZE;
        const chunk = new Chunk(cx, cy, CHUNK_SIZE);

        // generate chunk blocks
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_SIZE; y++) {
                const worldCors = chunk.localToWorldCors(x, y);

                // generate the block type using perlin noise (simple height map for now)
                const scale = 0.01;
                const height = (
                    noise(worldCors.x * scale, worldCors.y * scale, this.seed) +
                    noise(124098 + worldCors.x * scale * 2, 5398 + worldCors.y * scale * 2, this.seed) * 0.5 +
                    noise(124098 + worldCors.x * scale * 4, 5398 + worldCors.y * scale * 4, this.seed) * 0.25
                ) / 1.75;
                const type = this.getBlockTypeFromHeightValue(height);
                const block = { x, y, type };

                // set the block
                chunk.setBlock(block);
            }
        }

        chunk.generated = true;
        this.manager.setChunk(chunk);
    }

    getBlockTypeFromHeightValue(height) {
        const blockTypes = [
            'deep water',
            'deep water',
            'water',
            'sand',
            'dry grass',
            'grass',
            'grass',
            'dead grass',
            'dirt',
            'gravel',
            'stone',
            'snow',
            'snow'
        ]
        const index = Math.round(height * blockTypes.length);
        return blockTypes[index];
    }
}
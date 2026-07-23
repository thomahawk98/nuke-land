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
                const height = noise(worldCors.x, worldCors.y, this.seed); // 0 - 1
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
            'water',
            'water',
            'sand',
            'grass',
            'grass',
            'grass',
            'dirt',
            'stone',
            'stone',
            'snow'
        ]
        const index = Math.floor(height * blockTypes.length);
        return blockTypes[index];
    }
}
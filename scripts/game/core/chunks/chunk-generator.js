class ChunkGenerator {
    constructor(manager) {
        this.manager = manager;
        this.seed = this.manager.seed;
        this.storedBlocks = new Map();
    }

    generateChunk(cx, cy) {
        const CHUNK_SIZE = this.manager.CHUNK_SIZE;
        const chunk = new Chunk(cx, cy, CHUNK_SIZE);

        this.generateChunkBlocks(chunk);
        this.generateStructures(chunk);
        this.setStoredBlocks(chunk);

        // mark the chunk as generated
        chunk.generated = true;
        this.manager.setChunk(chunk);
    }

    generateChunkBlocks(chunk) {
        const CHUNK_SIZE = this.manager.CHUNK_SIZE;

        // generate chunk blocks
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_SIZE; y++) {
                const worldCors = chunk.localToWorldCors(x, y);

                const height = this.getHeightAt(worldCors.x, worldCors.y);
                const type = this.getBlockTypeFromHeightValue(height);
                const block = { x, y, type };

                // set the block
                chunk.setBlock(block);
            }
        }
    }

    getHeightAt(x, y) {
        // generate the block type using perlin noise (simple height map for now)
        const scale = 0.005;
        const height = (
            noise(x * scale, y * scale, this.seed) +
            noise(124098 + x * scale * 2, 5398 + y * scale * 2, this.seed) * 0.5 +
            noise(124098 + x * scale * 4, 5398 + y * scale * 4, this.seed) * 0.25
        ) / 1.75;
        return height;
    }

    generateStructures(chunk) {
        const structure = game.world.structureManager.generateStructuresForChunk(chunk.cx, chunk.cy);
        if (!structure) return false; // no structures here

        const { x: lsx, y: lsy } = chunk.worldToLocalCors(structure.x, structure.y);
        if (lsx < 0 || lsx >= chunk.SIZE || lsy < 0 || lsy >= chunk.SIZE) return console.log('lol what this structure doesnt go here stupid');

        const angle = 90 * Math.floor(Math.random() * 4)//Math.round(Math.random() * 360 / 90) * 90;
        for (const blockTemplate of structure.blocks) {
            // update the block cors to be relative to the chunk
            const block = structuredClone(blockTemplate);

            const cors = Math.rotate(0, 0, block.x, block.y, angle);
            block.x = cors.x + lsx;
            block.y = cors.y + lsy;

            // detect if the block is outside the chunk
            const outsideChunk = block.x < 0 || block.x >= chunk.SIZE || block.y < 0 || block.y >= chunk.SIZE;
            if (outsideChunk) {
                const wx = chunk.cx * chunk.SIZE + block.x;
                const wy = chunk.cy * chunk.SIZE + block.y;
                game.world.setBlock(wx, wy, block);
            } else {
                chunk.setBlock(block); // set the block
            }
        }
    }

    setStoredBlocks(chunk) {
        const key = this.manager.getChunkKey(chunk.cx, chunk.cy);
        const storedBlocks = this.storedBlocks.get(key);
        if (!storedBlocks) return false; // no stored blocks for this chunk

        for (const block of storedBlocks) chunk.setBlock(block);
        this.storedBlocks.delete(key);
    }

    storeBlock(key, block) {
        const storedBlocks = this.storedBlocks.get(key);
        if (storedBlocks) this.storedBlocks.set(key, [...storedBlocks, block]);
        else this.storedBlocks.set(key, [block]);
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
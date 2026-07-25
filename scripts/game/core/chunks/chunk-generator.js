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

        // generate a chest at the corner of each chunk
        const chest = { x: 0, y: 0, type: 'chest' };

        const CHEST_SIZE = 3 + Math.floor(Math.random() * 3); // 3 - 5
        chest.inventory = new Inventory(chest, CHEST_SIZE, CHEST_SIZE);

        const chestContents = generateChestContents(CHEST_SIZE * CHEST_SIZE, 'test chest');
        chest.inventory.items = chestContents;

        chunk.setBlock(chest);

        function generateChestContents(amount, lootPool) {
            const contents = Array(amount).fill(false);
            for (let n = 0; n < amount; n++) {
                const itemChance = 0.1;
                if (Math.random() > itemChance) continue; // no item here

                const options = getRandomOptionsFromLootPool(lootPool);

                // pick a random option based on the options relative weights
                const totalWeight = options.reduce((sum, { weight }) => sum + weight, 0);
                let random = Math.random() * totalWeight;

                const option = options.find(option => {
                    random -= option.weight;
                    return random < 0;
                });

                const type = option.type;
                const count = Math.floor(Math.random() * option.maxCount);

                // set item
                const item = new Item(type, { slot: n }, count);
                contents[n] = item;
            }

            return contents;
        }

        function getRandomOptionsFromLootPool(lootPool) {
            switch (lootPool) {
                case 'test chest':
                    return [
                        { type: 'test item', maxCount: 99, weight: 1 },
                    ];
                default: return [];
            }
        }

        // mark the chunk as generated
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
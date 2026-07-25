class StructureManager {
    constructor() {
        this.structures = [];
    }

    update() {

    }

    generateStructuresForChunk(cx, cy) {
        const wx = Math.floor(cx * game.world.chunkManager.CHUNK_SIZE);
        const wy = Math.floor(cy * game.world.chunkManager.CHUNK_SIZE);

        const height = game.world.chunkManager.generator.getHeightAt(wx, wy);
        const blockType = game.world.chunkManager.generator.getBlockTypeFromHeightValue(height);
        const onGrass = blockType == 'grass';//(blockType == 'dry grass' || blockType == 'grass' || blockType == 'dead grass');
        if (!onGrass) return false;

        const structure = this.attemptStructureGeneration(wx, wy);
        return structure;
    }

    attemptStructureGeneration(x, y) {
        if (Math.random() > 0.5) return false;

        // randomize the position within the chunk
        const CHUNK_SIZE = game.world.chunkManager.CHUNK_SIZE;
        const cors = {
            x: x + Math.floor(Math.random() * CHUNK_SIZE),
            y: y + Math.floor(Math.random() * CHUNK_SIZE),
        }

        // check if the suggested position is too close to an existing structure
        const DISTANCE_THRESHOLD = 20;
        for (const structure of this.structures) {
            const dist = Math.distTo(cors.x, cors.y, structure.x, structure.y);
            if (dist < DISTANCE_THRESHOLD) return false;
        }

        // add the structure
        const structure = {
            x: cors.x,
            y: cors.y,
            blocks: [
                { x: 0, y: 0, type: 'stone' }
            ]
        };
        
        this.structures.push(structure);
        return structure;
    }

    draw() {
        for (const structure of this.structures) {
            ctx.fillStyle = 'red';
            ctx.fillCirc(structure.x, structure.y, 0.5);
        }
    }
}
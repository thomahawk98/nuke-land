class World {
    constructor() {
        this.seed = Math.round(Math.random() * 10000);
        this.chunkManager = new ChunkManager(this.seed);
        this.structureManager = new StructureManager(this.seed);
        this.pathfindingGrid = new PathfindingGrid();
        this.env = new Environment();
    }

    update() {
        this.chunkManager.update();
        this.structureManager.update();
        this.pathfindingGrid.update();
        this.env.update();
    }

    reset() {
        const objects = [];
        objects.push(new Player(user, 0, 0));

        const amount = 100;
        for (let n = 0; n < amount; n++) {
            const angle = 360 / amount * n;
            const { x, y } = Math.distToMove(25, angle);
            objects.push(new Zombie(x, y));
        }

        this.env.objects = [...objects];
    }

    getSolidityAt(x, y) {
        return false;
    }

    getBlock(x, y) {
        return this.chunkManager.getBlock(x, y);
    }

    setBlock(x, y, block) {
        return this.chunkManager.setBlock(x, y, block);
    }

    draw() {
        this.chunkManager.draw();
        this.structureManager.draw();
        this.env.draw();
        this.pathfindingGrid.draw();
    }
}
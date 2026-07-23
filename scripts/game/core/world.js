class World {
    constructor() {
        this.seed = Math.round(Math.random() * 10000);
        this.chunkManager = new ChunkManager(this.seed);
        this.pathfindingGrid = new PathfindingGrid();
    }

    update() {
        this.chunkManager.update();
    }

    getSolidityAt(x, y) {
        return false;
    }

    draw() {
        this.chunkManager.draw();
        this.pathfindingGrid.draw();
    }
}
class World {
    constructor() {
        this.seed = Math.round(Math.random() * 10000);
        this.chunkManager = new ChunkManager(this.seed);
    }

    update() {
        this.chunkManager.update();
    }

    draw() {
        this.chunkManager.draw();
    }
}
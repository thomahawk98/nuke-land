class World {
    constructor() {
        this.daylight = 0.5;
        this.DAY_LENGTH_SECONDS = 3;
        this.NIGHT_LENGTH_SECONDS = 1;

        this.seed = Math.round(Math.random() * 10000);
        this.chunkManager = new ChunkManager(this.seed);
        this.structureManager = new StructureManager(this.seed);
        this.pathfindingGrid = new PathfindingGrid();
        this.env = new Environment();
    }

    update() {
        this.updateDaylight();
        this.chunkManager.update();
        this.structureManager.update();
        this.pathfindingGrid.update();
        this.env.update();
    }

    updateDaylight() {
        const dayLength = this.DAY_LENGTH_SECONDS * 100;
        const nightLength = this.NIGHT_LENGTH_SECONDS * 100;
        const minDaylight = 0.5;
        const maxDaylight = 1.0;
        const light = this.getDaylight(game.t, dayLength, nightLength, minDaylight, maxDaylight);
        this.daylight = light;
    }

    getDaylight(time, dayLength, nightLength, minDaylight, maxDaylight) {
        const transition = Math.min(dayLength, nightLength) * 0.25;

        const cycleLength = dayLength + nightLength;
        const t = ((time % cycleLength) + cycleLength) % cycleLength;

        // Smooth interpolation
        const smooth = x => x * x * (3 - 2 * x);

        // Sunrise
        if (t < transition) {
            return Math.lerp(
                minDaylight,
                maxDaylight,
                smooth(t / transition)
            );
        }

        // Day
        if (t < dayLength - transition) {
            return maxDaylight;
        }

        // Sunset
        if (t < dayLength) {
            return Math.lerp(
                maxDaylight,
                minDaylight,
                smooth((t - (dayLength - transition)) / transition)
            );
        }

        // Night
        return minDaylight;
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
        return this.getBlock(x, y).solid;
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
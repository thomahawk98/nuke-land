class World {
    constructor() {
        this.daylight = 0.5;
        this.DAY_LENGTH_FRAMES = 3 * 60 * 100; // 3 minutes
        this.NIGHT_LENGTH_FRAMES = 1 * 60 * 100; // 1 minute
        this.CYCLE_LENGTH = this.DAY_LENGTH_FRAMES + this.NIGHT_LENGTH_FRAMES;

        this.MAX_DAYLIGHT = 1.0;
        this.MIN_DAYLIGHT = 0.5;
        this.transition = Math.min(this.DAY_LENGTH_FRAMES, this.NIGHT_LENGTH_FRAMES) * 0.25;

        this.seed = Math.round(Math.random() * 10000);
        this.chunkManager = new ChunkManager(this.seed);
        this.structureManager = new StructureManager(this.seed);
        this.pathfindingManager = new PathfindingManager();
        this.env = new Environment();
    }

    update() {
        this.updateDaylight();
        this.chunkManager.update();
        this.structureManager.update();
        this.pathfindingManager.update();
        this.env.update();
    }

    updateDaylight() {
        this.daylight = this.getDaylight(game.t);
    }

    getCyclePercent(time = game.t) {
        return (time / this.CYCLE_LENGTH) % 1;
    }

    getTimeOfDay(time = game.t) {
        const t = Math.modulo(time, this.CYCLE_LENGTH);

        if (t < this.transition) return 'sunrise';
        else if (t < this.DAY_LENGTH_FRAMES - this.transition) return 'day';
        else if (t < this.DAY_LENGTH_FRAMES) return 'sunset';
        else return 'night';
    }

    getDaylight(time = game.t) {
        const minDaylight = this.MIN_DAYLIGHT;
        const maxDaylight = this.MAX_DAYLIGHT;
        const t = Math.modulo(time, this.CYCLE_LENGTH);

        // Smooth interpolation
        const smooth = x => x * x * (3 - 2 * x);
        const timeOfDay = this.getTimeOfDay(time);
        switch (timeOfDay) {
            case 'sunrise':
                return Math.lerp(
                    minDaylight,
                    maxDaylight,
                    smooth(t / this.transition)
                );
            case 'day':
                return maxDaylight;
            case 'sunset':
                return Math.lerp(
                    maxDaylight,
                    minDaylight,
                    smooth((t - (this.DAY_LENGTH_FRAMES - this.transition)) / this.transition)
                );
            case 'night':
                return minDaylight;
        }
    }

    reset() {
        this.env.reset();
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

    getBlocksInRectangle(_x, _y, w, h) {
        const x1 = Math.floor(_x), y1 = Math.floor(_y);
        const x2 = Math.floor(_x + w), y2 = Math.floor(_y + h);
        const blocks = [];
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                const block = this.getBlock(x, y);
                blocks.push(block);
            }
        }
        return blocks;
    }

    draw() {
        this.chunkManager.draw();
        this.structureManager.draw();
        this.env.draw();
        if(game.debug) this.pathfindingManager.draw();
    }
}
class PathFinder {
    constructor(object, manager) {
        this.object = object;

        this.currentStep = 0;
        this.path = new Path(object, manager);

        manager.paths.push(this.path);
    }

    update() {
        while (this.checkIfReachedCurrentTarget()) {
            this.currentStep++;

            if (this.currentStep >= this.path.steps.length) break;
        }
    }

    updatePathTo(x, y) {
        if (x == undefined || y == undefined) return console.error('stupid');

        // check if x and y are equal to the current end x and y
        const pathChanged = this.checkIfPathChanged(x, y);
        this.path.end = { x, y };
        if (!pathChanged) return;

        this.path.calculate();
        this.currentStep = Math.min(1, this.path.steps.length - 1); // prevent angle jittering from facing backwards towards target
    }

    getNextStepInPath() {
        if (this.path.steps[2]) return this.path.steps[2];
        return this.path.steps[1];
    }

    checkIfReachedCurrentTarget() {
        const target = this.getCurrentTargetInPath();
        if (!target) return false;

        const DISTANCE_THRESHOLD = 1; // technically this will target a step like 1 ahead of the current entity position but it should allow for smoother movement

        const dx = this.object.x - target.x;
        const dy = this.object.y - target.y;

        return dx * dx + dy * dy <= DISTANCE_THRESHOLD * DISTANCE_THRESHOLD;
    }

    getCurrentTargetInPath() {
        const step = this.path.steps[this.currentStep];
        if (!step) return false;

        return {
            x: step.x + 0.5,
            y: step.y + 0.5
        }
    }

    checkIfPathChanged(x, y) {
        // compare the grid cors to avoid changing for only tiny movements
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        const gridEndX = Math.floor(this.path.end.x);
        const gridEndY = Math.floor(this.path.end.y);

        return gridX !== gridEndX || gridY !== gridEndY;
    }
}
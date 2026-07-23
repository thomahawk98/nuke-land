class PathFinder {
    constructor(object, grid) {
        this.object = object;
        this.grid = grid;

        this.path = new Path(grid, object, object);
        this.prevStartPos = {};
        this.prevEndPos = {};
    }

    getPathTo(value1, value2 = false) {
        if (value2 !== false) {
            const point = { x: value1, y: value2 };
            this.path.end = point;
        } else {
            this.path.end = value1;
        }

        //path doesn't need to be calculated otherwise
        const pathChanged = this.hasPathChanged();
        if (pathChanged) {
            this.path.calculate();
            this.updateEndpoints();
        }
        return this.path.steps;
    }

    hasPathChanged() {
        return (
            this.prevStartPos.x !== this.path.start.x ||
            this.prevStartPos.y !== this.path.start.y ||
            this.prevEndPos.x !== this.path.end.x ||
            this.prevEndPos.y !== this.path.end.y
        );
    }

    updateEndpoints() {
        this.prevStartPos.x = this.path.start.x;
        this.prevStartPos.y = this.path.start.y;

        this.prevEndPos.x = this.path.end.x;
        this.prevEndPos.y = this.path.end.y;
    }
}
class PathfindingManager {
    constructor() {
        this.paths = [];
        this.mostRecentChunk = undefined;
    }

    update() {
        this.paths = this.paths.filter(a => !a.object.delete);
    }

    getNodeAt(wx, wy) {
        wx = Math.floor(wx);
        wy = Math.floor(wy);

        if (this.mostRecentChunk !== undefined) {
            const { x: lx, y: ly } = this.mostRecentChunk.worldToLocalCors(wx, wy);
            if (lx >= 0 && lx < this.mostRecentChunk.SIZE && ly >= 0 && ly < this.mostRecentChunk.SIZE) {
                const index = this.mostRecentChunk.getBlockIndex(lx, ly);
                const traversable = this.mostRecentChunk.traversable[index];
                return { traversable, x: wx, y: wy };
            }
        }

        const { x: cx, y: cy } = game.world.chunkManager.getChunkCors(wx, wy);
        const chunk = game.world.chunkManager.getChunk(cx, cy);
        if (!chunk) console.log('no chunk exists :(', cx, cy, wx, wy);
        this.mostRecentChunk = chunk;

        const { x: lx, y: ly } = chunk.worldToLocalCors(wx, wy);
        const index = chunk.getBlockIndex(lx, ly);
        const traversable = chunk.traversable[index];
        return { traversable, x: wx, y: wy };
    }


    // this function doesn't look the best but it's blazingly fast compared to the old one
    getTraversableNeighborsOfNode(node) {
        const nodes = [];

        const leftNeighbor = this.getNodeAt(node.x - 1, node.y, true);
        if (leftNeighbor.traversable) nodes.push(leftNeighbor);

        const rightNeighbor = this.getNodeAt(node.x + 1, node.y, true);
        if (rightNeighbor.traversable) nodes.push(rightNeighbor);

        const topNeighbor = this.getNodeAt(node.x, node.y - 1, true);
        if (topNeighbor.traversable) nodes.push(topNeighbor);

        const bottomNeighbor = this.getNodeAt(node.x, node.y + 1, true);
        if (bottomNeighbor.traversable) nodes.push(bottomNeighbor);

        if (topNeighbor.traversable && leftNeighbor.traversable) {
            const topLeftNeighbor = this.getNodeAt(node.x - 1, node.y - 1, true);
            if (topLeftNeighbor.traversable) nodes.push(topLeftNeighbor);
        }

        if (topNeighbor.traversable && rightNeighbor.traversable) {
            const topRightNeighbor = this.getNodeAt(node.x + 1, node.y - 1, true);
            if (topRightNeighbor.traversable) nodes.push(topRightNeighbor);
        }

        if (bottomNeighbor.traversable && leftNeighbor.traversable) {
            const bottomLeftNeighbor = this.getNodeAt(node.x - 1, node.y + 1, true);
            if (bottomLeftNeighbor.traversable) nodes.push(bottomLeftNeighbor);
        }

        if (bottomNeighbor.traversable && rightNeighbor.traversable) {
            const bottomRightNeighbor = this.getNodeAt(node.x + 1, node.y + 1, true);
            if (bottomRightNeighbor.traversable) nodes.push(bottomRightNeighbor);
        }

        return nodes;
    }

    draw() {
        if(!game.debug.enabled || !game.debug.showPathfindingGrid) return;
        
        for (const path of this.paths) {
            for (const step of path.steps) {
                ctx.fillStyle = 'rgba(0,225,0,0.5)';
                ctx.fillRect(step.x, step.y, 1, 1);
            }
        }

        const player = game.getPlayer();
        if(!player) return;

        const playerNode = this.getNodeAt(player.x, player.y);
        const neighbors = this.getTraversableNeighborsOfNode(playerNode);
        const nodes = [playerNode, ...neighbors];
        for (const node of nodes) {
            ctx.fillStyle = 'rgba(0,225,0,0.5)';
            ctx.fillRect(node.x, node.y, 1, 1);
        }
    }
}
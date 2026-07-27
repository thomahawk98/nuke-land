class PathfindingGrid {
    constructor() {
        this.nodes = new Map();
        this.paths = [];
        this.pathNodes = new Set();
        this.pathStartNodes = new Set();
        this.pathEndNodes = new Set();

        // visual stuff
        this.enabled = false;
        this.opacity = 0;
        this.maxOpacity = 50;

        this.DIAGONAL_OFFSETS = [

        ]
    }

    update() {
        // update opacity
        if (this.enabled) this.opacity = Math.min(this.opacity + 5, this.maxOpacity);
        else this.opacity = Math.max(this.opacity - 5, 0);

        // update node decay
        if (game.t % 100 == 0) {
            for (const [key, node] of this.nodes) {
                node.decay > 0 ? node.decay-- : this.nodes.delete(key);
            }
        }

        // update path nodes
        this.pathNodes = new Set();
        this.pathStartNodes = new Set();
        this.pathEndNodes = new Set();
        for (const path of this.paths) {
            for (const node of path.steps) {
                this.pathNodes.add(node);

                const startX = Math.floor(path.start.x), startY = Math.floor(path.start.y);
                if (node.x == startX && node.y == startY) this.pathStartNodes.add(node);

                const endX = Math.floor(path.end.x), endY = Math.floor(path.end.y);
                if (node.x == endX && node.y == endY) this.pathEndNodes.add(node);
            }
        }
    }

    encodeKey(x, y) {
        const key = `${x},${y}`;
        return key;
    }

    decodeKey(key) {
        const [x, y] = key.split(',');
        return { x, y };
    }

    getNodeAt(_x, _y, generate = false) {
        const x = Math.floor(_x), y = Math.floor(_y);
        const key = this.encodeKey(x, y);
        const node = this.nodes.get(key);

        if (!node && generate) {
            const newNode = this.generateNodeAt(x, y);
            return newNode;
        }

        return node;
    }

    generateNodeAt(_x, _y) {
        const x = Math.floor(_x), y = Math.floor(_y);
        const solid = game.world.getSolidityAt(x, y);
        const node = {
            x, y,
            traversable: !solid
        };
        this.setNodeAt(x, y, node);

        return node;
    }

    setNodeAt(_x, _y, node) {
        const x = Math.floor(_x), y = Math.floor(_y);
        const key = this.encodeKey(x, y);

        node.decay = 60; // 60s before deletion

        this.nodes.set(key, node);
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
        const alpha = this.opacity / 100;
        ctx.globalAlpha = alpha;

        //draw solid color of each node
        for (const [key, node] of this.nodes) {
            const visible = user.cam.checkVisibilityOfRect(node.x, node.y);
            if (!visible) continue;
            this.drawNode(node);
            this.drawNodeCors(node);
        }

        //draw border of path nodes
        for (const [key, node] of this.nodes) {
            this.drawNodeOutline(node);
        }
        ctx.globalAlpha = 1;
    }

    getBounds(node, gap = -0.01, size = 1) {
        const bounds = [node.x + gap * 0.5, node.y + gap * 0.5, size - gap, size - gap];
        return bounds;
    }

    drawNode(node) {
        const isPath = this.pathNodes.has(node);
        const bounds = this.getBounds(node, 0.25);
        ctx.fillStyle = !node.traversable ? 'rgb(200,50,50)' : isPath ? 'lime' : 'white';
        ctx.fillRect(...bounds);
    }
    
    drawNodeCors(node) {
        ctx.fillStyle = 'black';
        ctx.font = '0.5px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${node.x},${node.y}`, node.x + 0.5, node.y + 0.5);
    }

    drawNodeOutline(node) {
        const isStartPoint = this.pathStartNodes.has(node);
        const isEndPoint = this.pathEndNodes.has(node);
        if (!isStartPoint && !isEndPoint) return;

        const bounds = this.getBounds(node);
        ctx.lineWidth = 0.08;
        ctx.strokeStyle = isEndPoint ? 'rgba(0,0,255,0.8)' : isStartPoint ? 'rgba(255,165,0,0.8)' : 'rgba(0,0,0,0)';
        ctx.strokeRect(...bounds);
    }
}
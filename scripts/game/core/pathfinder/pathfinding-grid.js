class PathfindingGrid {
    constructor() {
        this.nodes = new Map();
        this.paths = [];
        this.pathNodes = new Set();
        this.pathStartNodes = new Set();
        this.pathEndNodes = new Set();

        this.enabled = true;
        this.opacity = 0;
        this.maxOpacity = 75;
    }

    update() {
        // update opacity
        if(this.enabled) this.opacity = Math.min(this.opacity + 5, this.maxOpacity);
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
        for(const path of this.paths) {
            for(const node of path.steps) {
                this.pathNodes.add(node);

                const startX = Math.floor(path.start.x), startY = Math.floor(path.start.y);
                if(node.x == startX && node.y == startY) this.pathStartNodes.add(node);

                const endX = Math.floor(path.end.x), endY = Math.floor(path.end.y);
                if(node.x == endX && node.y == endY) this.pathEndNodes.add(node);
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

        node.decay = 60; //60s before deletion

        this.nodes.set(key, node);
    }

    getNeighborsOfNode(node, method = 'diagonal') {
        const nodes = [];
        if (method == 'diagonal') {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x == 0 && y == 0) continue;

                    const neighbor = this.getNodeAt(node.x + x, node.y + y, true);
                    if (neighbor) nodes.push(neighbor);
                }
            }
        } else if (method == 'cardinal') {
            const cors = [[-1, 0], [0, -1], [1, 0], [0, 1]];
            for (const cor of cors) {
                const neighbor = this.getNodeAt(node.x + cor[0], node.y + cor[1], true);
                if (neighbor) nodes.push(neighbor);
            }
        } else if (method == 'dynamic') { //used for path finding to prevent cutting solid corners but enable diagonal travel in open space
            //get cardinal neighbors first
            const cardinalNeighbors = this.getNeighborsOfNode(node, 'cardinal');
            let allNeighborsAreTraversable = true;
            for (const o of cardinalNeighbors) if (!o.traversable) allNeighborsAreTraversable = false;

            //looks like the node is in open space ¯\_(ツ)_/¯ (diagonal nodes can be added safely)
            if (allNeighborsAreTraversable) {
                const diagonalNeighbors = this.getNeighborsOfNode(node, 'diagonal');
                nodes.push(...diagonalNeighbors);
            } else {
                nodes.push(...cardinalNeighbors);
            }
        }
        return nodes;
    }

    draw() {
        //draw solid color of each node
        for (const [key, node] of this.nodes) {
            const visible = user.cam.checkVisibilityOfRect(node.x, node.y);
            if (!visible) continue;
            this.drawNode(node);
        }

        //draw border of path nodes
        for (const [key, node] of this.nodes) {
            this.drawNodeOutline(node);
        }
    }

    getBounds(node, gap = -0.01, size = 1) {
        const bounds = [node.x + gap * 0.5, node.y + gap * 0.5, size - gap, size - gap];
        return bounds;
    }

    drawNode(node) {
        const isPath = this.pathNodes.has(node);
        const bounds = this.getBounds(node, 0.5);
        ctx.fillStyle = !node.traversable ? 'rgb(200,50,50)' : isPath ? 'lime' : 'white';
        ctx.fillRect(...bounds);
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
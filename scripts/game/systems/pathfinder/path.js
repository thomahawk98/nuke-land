class Path {
    constructor(grid, start, end) {
        this.grid = grid;
        this.start = start;
        this.end = end;
        this.steps = [];
        this.searchData = new Map();

        this.grid.paths.push(this);
    }

    getData(node) {
        let data = this.searchData.get(node);

        if (!data) {
            data = {
                totalCost: Infinity,
                distanceToStartCost: Infinity,
                distanceToEndCost: Infinity,
                parent: null
            };

            this.searchData.set(node, data);
        }

        return data;
    }

    calculate(maxDepth = 50) {
        this.searchData.clear();
        const closestNodeToEnd = this.searchForPath(maxDepth);
        this.steps = this.decompileStepsFromNodeParents(closestNodeToEnd);
    }

    searchForPath(maxDepth) {
        this.startNode = this.grid.getNodeAt(this.start.x, this.start.y, true);
        this.endNode = this.grid.getNodeAt(this.end.x, this.end.y, true);

        if (!this.startNode || !this.endNode) return console.error('here');

        // set costs of start node
        const distanceFromStartToEnd = this.getAbsoluteDistanceCost(this.startNode, this.endNode);
        const data = {
            distanceToStartCost: 0,
            distanceToEndCost: distanceFromStartToEnd,
            totalCost: distanceFromStartToEnd,
            parent: null
        }
        this.searchData.set(this.startNode, data);

        const uncheckedNodes = new Set([this.startNode]); // nodes that haven't been checked yet and need to be checked
        const checkedNodes = new Set(); // nodes that have been check (and aren't the target node)

        // make sure to not go over the search depth
        for (let i = 0; i < maxDepth; i++) {
            if (uncheckedNodes.size == 0) break; //all available nodes have been checked

            const current = this.getLowestCostNode(uncheckedNodes);
            if (current == this.endNode) return current; //path has been found

            this.searchCurrentNode(current, uncheckedNodes, checkedNodes);
        }

        //the end node was not found, could be too far away or obstructed
        //console.log(`no path found between (${this.start.x},${this.start.y}) and (${this.end.x},${this.end.y})`);

        //find closest node on path
        let closest = null;
        let closestDistance = Infinity;
        for (const node of checkedNodes) {
            const data = this.getData(node);
            if (data.distanceToEndCost > closestDistance) continue;

            closest = node;
            closestDistance = data.distanceToEndCost;
        }
        return closest;
    }

    searchCurrentNode(current, uncheckedNodes, checkedNodes) {
        //find all the neighbors
        const traversableNeighbors = this.grid.getTraversableNeighborsOfNode(current);
        for (const o of traversableNeighbors) {
            this.checkNeighborNode(o, current, uncheckedNodes, checkedNodes);
        }

        //this node has been checked, move it to the checkedNodes array
        uncheckedNodes.delete(current)
        checkedNodes.add(current);
    }

    checkNeighborNode(o, current, uncheckedNodes, checkedNodes) {
        if (checkedNodes.has(o)) return;

        //compute costs relative to current node
        const costs = this.getCostsFromParent(o, current);

        if (uncheckedNodes.has(o)) {
            const currentTotalCost = this.getData(o).totalCost;
            if (costs.totalCost > currentTotalCost) return; // total cost from current is higher than origional total cost, leave node unchanged
        } else {
            uncheckedNodes.add(o); //add neighbor to unchecked nodes
        }

        // set the data of the neighbor node to point back to the current node as it's parent
        const data = {
            totalCost: costs.totalCost,
            distanceToStartCost: costs.distanceToStartCost,
            distanceToEndCost: costs.distanceToEndCost,
            parent: current
        }
        this.searchData.set(o, data);
    }

    getLowestCostNode(nodes) {
        let bestNode = null;
        let bestData = {
            totalCost: Infinity,
        };
        for (const node of nodes) {
            const data = this.getData(node);

            if (!bestNode) {
                bestNode = node;
                bestData = data;
                continue;
            }


            if (
                data.totalCost < bestData.totalCost ||
                (data.totalCost === bestData.totalCost && data.distanceToEndCost < bestData.distanceToEndCost)
            ) {
                bestNode = node;
                bestData = data;
            }
        }

        return bestNode;
    }

    getCostsFromParent(node, parent) {
        // check if parent has a valid distanceToStartCost
        const parentData = this.getData(parent);
        if (!Number.isFinite(parentData.distanceToStartCost)) {
            return console.error('parent node has no defined distance to starting point:', parent);
        }

        //get costs
        const distanceToStartCost = parentData.distanceToStartCost + this.getAbsoluteDistanceCost(node, parent);
        const distanceToEndCost = this.getAbsoluteDistanceCost(node, this.endNode);
        const totalCost = distanceToStartCost + distanceToEndCost;

        return { distanceToStartCost, distanceToEndCost, totalCost };
    }

    getAbsoluteDistanceCost(node1, node2) {
        // return Math.distTo(node1.x, node1.y, node2.x, node2.y) * 10;
        const widthDist = Math.abs(node1.x - node2.x);
        const heightDist = Math.abs(node1.y - node2.y);

        const longestDist = Math.max(widthDist, heightDist);
        const shortestDist = Math.min(widthDist, heightDist);
        const flatDist = longestDist - shortestDist;
        const diagonalDist = shortestDist;

        return flatDist * 10 + diagonalDist * 14;
    }

    decompileStepsFromNodeParents(node) {
        if (!node) return []; //blank array for a blank node

        const steps = [];

        //assemble the steps array (it's backwards)
        let current = node;
        while (current) {
            steps.push(current);

            // go to next node
            current = this.getData(current).parent;
        }

        //reverse the array
        steps.reverse();
        return steps;
    }
}
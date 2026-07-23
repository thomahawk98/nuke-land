class Path {
    constructor(grid, start, end) {
        this.grid = grid;
        this.start = start;
        this.end = end;

        this.steps = [];
        this.grid.paths.push(this);
        console.log(this.grid.paths);
    }

    calculate(maxDepth = 500) {
        const closestNodeToEnd = this.searchForPath(maxDepth);
        this.steps = this.decompileStepsFromNodeParents(closestNodeToEnd);
    }

    //totalCost = distanceToStartCost + distanceToEndCost
    searchForPath(maxDepth) {
        this.startNode = this.grid.getNodeAt(this.start.x, this.start.y, true);
        this.endNode = this.grid.getNodeAt(this.end.x, this.end.y, true);

        if (!this.startNode || !this.endNode) return console.error('here');

        //set costs of start node
        this.startNode.distanceToEndCost = this.getAbsoluteDistanceCost(this.startNode, this.endNode);
        this.startNode.distanceToStartCost = 0;
        this.startNode.totalCost = this.startNode.distanceToEndCost + this.startNode.distanceToStartCost;

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
        let closest = false;
        for (const node of checkedNodes) {
            if (!closest || node.distanceToEndCost < closest.distanceToEndCost) closest = node;
        }
        return closest;
    }

    searchCurrentNode(current, uncheckedNodes, checkedNodes) {
        //find all the neighbors
        const neighbors = this.grid.getNeighborsOfNode(current, 'dynamic');
        for (const o of neighbors) {
            this.checkNeighborNode(o, current, uncheckedNodes, checkedNodes);
        }

        //this node has been checked, move it to the checkedNodes array
        uncheckedNodes.delete(current)
        checkedNodes.add(current);
    }

    checkNeighborNode(o, current, uncheckedNodes, checkedNodes) {
        if (checkedNodes.has(o) || !o.traversable) return;

        //compute costs relative to current node
        const costs = this.getCostFromParent(o, current);

        if (uncheckedNodes.has(o)) {
            if (costs.totalCost > o.totalCost) return; //total cost from current is higher than origional total cost, leave node unchanged
        } else {
            uncheckedNodes.add(o); //add neighbor to unchecked nodes
        }

        //update costs based on current
        o.totalCost = costs.totalCost;
        o.distanceToStartCost = costs.distanceToStartCost;
        o.distanceToEndCost = costs.distanceToEndCost;

        //set parent of neighbor to current (to track backward through the path)
        o.parent = current;
    }

    getLowestCostNode(nodes) { // nodes is a set()
        let best = false;
        for (const node of nodes) {

            //check if current node is lower cost
            if (
                !best ||
                node.totalCost < best.totalCost ||
                (node.totalCost === best.totalCost && node.distanceToEndCost < best.distanceToEndCost)
            ) {
                best = node;
            }
        }

        return best;
    }

    getCostFromParent(node, parent) {
        // check if parent has a valid distanceToStartCost
        if (!Number.isFinite(parent.distanceToStartCost)) {
            return console.log('parent node has no defined distance to starting point:', parent);
        }

        //get costs
        const distanceToStartCost = parent.distanceToStartCost + this.getAbsoluteDistanceCost(node, parent);
        const distanceToEndCost = this.getAbsoluteDistanceCost(node, this.endNode);
        const totalCost = distanceToStartCost + distanceToEndCost;

        return { distanceToStartCost, distanceToEndCost, totalCost };
    }

    getAbsoluteDistanceCost(node1, node2) {
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
            
            //go to next node
            let next = current.parent;
            delete current.parent; //delete the parent property
            current = next;
        }

        //reverse the array
        steps.reverse();
        return steps;
    }
}
function raycast(x, y, angle, maxDistance = 100, returnAll = false, countGlassAsSolid = false) {
    const allBlocks = [];

    const rads = (angle - 90) * Math.PI / 180;
    const dirX = Math.cos(rads);
    const dirY = Math.sin(rads);

    let cellX = Math.floor(x);
    let cellY = Math.floor(y);

    const stepX = Math.sign(dirX);
    const stepY = Math.sign(dirY);

    let tMaxX = dirX !== 0 ? ((cellX + (stepX > 0 ? 1 : 0)) - x) / dirX : Infinity;
    let tMaxY = dirY !== 0 ? ((cellY + (stepY > 0 ? 1 : 0)) - y) / dirY : Infinity;

    const tDeltaX = dirX !== 0 ? Math.abs(1 / dirX) : Infinity;
    const tDeltaY = dirY !== 0 ? Math.abs(1 / dirY) : Infinity;

    let distanceTraveled = 0;
    while (distanceTraveled <= maxDistance) {
        // check if the current cell is solid
        const block = game.world.getBlock(cellX, cellY);
        if (returnAll) allBlocks.push(block);

        const blockIsSolid = block && block.solid && (block.type !== 'glass' || countGlassAsSolid);
        if (blockIsSolid) {
            if (returnAll) return allBlocks;
            else return block; // return the first solid block that was hit
        }

        // Step along the axis with smallest tMax
        if (tMaxX < tMaxY) {
            cellX += stepX;
            distanceTraveled = tMaxX;
            tMaxX += tDeltaX;
        }
        else if (tMaxY < tMaxX) {
            cellY += stepY;
            distanceTraveled = tMaxY;
            tMaxY += tDeltaY;
        }
        else {
            // exactly through a corner
            cellX += stepX;
            cellY += stepY;
            distanceTraveled = tMaxX;
            tMaxX += tDeltaX;
            tMaxY += tDeltaY;
        }
    }

    return returnAll ? allBlocks : null; // no hit within maxDistance
}
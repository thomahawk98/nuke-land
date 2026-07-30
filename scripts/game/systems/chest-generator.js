function generateChestContents(amount, lootPool = 'test chest') {
    const contents = Array(amount).fill(false);
    const options = getRandomOptionsFromLootPool(lootPool);
    if (!options.length) return contents;
    for (let n = 0; n < amount; n++) {
        const itemChance = getItemChanceFromLootPool(lootPool);
        if (Math.random() > itemChance) continue; // no item here


        // pick a random option based on the options relative weights
        const totalWeight = options.reduce((sum, { weight }) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        const option = options.find(option => {
            random -= option.weight;
            return random < 0;
        });

        const type = option.type;
        const count = Math.ceil(Math.random() * option.maxCount);

        // set item
        const item = new Item(type, count);
        if (option.subtype) item.subtype = option.subtype;
        contents[n] = item;
    }

    return contents;
}

function getRandomOptionsFromLootPool(lootPool) {
    switch (lootPool) {
        case 'test chest':
            return [
                { type: 'test item', maxCount: 99, weight: 1 },
            ];
        case 'weapons chest':
            return [
                { type: 'ammo', subtype: 'pistol', maxCount: 12, weight: 3 },
                { type: 'ammo', subtype: 'shotgun', maxCount: 8, weight: 3 },
                { type: 'bat', maxCount: 1, weight: 3 },
                { type: 'machete', maxCount: 1, weight: 2 },
                { type: 'spiked bat', maxCount: 1, weight: 1.5 },
                { type: 'axe', maxCount: 1, weight: 1 },
                { type: 'pistol', maxCount: 1, weight: 1 },
                { type: 'shotgun', maxCount: 1, weight: 1 },
                { type: 'flamethrower', maxCount: 1, weight: 100 },
            ];
        case 'food chest':
            return [
                { type: 'food', maxCount: 4, weight: 1 },
            ];
        default: return [];
    }
}

function getItemChanceFromLootPool(lootPool) {
    switch (lootPool) {
        case 'food chest':
            return 0.35;
        default:
            return 0.2;
    }
}
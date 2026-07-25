function generateChestContents(amount, lootPool) {
    const contents = Array(amount).fill(false);
    for (let n = 0; n < amount; n++) {
        const itemChance = 0.1;
        if (Math.random() > itemChance) continue; // no item here

        const options = getRandomOptionsFromLootPool(lootPool);

        // pick a random option based on the options relative weights
        const totalWeight = options.reduce((sum, { weight }) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        const option = options.find(option => {
            random -= option.weight;
            return random < 0;
        });

        const type = option.type;
        const count = Math.floor(Math.random() * option.maxCount);

        // set item
        const item = new Item(type, { slot: n }, count);
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
        default: return [];
    }
}
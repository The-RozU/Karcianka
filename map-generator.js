// Proceduralny generator mapy Calionu. Każde pole ma tylko przejścia do przodu.
// N pól przed bossem (N = numer piętra + 4), bez liczenia wejścia i bossa.
const FLOOR_STEP_WIDTH = 115;
const FLOOR_START_X = 56;
const FLOOR_MAP_HEIGHT = 450;

function floorRandomPick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function floorDirectedEdge(from, to) {
    if (!from.targets.includes(to.id)) from.targets.push(to.id);
}

function generateFloorMap(floor = 1) {
    const number = Math.max(1, Math.floor(Number(floor) || 1));
    const fieldsBeforeBoss = number + 4;
    const boss = pickRandomCalionBoss();
    const hpBonus = (number - 1) * DUEL.ACT_HP_STEP;
    const regularHp = DUEL.ZBIR_BASE_HP + hpBonus;
    const eliteHp = DUEL.ELITE_BASE_HP + hpBonus;
    const bossHp = DUEL.BOSS_BASE_HP + hpBonus;
    const nodes = [];
    let nextId = 0;

    function addNode(type, x, y, options = {}) {
        const regularEnemy = type === 'fight' ? floorRandomPick(REGULAR_ENEMIES) : null;
        const eliteEnemy = type === 'elite' ? pickRandomEnemyTrait() : null;
        const enemy = type === 'boss' ? boss : (regularEnemy || eliteEnemy);
        const descriptions = {
            start: ['🏕️', 'Początek piętra'],
            fight: ['⚔️', enemy ? enemy.name : 'Walka'],
            elite: ['💀', enemy ? enemy.name : 'Elita'],
            boss: ['👑', boss.name],
            shop: ['🪙', 'Karczemny Kram'],
            heal: ['🧪', 'Zapasy Medyczne'],
            chest: ['📦', 'Ukryta Skrzynia'],
            event: ['?', 'Nieznane zdarzenie']
        };
        const visual = descriptions[type];
        const node = {
            id: nextId++, x, y, type,
            icon: visual[0], title: visual[1],
            hp: type === 'fight' ? regularHp : type === 'elite' ? eliteHp : type === 'boss' ? bossHp : 0,
            xp: type === 'fight' ? 50 : type === 'elite' ? 110 : type === 'boss' ? 250 : 0,
            enemy, targets: [], cleared: type === 'start',
            ...options
        };
        nodes.push(node);
        return node;
    }

    const spine = [];
    const mysteryStep = Math.max(2, Math.round(fieldsBeforeBoss * 0.55));
    for (let step = 0; step <= fieldsBeforeBoss + 1; step++) {
        let type;
        if (step === 0) type = 'start';
        else if (step === fieldsBeforeBoss + 1) type = 'boss';
        else if (step === 1) type = 'fight';
        else if (step === mysteryStep) type = 'event';
        else if (step === fieldsBeforeBoss) type = 'shop';
        else type = floorRandomPick(['fight', 'fight', 'fight', 'elite', 'event', 'event', 'chest', 'heal', 'shop']);

        const y = (step === 0 || step === fieldsBeforeBoss + 1)
            ? 225 : 225 + Math.floor((Math.random() - 0.5) * 64);
        const node = addNode(type, FLOOR_START_X + step * FLOOR_STEP_WIDTH, y, { column: step });
        if (spine.length) floorDirectedEdge(spine[spine.length - 1], node);
        spine.push(node);
    }

    // Dłuższe, opcjonalne trasy: walka/strażnik -> nagroda -> powrót na szlak.
    // Nigdy nie skracają podstawowej trasy do bossa.
    const candidateSegments = Array.from({length: fieldsBeforeBoss}, (_, i) => i);
    for (let i = candidateSegments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidateSegments[i], candidateSegments[j]] = [candidateSegments[j], candidateSegments[i]];
    }
    const detourCount = Math.min(fieldsBeforeBoss, 2 + Math.floor((number - 1) / 4), 5);
    candidateSegments.slice(0, detourCount).sort((a, b) => a - b).forEach((segment, index) => {
        const from = spine[segment], to = spine[segment + 1];
        const upper = index % 2 === 0;
        const sideY = upper ? 100 : 350;
        const guard = addNode(
            Math.random() < 0.35 ? 'elite' : 'fight',
            from.x + FLOOR_STEP_WIDTH * 0.30,
            sideY,
            { column: segment + 0.30, optional: true }
        );
        const reward = addNode(
            floorRandomPick(['event', 'event', 'chest', 'heal', 'shop']),
            from.x + FLOOR_STEP_WIDTH * 0.70,
            sideY + (upper ? -20 : 20),
            { column: segment + 0.70, optional: true }
        );
        floorDirectedEdge(from, guard);
        floorDirectedEdge(guard, reward);
        floorDirectedEdge(reward, to);
    });

    return {
        boss, nodes, bossHp,
        mapWidth: FLOOR_START_X * 2 + (fieldsBeforeBoss + 1) * FLOOR_STEP_WIDTH,
        mapHeight: FLOOR_MAP_HEIGHT,
        shortestPathFields: fieldsBeforeBoss
    };
}

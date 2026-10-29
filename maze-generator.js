// Eksperymentalna mapa Calionu: labirynt 7 x 10 zamiast liniowych tras.
// Każde pole ma co najwyżej cztery przejścia. Połączenia są dwukierunkowe.
const MAZE_COLUMNS = 7;
const MAZE_ROWS = 10;
const MAZE_TILE_SIZE = 64;

function mazeShuffle(values) {
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
}

function mazeNeighbors(cell) {
    const row = Math.floor(cell / MAZE_COLUMNS);
    const col = cell % MAZE_COLUMNS;
    const result = [];
    if (row > 0) result.push(cell - MAZE_COLUMNS);
    if (row < MAZE_ROWS - 1) result.push(cell + MAZE_COLUMNS);
    if (col > 0) result.push(cell - 1);
    if (col < MAZE_COLUMNS - 1) result.push(cell + 1);
    return result;
}

function mazeConnect(corridors, a, b) {
    if (!corridors[a].includes(b)) corridors[a].push(b);
    if (!corridors[b].includes(a)) corridors[b].push(a);
}

function mazeFindPath(corridors, start, boss) {
    const previous = new Map([[start, -1]]);
    const queue = [start];
    for (let i = 0; i < queue.length; i++) {
        const cell = queue[i];
        if (cell === boss) break;
        for (const next of corridors[cell]) {
            if (previous.has(next)) continue;
            previous.set(next, cell);
            queue.push(next);
        }
    }
    if (!previous.has(boss)) return [];
    const path = [];
    for (let at = boss; at !== -1; at = previous.get(at)) path.push(at);
    return path.reverse();
}

function mazeCreateCorridors(start, boss) {
    const count = MAZE_COLUMNS * MAZE_ROWS;
    const corridors = Array.from({ length: count }, () => []);
    const seen = new Set([start]);
    const stack = [start];

    // Losowe drzewo labiryntu: każde pole będzie osiągalne.
    while (stack.length) {
        const from = stack[stack.length - 1];
        const choices = mazeNeighbors(from).filter(next => !seen.has(next));
        if (!choices.length) {
            stack.pop();
            continue;
        }
        const to = choices[Math.floor(Math.random() * choices.length)];
        mazeConnect(corridors, from, to);
        seen.add(to);
        stack.push(to);
    }

    // Start zawsze ma co najmniej dwa wyjscia, wiec gracz moze wybrac droge.
    for (const next of mazeShuffle(mazeNeighbors(start))) {
        if (corridors[start].length >= 2) break;
        mazeConnect(corridors, start, next);
    }

    // Dodatkowe petle pozwalaja wracac roznymi drogami. Nie usuwamy
    // slepych zaulkow, poniewaz dwa z nich skrywaja leczenie za walka.
    const possibleDoors = [];
    for (let cell = 0; cell < count; cell++) {
        for (const next of mazeNeighbors(cell)) {
            if (next <= cell || cell === boss || next === boss || cell === start || next === start) continue;
            if (!corridors[cell].includes(next)) possibleDoors.push([cell, next]);
        }
    }
    let added = 0;
    for (const [a, b] of mazeShuffle(possibleDoors)) {
        if (added >= 9) break;
        if (corridors[a].length <= 1 || corridors[b].length <= 1) continue;
        mazeConnect(corridors, a, b);
        added++;
    }
    return corridors;
}

function generateFloorMap(floor = 1) {
    const number = Math.max(1, Math.floor(Number(floor) || 1));
    const startCell = (MAZE_ROWS - 1) * MAZE_COLUMNS + Math.floor(MAZE_COLUMNS / 2);
    const bossCell = Math.floor(MAZE_COLUMNS / 2);
    let corridors, path;

    // Ograniczamy długość obowiązkowego odcinka, by labirynt był grywalny.
    for (let attempt = 0; attempt < 120; attempt++) {
        const candidate = mazeCreateCorridors(startCell, bossCell);
        const candidatePath = mazeFindPath(candidate, startCell, bossCell);
        corridors = candidate;
        path = candidatePath;
        const steps = path.length - 1;
        if (steps >= 14 && steps <= 32) break;
    }

    const boss = pickRandomCalionBoss();
    const hpBonus = (number - 1) * DUEL.ACT_HP_STEP;
    // Stale limity na 70 pol: 10 zwyklych, 4 elity, 2 sklepy,
    // 3 skrzynie, 2 leczenia, 3 wydarzenia, 44 puste.
    const types = new Map();
    const otherCells = Array.from({ length: MAZE_COLUMNS * MAZE_ROWS }, (_, i) => i)
        .filter(i => i !== startCell && i !== bossCell);

    // Leczenie znajduje sie zawsze ZA przeciwnikiem: w slepym zaulku,
    // do ktorego prowadzi tylko jedno wejscie przez pole walki.
    // Rezerwujemy dwa rozne pola walki, aby nie kumulowac nagrod.
    const mainFirst = path[1];
    const preBoss = path[path.length - 2];
    const healingCandidates = mazeShuffle(otherCells.filter(cell => {
        if (cell === mainFirst || cell === preBoss || path.includes(cell)) return false;
        if (corridors[cell].length !== 1) return false;
        const guardian = corridors[cell][0];
        return guardian !== startCell && guardian !== bossCell
            && guardian !== mainFirst && guardian !== preBoss;
    }));
    const healRooms = [];
    const guardianRooms = new Set();
    for (const cell of healingCandidates) {
        const guardian = corridors[cell][0];
        if (guardianRooms.has(guardian) || healRooms.includes(guardian)) continue;
        if (healRooms.length && guardian === healRooms[0]) continue;
        healRooms.push(cell);
        guardianRooms.add(guardian);
        if (healRooms.length === 2) break;
    }
    // Przy wyjatkowo rzadkim ukladzie bez dwoch odpowiednich slepych
    // zaulkow generujemy labirynt ponownie (patrz warunek w petli wyzej).
    if (healRooms.length !== 2) {
        throw new Error('Labirynt nie ma dwoch odrebnych zaulkow z leczeniem');
    }

    types.set(mainFirst, 'fight');
    types.set(preBoss, 'shop');
    for (const cell of healRooms) types.set(cell, 'heal');
    for (const cell of guardianRooms) types.set(cell, 'fight');

    const pool = mazeShuffle([
        ...Array(10 - 1 - guardianRooms.size).fill('fight'),
        ...Array(4).fill('elite'),
        ...Array(1).fill('shop'),
        ...Array(3).fill('chest'),
        ...Array(3).fill('event'),
        ...Array(44).fill('empty')
    ]);
    const remaining = otherCells.filter(cell => !types.has(cell));
    if (remaining.length !== pool.length) throw new Error('Niepoprawna pula pol labiryntu');
    remaining.forEach((cell, i) => types.set(cell, pool[i]));

    const nodes = [];
    const byCell = new Map();
    function addNode(cell, type) {
        const row = Math.floor(cell / MAZE_COLUMNS);
        const col = cell % MAZE_COLUMNS;
        const regular = type === 'fight'
            ? REGULAR_ENEMIES[Math.floor(Math.random() * REGULAR_ENEMIES.length)] : null;
        const elite = type === 'elite' ? pickRandomEnemyTrait() : null;
        const enemy = type === 'boss' ? boss : (regular || elite);
        const descriptions = {
            start: ['🏕️', 'Wejście do labiryntu'],
            empty: ['·', 'Pusty korytarz'],
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
            id: nodes.length, row, col,
            x: (col + 0.5) * MAZE_TILE_SIZE,
            y: (row + 0.5) * MAZE_TILE_SIZE,
            type, icon: visual[0], title: visual[1],
            hp: type === 'fight' ? DUEL.ZBIR_BASE_HP + hpBonus
                : type === 'elite' ? DUEL.ELITE_BASE_HP + hpBonus
                : type === 'boss' ? DUEL.BOSS_BASE_HP + hpBonus : 0,
            xp: type === 'fight' ? 50 : type === 'elite' ? 110 : type === 'boss' ? 250 : 0,
            enemy, targets: [], cleared: type === 'start' || type === 'empty'
        };
        nodes.push(node);
        byCell.set(cell, node);
    }

    // ID=0 musi pozostać startem, bo reszta gry od niego rozpoczyna wyprawę.
    addNode(startCell, 'start');
    for (const cell of otherCells) addNode(cell, types.get(cell));
    addNode(bossCell, 'boss');
    for (const [cell, node] of byCell) {
        node.targets = corridors[cell].map(next => byCell.get(next).id);
    }

    return {
        boss, nodes, bossHp: DUEL.BOSS_BASE_HP + hpBonus,
        mapWidth: MAZE_COLUMNS * MAZE_TILE_SIZE,
        mapHeight: MAZE_ROWS * MAZE_TILE_SIZE,
        shortestPathFields: path.length - 1,
        mazeColumns: MAZE_COLUMNS, mazeRows: MAZE_ROWS
    };
}

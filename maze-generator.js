// Eksperymentalna mapa Calionu: labirynt 5 x 8 zamiast liniowych tras.
// Każde pole ma co najwyżej cztery przejścia. Połączenia są dwukierunkowe.
const MAZE_COLUMNS = 5;
const MAZE_ROWS = 8;
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

    // Dwa dodatkowe przejścia tworzą wybór trasy, bez usuwania ślepych zaułków.
    const possibleDoors = [];
    for (let cell = 0; cell < count; cell++) {
        for (const next of mazeNeighbors(cell)) {
            if (next <= cell || cell === boss || next === boss) continue;
            if (!corridors[cell].includes(next)) possibleDoors.push([cell, next]);
        }
    }
    mazeShuffle(possibleDoors).slice(0, 2).forEach(([a, b]) => mazeConnect(corridors, a, b));
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
        if (steps >= 10 && steps <= 22) break;
    }

    const boss = pickRandomCalionBoss();
    const hpBonus = (number - 1) * DUEL.ACT_HP_STEP;
    const pool = mazeShuffle([
        ...Array(12).fill('empty'), ...Array(11).fill('fight'),
        ...Array(3).fill('elite'), ...Array(5).fill('event'),
        ...Array(3).fill('chest'), ...Array(2).fill('heal'),
        ...Array(2).fill('shop')
    ]);
    const types = new Map();
    const otherCells = Array.from({ length: MAZE_COLUMNS * MAZE_ROWS }, (_, i) => i)
        .filter(i => i !== startCell && i !== bossCell);
    otherCells.forEach((cell, i) => types.set(cell, pool[i]));
    // Pierwszy krok uczy starcia, a tuż przed bossem czeka zaopatrzenie.
    if (path.length > 3) {
        types.set(path[1], 'fight');
        types.set(path[path.length - 2], 'shop');
    }

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

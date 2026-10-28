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

    // Losowe 3–5 równoległych szlaków. Wspólne wejście i boss.
    // Kolejne kolumny są obowiązkowe: żadna krawędź nie pomija piętra mapy.
    const laneCount = 3 + Math.floor(Math.random() * 3);
    const shortestLane = Math.floor(Math.random() * laneCount);
    const laneGap = 310 / (laneCount - 1);
    const lanes = Array.from({ length: laneCount }, (_, lane) => 70 + lane * laneGap);
    const columns = [];
    const start = addNode('start', FLOOR_START_X, 225, { column: 0 });
    columns.push([start]);

    const randomTypes = ['fight', 'fight', 'fight', 'elite', 'event', 'event', 'chest', 'heal', 'shop'];
    for (let column = 1; column <= fieldsBeforeBoss; column++) {
        const row = [];
        for (let lane = 0; lane < laneCount; lane++) {
            let type = floorRandomPick(randomTypes);
            // Po drodze pojawią się nieznane wydarzenia, a przed bossem
            // przynajmniej jedna szansa na zakup zapasów.
            if (column === 1) type = 'fight';
            if (column === fieldsBeforeBoss && lane === shortestLane) type = 'shop';
            if (column === Math.ceil(fieldsBeforeBoss / 2) && lane === shortestLane) type = 'event';
            const y = Math.round(lanes[lane] + (Math.random() - 0.5) * 24);
            row.push(addNode(type, FLOOR_START_X + column * FLOOR_STEP_WIDTH, y, { column, lane }));
        }
        columns.push(row);
    }
    const bossNode = addNode('boss', FLOOR_START_X + (fieldsBeforeBoss + 1) * FLOOR_STEP_WIDTH, 225, {
        column: fieldsBeforeBoss + 1
    });
    columns.push([bossNode]);

    // Każda droga jest pełnoprawną trasą od wejścia aż do bossa.
    for (let lane = 0; lane < laneCount; lane++) {
        floorDirectedEdge(start, columns[1][lane]);
        for (let column = 1; column < fieldsBeforeBoss; column++) {
            const from = columns[column][lane];
            const to = columns[column + 1][lane];
            // Każda trasa poza losowo wybraną najkrótszą ma jeden
            // dodatkowy etap (przed możliwością zmiany ścieżki).
            if (lane !== shortestLane && column === 1) {
                const extra = addNode(
                    floorRandomPick(['fight', 'elite', 'event', 'chest']),
                    Math.round((from.x + to.x) / 2),
                    Math.round((from.y + to.y) / 2),
                    { column: column + 0.5, lane, optional: true }
                );
                floorDirectedEdge(from, extra);
                floorDirectedEdge(extra, to);
            } else {
                floorDirectedEdge(from, to);
            }
        }
        floorDirectedEdge(columns[fieldsBeforeBoss][lane], bossNode);
    }

    // Połączenia pomiędzy trasami umożliwiają zmianę drogi
    // w trakcie wyprawy. Łączą wyłącznie sąsiednie kolumny
    // i sąsiednie pasy, więc nie skracają wymaganej liczby pól.
    // Pierwsze rozgałęzienie jest bez skrótów, aby najkrótsza
    // droga rzeczywiście zaczynała się od losowo wybranego pasa.
    let crossings = 0;
    for (let column = 2; column < fieldsBeforeBoss; column++) {
        for (let lane = 0; lane < laneCount; lane++) {
            const direction = Math.random() < 0.5 ? -1 : 1;
            const targetLane = lane + direction;
            if (targetLane < 0 || targetLane >= laneCount) continue;
            if (Math.random() < 0.42) {
                floorDirectedEdge(columns[column][lane], columns[column + 1][targetLane]);
                crossings++;
            }
        }
    }
    // Gwarantowane przecięcie, również na pierwszych piętrach.
    if (!crossings) {
        const column = Math.min(2, fieldsBeforeBoss - 1);
        const lane = Math.floor(Math.random() * (laneCount - 1));
        floorDirectedEdge(columns[column][lane], columns[column + 1][lane + 1]);
    }

    return {
        boss, nodes, bossHp,
        mapWidth: FLOOR_START_X * 2 + (fieldsBeforeBoss + 1) * FLOOR_STEP_WIDTH,
        mapHeight: FLOOR_MAP_HEIGHT,
        shortestPathFields: fieldsBeforeBoss,
        laneCount,
        shortestLane
    };
}

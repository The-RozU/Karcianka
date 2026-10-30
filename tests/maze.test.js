'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');
const gameSource = source('game.js');
const generatorSource = source('maze-generator.js');
const html = source('index.html');
const css = source('maze-map.css');
const devSource = source('dev.js');

const DUEL = {
    ZBIR_BASE_HP: 500, ELITE_BASE_HP: 750,
    BOSS_BASE_HP: 900, ACT_HP_STEP: 125
};
function createGenerator() {
    const context = vm.createContext({
        DUEL, REGULAR_ENEMIES: [{ name: 'Zbir', id: 'zbir' }],
        pickRandomCalionBoss: () => ({ name: 'Boss', id: 'boss' }),
        pickRandomEnemyTrait: () => ({ name: 'Elita', id: 'elita' })
    });
    vm.runInContext(generatorSource, context, { filename: 'maze-generator.js' });
    return () => context.generateFloorMap();
}

function snippetBetween(from, until) {
    const a = gameSource.indexOf(from);
    const b = gameSource.indexOf(until, a + 1);
    assert.ok(a >= 0 && b > a, 'Nie znaleziono sekcji: ' + from);
    return gameSource.slice(a, b);
}

function fakeClasses() {
    const classes = new Set();
    return {
        add: (...values) => values.forEach(value => classes.add(value)),
        remove: (...values) => values.forEach(value => classes.delete(value)),
        contains: value => classes.has(value)
    };
}
function fakeElement(tagName) {
    return {
        tagName, classList: fakeClasses(), dataset: {}, children: [], disabled: false,
        style: { setProperty() {}, removeProperty() {} },
        appendChild(child) {
            if (child.tagName === 'fragment') this.children.push(...child.children);
            else this.children.push(child);
            return child;
        },
        replaceChildren() { this.children = []; },
        querySelector(selector) {
            const name = selector.slice(1);
            return this.children.find(child => child.classList.contains(name)
                || (child.className || '').split(/\s+/).includes(name)) || null;
        },
        querySelectorAll(selector) {
            const name = selector.slice(1);
            return this.children.filter(child => child.classList.contains(name)
                || (child.className || '').split(/\s+/).includes(name));
        },
        setAttribute(key, value) { this[key] = value; },
        get offsetTop() { return ((Number(this.style.gridRow) || 1) - 1) * 60; },
        get offsetHeight() { return 60; }
    };
}
function createNavigationHarness(map) {
    const board = fakeElement('div');
    const viewport = fakeElement('div');
    viewport.clientHeight = 180;
    viewport.scrollTo = ({ top }) => { viewport.scrollTop = top; };
    const document = {
        getElementById: id => id === 'mapBoard' ? board : id === 'mapViewport' ? viewport : null,
        createElement: fakeElement,
        createDocumentFragment: () => fakeElement('fragment')
    };
    const mapRun = {
        active: true, nodes: map.nodes, currentNodeId: 0,
        visitedNodes: new Set([0]), discoveredNodes: new Set(),
        mazeColumns: 7, mazeRows: 10
    };
    const arrivals = [];
    const context = vm.createContext({
        document, mapRun, gameOver: true,
        window: {
            __devPrevNodeId: 0,
            matchMedia: () => ({ matches: true })
        },
        setTimeout: callback => callback(),
        resolveMapNodeArrival: (node, previouslyVisited) => {
            arrivals.push({ id: node.id, previouslyVisited });
        }
    });
    vm.runInContext(
        snippetBetween('function renderMazeMap(', 'function openMapModal('),
        context
    );
    vm.runInContext(
        snippetBetween('let mazeWalkInProgress = false;', 'function resolveMapNodeArrival('),
        context
    );
    return {
        board, viewport, mapRun, arrivals, context,
        render: () => context.renderMazeMap(false),
        tiles: () => new Map(board.querySelectorAll('.maze-tile')
            .map(tile => [Number(tile.dataset.nodeId), tile]))
    };
}

test('składnia gry, generatora i podstawowe podłączenie', () => {
    new vm.Script(gameSource, { filename: 'game.js' });
    new vm.Script(generatorSource, { filename: 'maze-generator.js' });
    assert.match(html, /src="maze-generator\.js(?:\?v=[^"]+)?"/);
    assert.match(html, /src="game\.js(?:\?v=[^"]+)?"/);
    assert.match(html, /href="maze-map\.css"/);
    assert.doesNotMatch(html, /svgLayer|src="map-generator\.js"/);
    assert.doesNotMatch(gameSource, /function renderDiceyMap\(|\bsvgLayer\b|node-plate/);
    assert.ok(!fs.existsSync(path.join(root, 'map-generator.js')));
    assert.match(gameSource, /renderMazeMap\(lockMovement\)/);
    assert.match(devSource, /__devPrevNodeId/);
    assert.match(gameSource, /__devPrevNodeId/);
    assert.match(gameSource, /mazeColumns: generated\.mazeColumns/);
    assert.match(gameSource, /mazeRows: generated\.mazeRows/);
});

test('1000 map 7x10: spójność, limity i leczenie za przeciwnikiem', () => {
    const generate = createGenerator();
    const expected = {
        start: 1, boss: 1, fight: 10, elite: 4,
        shop: 2, chest: 3, heal: 2, event: 3, empty: 44
    };
    for (let repeat = 0; repeat < 1000; repeat++) {
        const map = generate();
        const nodes = map.nodes;
        const byId = new Map(nodes.map(node => [node.id, node]));
        assert.equal(nodes.length, 70);
        assert.equal(nodes[0].row, 9);
        assert.equal(nodes[0].col, 3);
        assert.equal(nodes[nodes.length - 1].row, 0);
        assert.equal(nodes[nodes.length - 1].col, 3);
        assert.ok(nodes[0].targets.length >= 2);
        assert.ok(nodes.filter(node => node.targets.length >= 3).length >= 3);
        const count = {};
        for (const node of nodes) {
            count[node.type] = (count[node.type] || 0) + 1;
            for (const nextId of node.targets) {
                const next = byId.get(nextId);
                assert.ok(next);
                assert.ok(next.targets.includes(node.id));
                assert.equal(Math.abs(node.row - next.row) + Math.abs(node.col - next.col), 1);
            }
            if (node.type === 'heal') {
                assert.equal(node.targets.length, 1);
                assert.equal(byId.get(node.targets[0]).type, 'fight');
            }
        }
        for (const [type, total] of Object.entries(expected)) {
            assert.equal(count[type], total, 'Typ: ' + type);
        }
        const reached = new Set([0]);
        const queue = [0];
        for (let j = 0; j < queue.length; j++) {
            for (const id of byId.get(queue[j]).targets) {
                if (reached.has(id)) continue;
                reached.add(id);
                queue.push(id);
            }
        }
        assert.equal(reached.size, 70);
    }
});

test('szare przejścia pokazują ikony obok postaci, ukrywają je po odejściu i nie pokazują ścian', () => {
    const harness = createNavigationHarness(createGenerator()());
    harness.render();
    let tiles = harness.tiles();
    const exits = harness.mapRun.nodes[0].targets;
    assert.ok(exits.length >= 2);
    assert.equal(tiles.size, 70);
    for (const exit of exits) {
        const tile = tiles.get(exit);
        assert.ok(tile.classList.contains('maze-frontier'));
        assert.ok(tile.classList.contains('maze-walls-hidden'));
        assert.equal(tile.textContent, harness.mapRun.nodes.find(node => node.id === exit).icon);
        assert.ok(tile.classList.contains('maze-frontier-adjacent'));
        assert.equal(tile.disabled, false);
    }
    assert.ok(tiles.get(0).classList.contains('maze-walls-revealed'));

    const first = exits[0];
    harness.mapRun.visitedNodes.add(first);
    harness.mapRun.currentNodeId = first;
    harness.render();
    tiles = harness.tiles();
    const missedExit = exits[1];
    assert.ok(tiles.get(missedExit).classList.contains('maze-frontier'));
    assert.equal(tiles.get(missedExit).textContent, '');
    assert.ok(!tiles.get(missedExit).classList.contains('maze-frontier-adjacent'));
    assert.ok(tiles.get(missedExit).classList.contains('maze-walls-hidden'));
    assert.ok(tiles.get(first).classList.contains('maze-walls-revealed'));
    assert.equal(tiles.get(missedExit).disabled, true);
    // Boss pozostaje widoczny mimo oddalenia, bez odslaniania scian ani trasy.
    const boss = harness.mapRun.nodes.find(node => node.type === 'boss');
    const bossTile = tiles.get(boss.id);
    assert.ok(bossTile.classList.contains('boss-tile'));
    assert.ok(bossTile.classList.contains('maze-walls-hidden'));
    assert.equal(bossTile.textContent, boss.icon);
    assert.equal(bossTile.disabled, true);
});

test('ukończone pokoje zachowują pierwotne ikony na zielonym tle', () => {
    const harness = createNavigationHarness(createGenerator()());
    const kinds = ['fight', 'elite', 'chest', 'heal', 'shop', 'event'];
    for (const type of kinds) {
        const node = harness.mapRun.nodes.find(node => node.type === type);
        assert.ok(node);
        node.originalIcon = node.icon;
        node.originalTitle = node.title;
        node.cleared = true;
        if (type !== 'shop') {
            node.type = 'empty';
            node.icon = '🪵';
        }
        harness.mapRun.visitedNodes.add(node.id);
    }
    harness.render();
    const tiles = harness.tiles();
    for (const type of kinds) {
        const node = harness.mapRun.nodes.find(node => node.originalTitle &&
            node.originalTitle !== 'Wejście do labiryntu' &&
            node.originalIcon === ({
                fight: '⚔️', elite: '💀', chest: '📦', heal: '🧪',
                shop: '🪙', event: '?'
            })[type]);
        assert.ok(node);
        const tile = tiles.get(node.id);
        assert.equal(tile.textContent, node.originalIcon);
        assert.ok(tile.classList.contains('maze-completed'));
        assert.ok(tile.classList.contains('explored'));
    }
    assert.match(css, /maze-walls-revealed/);
    assert.match(css, /maze-frontier/);
});

test('automatyczny powrót tylko przez odwiedzone korytarze', async () => {
    const harness = createNavigationHarness(createGenerator()());
    const nodes = harness.mapRun.nodes;
    const byId = new Map(nodes.map(node => [node.id, node]));
    const bossId = nodes.at(-1).id;
    const queue = [0], previous = new Map([[0, null]]);
    for (let i = 0; i < queue.length && !previous.has(bossId); i++) {
        for (const id of byId.get(queue[i]).targets) {
            if (previous.has(id)) continue;
            previous.set(id, queue[i]);
            queue.push(id);
        }
    }
    const toBoss = [];
    for (let id = bossId; id !== null; id = previous.get(id)) toBoss.unshift(id);
    harness.mapRun.visitedNodes = new Set(toBoss);
    harness.mapRun.currentNodeId = bossId;
    harness.render();
    const route = harness.context.findMazeVisitedRoute(bossId, 0);
    assert.ok(route.length > 1);
    assert.equal(route.at(-1), 0);
    await harness.context.walkMazeRoute(route);
    assert.equal(harness.mapRun.currentNodeId, 0);
    assert.equal(harness.arrivals.length, 1);
    assert.equal(harness.arrivals[0].previouslyVisited, true);
    assert.equal(harness.context.findMazeVisitedRoute(0, 0).length, 0);
    const unexplored = nodes.find(node => !harness.mapRun.visitedNodes.has(node.id));
    assert.ok(unexplored);
    assert.equal(harness.context.findMazeVisitedRoute(0, unexplored.id).length, 0);
});

test('zachowane moduły fabularne i dane nie korzystają ze starego generatora', () => {
    const paths = [
        'dev.js', 'player-stats.js', 'data/items/shop-items.js',
        'data/enemies/regular.js', 'data/enemies/elite.js', 'data/enemies/bosses.js',
        'src/events/eventActions.js', 'src/events/eventConditions.js',
        'src/events/eventEngine.js', 'src/events/eventRegistry.js',
        'src/events/eventState.js'
    ];
    for (const name of paths) {
        assert.ok(fs.existsSync(path.join(root, name)), name);
        assert.ok(source(name).length > 0);
        assert.doesNotMatch(source(name), /map-generator\.js/);
    }
});


test('zwycięstwo w walce zachowuje EXP, monety i ikonę ukończonego starcia', () => {
    const target = { id: 17, type: 'fight', icon: '⚔️', title: 'Zbir', xp: 50, cleared: false };
    const mapRun = {
        active: true, act: 1, nodes: [target], currentNodeId: 17,
        playerHp: 550, playerMaxHp: 750, xp: 0, level: 1
    };
    const duel = {
        stats: { dealt: 450, taken: 110, blocked: 20 },
        playerHp: 550, playerMaxHp: 750, streak: 0, token: 7,
        active: true, round: 4
    };
    const runStats = {
        enemiesDefeated: 0, bossesDefeated: 0, coinsEarned: 0
    };
    const elements = new Map();
    const document = {
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, { style: {}, innerText: '', innerHTML: '' });
            return elements.get(id);
        }
    };
    const context = vm.createContext({
        document, mapRun, duel, runStats, DUEL: { POST_FIGHT_HEAL: 150 },
        coins: 0, currentFightBonus: 0, currentEnemyTrait: { name: 'Zbir' },
        gameOver: false, setHandResolutionPending() {}, playHaptic() {},
        showFloatingText() {}, updateUI() {}, recordRunResult() {},
        toggleModal() {}, setTimeout(callback) { callback(); },
        gainXp(amount) { mapRun.xp += amount; return 0; }
    });
    vm.runInContext(snippetBetween('function duelEnd(', 'function duelPlay('), context);
    context.duelEnd(true);
    assert.equal(context.coins, runStats.coinsEarned);
    assert.ok(context.coins >= 12);
    assert.equal(runStats.enemiesDefeated, 1);
    assert.equal(mapRun.xp, 50);
    assert.equal(mapRun.playerHp, 700);
    assert.equal(target.cleared, true);
    assert.equal(target.type, 'empty');
    assert.equal(target.originalIcon, '⚔️');
    assert.equal(target.originalTitle, 'Zbir');
    assert.equal(elements.get('duelMapContinueBtn').style.display, 'block');
    assert.equal(elements.get('duelNextActBtn').style.display, 'none');
});

test('boss odblokowuje kolejne piętro i zeruje poznane przejścia', () => {
    const generate = createGenerator();
    const run = {
        act: 1, nodes: [{ id: 7 }], currentNodeId: 7,
        visitedNodes: new Set([7]), discoveredNodes: new Set([1, 4])
    };
    const context = vm.createContext({
        mapRun: run, stopMazeWalk() {}, toggleModal() {},
        generateActMap: () => generate(), openMapModal() {}, updateUI() {}
    });
    vm.runInContext(
        snippetBetween('function startNextDuelAct(', '// Jedyny widok mapy:'),
        context
    );
    context.startNextDuelAct();
    assert.equal(run.act, 2);
    assert.equal(run.nodes.length, 70);
    assert.equal(run.currentNodeId, 0);
    assert.deepEqual(Array.from(run.visitedNodes), [0]);
    assert.equal(run.discoveredNodes.size, 0);
    assert.equal(run.mazeColumns, 7);
    assert.equal(run.mazeRows, 10);
});

test('wydarzenie na pierwszym piętrze nie dodaje walk ponad limit', () => {
    const event = { id: 15, type: 'event', originalIcon: '?', cleared: false };
    const mapRun = { mazeColumns: 7, mazeRows: 10, act: 1, nodes: [event] };
    const elements = new Map();
    let fights = 0;
    let opened = 0;
    const math = Object.create(Math);
    math.random = () => 0.98;
    const context = vm.createContext({
        Math: math, mapRun, runStats: { mysteryEvents: 0, coinsEarned: 0 },
        coins: 0, duel: { playerHp: 750 }, DUEL,
        document: { getElementById(id) {
            if (!elements.has(id)) elements.set(id, { innerText: '', innerHTML: '' });
            return elements.get(id);
        } },
        updateUI() {}, toggleModal() { opened++; },
        openMapShopNode() { throw new Error('Nieoczekiwany sklep'); },
        startDuelFromMapNode() { fights++; }
    });
    vm.runInContext(
        snippetBetween('function openMysteryMapEvent(', 'function openHealSpringNode('),
        context
    );
    context.openMysteryMapEvent(event);
    assert.equal(fights, 0);
    assert.equal(opened, 1);
    assert.equal(event.type, 'empty');
    assert.equal(event.cleared, true);
    assert.ok(context.coins > 0);
    assert.equal(context.runStats.mysteryEvents, 1);
});

test('balans mnożników pokerowych: progresja co 0,5', () => {
    const rules = gameSource.match(/const HAND_RULES = \{([\s\S]*?)\n\};/);
    assert.ok(rules);
    const expected = {
        highCard: 1, pair: 1.5, twoPair: 1.5,
        threeKind: 2, straight: 2.5, flush: 3,
        fullHouse: 3.5, fourKind: 4, poker: 4.5
    };
    for (const [key, multiplier] of Object.entries(expected)) {
        const line = rules[1].split('\n').find(line => line.trim().startsWith(key + ':'));
        assert.ok(line, key);
        assert.match(line, new RegExp('mult: ' + multiplier + ' \\}'), key);
    }
    assert.match(gameSource, /let finalMultiplier = rule\.mult/);
});

test('widoczna tabela punktacji odpowiada mnożnikom obrażeń w HAND_RULES', () => {
    const section = html.split('<div class="modal-overlay" id="scoreModal">')[1]
        .split('<div class="modal-overlay" id="shopModal">')[0];
    const names = [
        ['poker', 'Poker'], ['fourKind', 'Kareta'], ['fullHouse', 'Full'],
        ['flush', 'Kolor'], ['straight', 'Strit'], ['threeKind', 'Trójka'],
        ['twoPair', 'Dwie Pary'], ['pair', 'Para'], ['highCard', 'Wysoka Karta']
    ];
    for (const [key, label] of names) {
        const rule = gameSource.match(new RegExp('^\\s*' + key + ': \\{[^\\n]*mult: ([0-9.]+)', 'm'));
        assert.ok(rule, key);
        const mult = Number(rule[1]);
        const row = section.split('\n').find(line => line.includes('<tr><td>' + label));
        assert.ok(row, label);
        assert.ok(row.includes('<td>x ' + mult + '</td>'), label + ': tabela != obrażenia');
    }
});

test('Kalon v0.4.2: nazwa, wersja i czytelny panel informacji o walce', () => {
    const layout = source('style.css');
    assert.match(html, /<title>Kalon[^<]*v0\.4\.2<\/title>/);
    assert.match(html, /<h2 class="lobby-title">Kalon<\/h2>/);
    assert.match(html, /aria-label="Wersja 0\.4\.2">v0\.4\.2<\/span>/);
    assert.match(html, /href="style\.css\?v=0\.4\.2"/);
    assert.match(html, /src="game\.js\?v=0\.4\.2"/);
    assert.doesNotMatch(html, /0\.3\.5/);
    assert.match(gameSource, /headerName\.innerText = '⚓ Kalon'/);
    assert.match(layout, /height:\s*min\(41%,\s*305px\)/);
    assert.match(layout, /\.enemy-board \.duel-panel\s*\{[^}]*overflow-y:\s*auto/s);
    assert.match(layout, /\.enemy-board \.duel-preview\s*\{[^}]*max-height:\s*none/s);
});

test('boss widoczny od startu i po oddaleniu, bez odkrywania scian ani mozliwosci teleportacji', () => {
    const harness = createNavigationHarness(createGenerator()());
    const boss = harness.mapRun.nodes.find(node => node.type === 'boss');
    const first = harness.mapRun.nodes[0].targets[0];
    for (const position of [0, first]) {
        harness.mapRun.currentNodeId = position;
        harness.mapRun.visitedNodes.add(position);
        harness.render();
        const tile = harness.tiles().get(boss.id);
        assert.equal(tile.textContent, '👑');
        assert.equal(tile.title, boss.title);
        assert.ok(tile.classList.contains('boss-tile'));
        assert.ok(tile.classList.contains('maze-walls-hidden'));
        assert.equal(tile.disabled, true);
    }
});

test('powrot do odwiedzonego sklepu otwiera ponownie sklep z ta sama oferta', () => {
    const mapRun = { active: true };
    const calls = [];
    const offers = [{ id: 'heal_small', sold: true }, { id: 'glove', sold: false }];
    const shop = { type: 'shop', originalIcon: '🪙', cleared: true, shopOffers: offers };
    const eventMerchant = { type: 'shop', originalIcon: '?', cleared: true, shopOffers: offers };
    const visitedChest = { type: 'empty', cleared: true, originalIcon: '📦' };
    const context = vm.createContext({
        mapRun, toggleModal(id, show) { calls.push(['modal', id, show]); },
        openMapModal() { calls.push(['map']); },
        openMapShopNode() { calls.push(['shop']); },
        openChestNode() { throw Error('Skrzyni nie mozna otworzyc ponownie'); },
        openHealSpringNode() { throw Error('Leczenia nie mozna powtarzac'); },
        openMysteryMapEvent() { throw Error('Wydarzenie nie moze odpalic ponownie'); },
        startDuelFromMapNode() { throw Error('Walka nie moze sie powtarzac'); }
    });
    vm.runInContext(snippetBetween('function resolveMapNodeArrival(', '// Pierwsza, prosta pula zdarzeń.'), context);
    for (const node of [shop, eventMerchant]) {
        calls.length = 0;
        context.resolveMapNodeArrival(node, true);
        assert.deepEqual(calls.at(-1), ['shop']);
        assert.strictEqual(node.shopOffers, offers);
        assert.equal(node.shopOffers[0].sold, true);
        assert.equal(node.cleared, true);
    }
    calls.length = 0;
    context.resolveMapNodeArrival(visitedChest, true);
    assert.deepEqual(calls.at(-1), ['map']);
});

test('skrzynia przyznaje tylko monety albo jeden przedmiot jednorazowy, nigdy oba', () => {
    const sourceCode = snippetBetween('function openChestNode(', 'function closeChestToMap(');
    const itemCatalog = [
        { id: 'heal_small', name: 'Mikstura Zycia', category: 'healing', heal: 40 },
        { id: 'glove', name: 'Rekawica', category: 'consumable' },
        { id: 'dice', name: 'Kosci', category: 'consumable' },
        { id: 'relic', name: 'Artefakt', category: 'relic', isRelic: true }
    ];
    function runChest(roll, startingInventory = []) {
        const inventory = [...startingInventory];
        const runStats = { coinsEarned: 0 };
        const modal = { chestModalDesc: { innerText: '' }, chestLootSummary: { innerHTML: '' } };
        const math = Object.create(Math);
        math.random = () => roll;
        let updates = 0;
        const context = vm.createContext({
            Math: math, SHOP_ITEMS: itemCatalog, inventory, runStats,
            MAX_INV: 3, coins: 10,
            makeInventoryItem: item => ({ ...item }),
            mapRun: { playerHp: 600, playerMaxHp: 750 },
            document: { getElementById: id => modal[id] },
            updateUI() { updates++; },
            toggleModal(id, visible) {
                assert.equal(id, 'chestModal');
                assert.equal(visible, true);
            }
        });
        vm.runInContext(sourceCode, context);
        context.openChestNode();
        assert.equal(updates, 1);
        return { context, inventory, runStats, summary: modal.chestLootSummary.innerHTML };
    }
    const item = runChest(0.1);
    assert.equal(item.inventory.length, 1);
    assert.equal(item.context.coins, 10);
    assert.equal(item.runStats.coinsEarned, 0);
    assert.match(item.summary, /Znaleziony przedmiot/);
    assert.doesNotMatch(item.summary, /Znalezione monety/);
    assert.notEqual(item.inventory[0].id, 'dice');
    const gold = runChest(0.8);
    assert.equal(gold.inventory.length, 0);
    assert.ok(gold.context.coins > 10);
    assert.equal(gold.runStats.coinsEarned, gold.context.coins - 10);
    assert.match(gold.summary, /Znalezione monety/);
    assert.doesNotMatch(gold.summary, /Znaleziony przedmiot/);
    const full = runChest(0.1, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    assert.equal(full.inventory.length, 3);
    assert.ok(full.context.coins > 10);
    assert.equal(full.runStats.coinsEarned, full.context.coins - 10);
    assert.match(full.summary, /Znalezione monety/);
});

test('przyciski wyniku: wyjście po lewej i Kontynuuj po prawej', () => {
    const section = html.split('<div class="modal-overlay" id="duelResultModal">')[1]
        .split('<script src="maze-generator.js')[0];
    const lobby = section.indexOf('onclick="leaveDuel()"');
    const continueBtn = section.indexOf('id="duelMapContinueBtn"');
    const bossBtn = section.indexOf('id="duelNextActBtn"');
    const retryBtn = section.indexOf('id="duelRetryBtn"');
    assert.ok(lobby >= 0 && continueBtn > lobby && bossBtn > continueBtn && retryBtn > bossBtn);
    assert.match(section, /id="duelMapContinueBtn"[^>]*onclick="continueToMapAfterDuel\(\)"[^>]*>🗺️ Kontynuuj<\/button>/);
    assert.match(section, /class="btn-action duel-result-exit" onclick="leaveDuel\(\)">🚪 Wróć do lobby<\/button>/);
    assert.doesNotMatch(section, /Wróć na szlak/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('lobby uses Kalon logo and original card-suit artwork without obsolete branding', () => {
    const html = read('index.html');
    assert.match(html, /class="lobby-logo" src="assets\/ui\/menu\/kalon-logo\.webp" alt="Kalon"/);
    assert.match(html, /class="menu-suits-art" src="assets\/ui\/menu\/card-symbols\.webp"/);
    assert.ok(html.includes('aria-label="Pik, kier, trefl, karo"'));
    assert.ok(!html.includes('lobby-emblem'));
    assert.ok(!html.includes('ui-lobby-coins'));
    assert.ok(!html.includes('Świat Calionu'));
    assert.ok(!html.includes('Pod Złamaną Kotwicą'));
    assert.match(html, /<span>Wyprawa<\/span>/);
});

test('lobby retains all five click actions', () => {
    const html = read('index.html');
    assert.match(html, /class="btn-action hub-main-action" onclick="startDuelRun\(\)"/);
    for (const section of ['quests', 'skills', 'achievements', 'stats']) {
        assert.ok(html.includes(`onclick="openLobbySection('${section}')"`), section);
    }
});

test('menu artwork and controls stay scoped to the lobby and assets exist', () => {
    const html = read('index.html');
    const css = read('style.css');
    const assets = [
        'menu-background.webp', 'frame-short.webp', 'frame-tall.webp',
        'kalon-logo.webp', 'card-symbols.webp', 'button-expedition.webp',
        'button-normal.webp', 'button-pressed.webp', 'wood-planks-tile.webp'
    ];
    for (const asset of assets) {
        assert.ok(fs.existsSync(path.join(root, 'assets/ui/menu', asset)), asset);
        assert.ok(css.includes(`assets/ui/menu/${asset}`) || html.includes(`assets/ui/menu/${asset}`), asset);
    }
    assert.ok(!html.includes('class="menu-candle"'), 'świecznik nie może dublować dekoracji tła');
    assert.ok(!html.includes('class="menu-props"'), 'karty, kości i monety pozostają tylko w tle');
    assert.ok(!css.includes('#mainMenu .menu-candle'), 'usuń nieużywane reguły CSS świecy');
    assert.ok(!css.includes('#mainMenu .menu-props'), 'usuń nieużywane reguły CSS rekwizytów');
    assert.match(css, /#mainMenu\.lobby-overlay/);
    assert.match(css, /#mainMenu \.hub-main-action/);
    assert.match(css, /orientation:portrait/);
    assert.match(css, /prefers-reduced-motion:reduce/);
});

test('release metadata and asset cache-busting match', () => {
    const html = read('index.html');
    const version = html.match(/<title>[^<]+v(0\.\d+\.\d+)<\/title>/)?.[1];
    assert.match(version ?? '', /^0\.\d+\.\d+$/);
    assert.ok(html.includes(`class="lobby-subtitle">wersja ${version}`));
    assert.ok(html.includes(`style.css?v=${version}`));
    assert.ok(html.includes(`game.js?v=${version}`));
});

test('landscape frame keeps original proportions and compact content stays inside', () => {
    const css = read('style.css');
    const html = read('index.html');
    assert.match(css, /aspect-ratio:1672\s*\/\s*941/);
    assert.match(css, /frame-short\.webp'\) center \/ 100% auto no-repeat/);
    assert.doesNotMatch(css, /100% 145%/);
    assert.ok(!html.includes('class="hub-intro"'), 'opis pod logo powinien zostać usunięty');
    assert.ok(!html.includes('<span class="menu-btn-icon" aria-hidden="true">⚔</span>'), 'nie dubluj ikony na grafice Wyprawy');
});

test('browser chrome does not shrink landscape menu as aggressively as 0.4.36', () => {
    const css = read('style.css');
    assert.match(css, /width:min\(100vw,177\.7778dvh\)/);
    assert.match(css, /width:min\(92vw,1070px,235dvh\)/);
    assert.doesNotMatch(css, /width:min\([^)]*165dvh/);
});

test('main expedition button is shorter, taller, and centered over the four tiles', () => {
    const css = read('style.css');
    assert.match(css, /#mainMenu \.hub-main-action \{\s*width:76%;\s*max-width:520px;\s*align-self:center;/);
    assert.match(css, /#mainMenu \.hub-main-action \{width:76%;min-height:60px;padding:5px;font-size:19px\}/);
    assert.match(css, /#mainMenu \.hub-main-action \{width:90%;min-height:65px;font-size:22px\}/);
});

test('desktop menu is centered in a 16:9 scene with background on ultrawide', () => {
    const html = read('index.html');
    const css = read('style.css');
    const menu = html.slice(html.indexOf('id="mainMenu"'), html.indexOf('<!-- Modal Mapy'));
    assert.ok(menu.includes('class="menu-stage"'));
    assert.ok(menu.indexOf('class="menu-stage"') < menu.indexOf('class="modal-content lobby-card"'));
    assert.match(css, /#mainMenu \.menu-stage \{[\s\S]*?aspect-ratio:16 \/ 9/);
    assert.match(css, /#mainMenu \.lobby-card \{[\s\S]*?width:78%;/);
    assert.match(css, /min-width:1101px/);
    assert.match(css, /wood-planks-tile\.webp'\) center \/ auto 100% repeat-x/);
    assert.match(css, /#mainMenu \.menu-stage \{width:100%;height:100%;aspect-ratio:auto/);
    assert.ok(!menu.includes('class="hub-intro"'));
});

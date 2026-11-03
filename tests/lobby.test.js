const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('lobby v0.4.33 has the card suits and no obsolete branding or coin counter', () => {
    const html = read('index.html');
    for (const suit of ['♤', '♡', '♧', '◇']) assert.ok(html.includes(suit), suit);
    assert.ok(!html.includes('lobby-emblem'), 'kotwica nie powinna wrócić');
    assert.ok(!html.includes('ui-lobby-coins'), 'licznik monet nie należy do menu');
    assert.ok(!html.includes('Świat Calionu'));
    assert.ok(!html.includes('Pod Złamaną Kotwicą'));
    assert.match(html, /<span>Wyprawa<\/span>/);
});

test('lobby controls retain all five click actions', () => {
    const html = read('index.html');
    assert.match(html, /class="btn-action hub-main-action" onclick="startDuelRun\(\)"/);
    for (const section of ['quests', 'skills', 'achievements', 'stats']) {
        assert.ok(html.includes(`onclick="openLobbySection('${section}')"`), section);
    }
});

test('wood texture, props and candle are scoped to the main menu', () => {
    const html = read('index.html');
    const css = read('style.css');
    const texture = read('assets/ui/menu-wood.svg');
    for (const name of ['menu-candle','menu-flame','menu-wax','menu-props','menu-card-prop','menu-die','menu-coins']) {
        assert.ok(html.includes(`class="${name}`) || html.includes(`class="${name} `), name);
    }
    assert.match(css, /#mainMenu\.lobby-overlay/);
    assert.match(css, /#mainMenu \.hub-main-action/);
    assert.match(css, /assets\/ui\/menu-wood\.svg/);
    assert.match(css, /prefers-reduced-motion:reduce/);
    assert.match(texture, /^<svg\b/);
    assert.ok(texture.trimEnd().endsWith('</svg>'));
});

test('release metadata and asset version are consistent', () => {
    const html = read('index.html');
    const version = html.match(/<title>[^<]+v(0\.4\.\d+)<\/title>/)?.[1];
    assert.ok(version);
    assert.ok(html.includes(`class="lobby-subtitle">wersja ${version}`));
    assert.ok(html.includes(`style.css?v=${version}`));
    assert.ok(html.includes(`game.js?v=${version}`));
});

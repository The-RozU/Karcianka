const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'portrait-cache.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');

function setup() {
    const images = [];
    class FakeImage {
        constructor() {
            this.naturalWidth = 0;
            this.decoding = '';
            images.push(this);
        }
        set src(value) { this.url = value; }
        get src() { return this.url; }
        decode() { return Promise.resolve(); }
        load() { this.naturalWidth = 512; this.onload(); }
        fail() { this.onerror(); }
    }
    const context = vm.createContext({ Image: FakeImage });
    const portraits = vm.runInContext(source + '\nPortraitCache;', context);
    const element = {
        dataset: {}, hidden: true, alt: '', currentSrc: '',
        set src(v) { this.currentSrc = v; },
        get src() { return this.currentSrc; },
        removeAttribute(name) { if (name === 'src') this.currentSrc = ''; }
    };
    const fallback = { hidden: false, textContent: '⚔' };
    return { portraits, images, element, fallback };
}

test('Pierwsze żądanie pobiera i dekoduje obraz tylko raz', async () => {
    const { portraits, images } = setup();
    const first = portraits.preload('assets/enemies/boss_daren.webp');
    const second = portraits.preload('assets/enemies/boss_daren.webp');
    assert.equal(images.length, 1);
    assert.strictEqual(first, second);
    images[0].load();
    assert.equal(await first, true);
    assert.equal(await portraits.preload('assets/enemies/boss_daren.webp'), true);
    assert.equal(images.length, 1);
});

test('Podczas oglądania mapy wczytuje tylko unikalne portrety piętra', () => {
    const { portraits, images } = setup();
    portraits.preloadFloor({
        boss: { portrait: 'boss.webp' },
        nodes: [
            { enemy: { portrait: 'a.webp' } },
            { enemy: { portrait: 'a.webp' } },
            { enemy: { portrait: 'b.webp' } },
            { enemy: { portrait: 'boss.webp' } },
            { type: 'shop' }
        ]
    });
    assert.deepEqual(images.map(img => img.src), ['a.webp', 'b.webp', 'boss.webp']);
});

test('Gotowy portret pojawia się od razu, a nie po kolejnym onload', async () => {
    const { portraits, images, element, fallback } = setup();
    const img = portraits.preload('a.webp');
    images[0].load();
    assert.equal(await img, true);
    portraits.show({ name: 'A', portrait: 'a.webp' }, element, fallback);
    assert.equal(element.hidden, false);
    assert.equal(fallback.hidden, true);
    assert.equal(element.src, 'a.webp');
    portraits.show({ name: 'A', portrait: 'a.webp' }, element, fallback);
    assert.equal(images.length, 1);
});

test('Szybka zmiana przeciwnika nie przywraca starego portretu', async () => {
    const { portraits, images, element, fallback } = setup();
    portraits.show({ name: 'Alfa', portrait: 'a.webp' }, element, fallback);
    portraits.show({ name: 'Beta', portrait: 'b.webp' }, element, fallback);
    assert.equal(images.length, 2);
    images[0].load();
    await portraits.preload('a.webp');
    assert.equal(element.hidden, true);
    assert.equal(fallback.textContent, 'B');
    images[1].load();
    await portraits.preload('b.webp');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(element.hidden, false);
    assert.equal(element.src, 'b.webp');
});

test('Błąd pobierania zachowuje awatar zastępczy', async () => {
    const { portraits, images, element, fallback } = setup();
    portraits.show({ name: 'Gamma', portrait: 'missing.webp' }, element, fallback);
    images[0].fail();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(element.hidden, true);
    assert.equal(fallback.hidden, false);
    assert.equal(fallback.textContent, 'G');
});

test('Skrypty mają tę samą wersję i portrety są ładowane przed game.js', () => {
    const version = index.match(/<title>Kalon[^<]*v(0\.\d+\.\d+)<\/title>/)?.[1];
    assert.ok(version);
    const portrait = index.indexOf('src="portrait-cache.js?v=' + version + '"');
    const gameScript = index.indexOf('src="game.js?v=' + version + '"');
    assert.ok(portrait > 0 && gameScript > portrait);
    assert.match(game, /PortraitCache\.preloadFloor\(mapRun\)/);
    assert.match(game, /PortraitCache\.show\(displayedEnemy, portraitImg, portraitFallback\)/);
});

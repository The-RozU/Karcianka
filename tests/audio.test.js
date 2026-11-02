const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sounds = ['ui_click','ui_back','ui_open','ui_confirm','ui_error','coin_gain','exp_gain','level_up','equip_item','training_start','quest_start','quest_complete','card_paper_1','card_paper_2','maze_step_1','maze_step_2'];

test('all 16 WAV assets (including disabled originals) are valid mono PCM files', () => {
    for (const name of sounds) {
        const data = fs.readFileSync(path.join(root, 'assets/audio', name + '.wav'));
        assert.equal(data.toString('ascii', 0, 4), 'RIFF', name);
        assert.equal(data.toString('ascii', 8, 12), 'WAVE', name);
        assert.equal(data.toString('ascii', 12, 16), 'fmt ', name);
        assert.equal(data.readUInt16LE(20), 1, name + ' PCM');
        assert.equal(data.readUInt16LE(22), 1, name + ' mono');
        assert.equal(data.readUInt32LE(24), 32000, name + ' sample rate');
        assert.equal(data.toString('ascii', 36, 40), 'data', name);
        assert.equal(data.length, data.readUInt32LE(40) + 44, name + ' length');
    }
});
test('audio module and settings are included before game logic', () => {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.ok(html.includes('audio.js?v=0.4.24'));
    assert.ok(html.indexOf('audio.js?v=0.4.24') < html.indexOf('game.js?v=0.4.24'));
    assert.ok(html.includes('audioSettingsModal') && html.includes('audioPreview'));
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    for (const name of sounds) assert.ok(script.includes("'" + name + "'"), name);
});

const vm = require('node:vm');

test('seven disliked effects cannot play; card rustle and footsteps alternate variants', () => {
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    const calls = [];
    const created = [];
    let clock = 1000;
    class FakeAudio {
        constructor(src) { this.src = src; this.handlers = {}; created.push(this); }
        load() {}
        pause() {}
        addEventListener(event, listener) { this.handlers[event] = listener; }
        play() {
            calls.push(this.src);
            if (this.handlers.ended) this.handlers.ended();
            return Promise.resolve();
        }
    }
    const globals = {
        window: { Audio: FakeAudio, localStorage: { getItem: () => null, setItem() {} } },
        document: { readyState: 'loading', addEventListener() {}, getElementById: () => null },
        Date: { now: () => (clock += 250) }
    };
    vm.runInNewContext(script, globals, { filename: 'audio.js' });
    const audio = globals.window.KalonAudio;
    assert.ok(audio);
    for (const name of ['ui_confirm','coin_gain','exp_gain','level_up','training_start','quest_start','quest_complete']) {
        assert.equal(audio.play(name), false, name + ' should be muted');
    }
    assert.equal(calls.length, 0, 'disabled sounds cannot reach the audio player');
    assert.equal(created.length, 9, 'all active files are preloaded only once');
    assert.equal(audio.play('card_paper'), true);
    assert.equal(audio.play('card_paper'), true);
    assert.equal(audio.play('maze_step'), true);
    assert.equal(audio.play('maze_step'), true);
    assert.equal(audio.play('ui_click'), true);
    assert.deepEqual(calls, [
        'assets/audio/card_paper_1.wav',
        'assets/audio/card_paper_2.wav',
        'assets/audio/maze_step_1.wav',
        'assets/audio/maze_step_2.wav',
        'assets/audio/ui_click.wav'
    ]);
    const sound = (file) => created.find(clip => clip.src.endsWith('/' + file + '.wav'));
    assert.equal(sound('card_paper_1').volume, 0.35 * 0.30);
    assert.equal(sound('card_paper_2').volume, 0.35 * 0.30);
    assert.equal(sound('maze_step_1').volume, 0.35 * 0.22);
    assert.equal(sound('maze_step_2').volume, 0.35 * 0.22);
    assert.equal(sound('ui_click').volume, 0.35);
    audio.setEnabled(false);
    assert.equal(audio.play('ui_click'), false);
});

test('cards and labyrinth play dedicated effects, attack does not confirm', () => {
    const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.match(game, /function toggleCard\(id\) \{[\s\S]*?playGameSound\('card_paper'\)/);
    assert.match(game, /for \(const id of route\) \{[\s\S]*?playGameSound\('maze_step'\)/);
    assert.match(game, /function selectMapNode\(nodeId\) \{[\s\S]*?playGameSound\('maze_step'\)/);
    for (const name of ['ui_confirm','coin_gain','exp_gain','level_up','training_start','quest_start','quest_complete']) {
        assert.ok(!game.includes("playGameSound('" + name + "')"), name + ' must not be triggered');
    }
    assert.ok(!game.includes("playGameSound(levelsGained ? 'level_up'"));
    assert.ok(!html.includes('<option value="ui_confirm">'));
    assert.ok(html.includes('<option value="card_paper">'));
    assert.ok(html.includes('<option value="maze_step">'));
});

test('Web Audio plays decoded buffers immediately with per-effect gains', async () => {
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    const played = [];
    const gains = [];
    let fetchCount = 0;
    let unlock;
    let currentTime = 1000;
    class FakeAudioContext {
        constructor() {
            this.state = 'suspended';
            this.destination = {};
        }
        decodeAudioData(bytes) { return Promise.resolve({ bytes }); }
        createBufferSource() {
            const source = {
                connect() {},
                start(when) { played.push(when); },
                stop() {},
                onended: null
            };
            return source;
        }
        createGain() {
            const node = { gain: { value: 0 }, connect() {} };
            gains.push(node);
            return node;
        }
        resume() { this.state = 'running'; return Promise.resolve(); }
    }
    class FakeAudio {
        constructor(src) { this.src = src; }
        load() {}
        pause() {}
        addEventListener() {}
        play() { throw new Error('Fallback should not run once buffers are decoded'); }
    }
    const global = {
        Audio: FakeAudio,
        AudioContext: FakeAudioContext,
        fetch(url) {
            fetchCount++;
            return Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
        },
        localStorage: { getItem: () => null, setItem() {} }
    };
    const context = {
        window: global,
        document: {
            readyState: 'loading',
            addEventListener(type, listener) {
                if (type === 'pointerdown') unlock = listener;
            },
            getElementById: () => null
        },
        Date: { now: () => (currentTime += 250) }
    };
    vm.runInNewContext(script, context);
    // Preload/decoding is asynchronous, but playback itself must never await a network request.
    await new Promise(resolve => setImmediate(resolve));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(fetchCount, 9);
    unlock();
    const audio = global.KalonAudio;
    assert.equal(audio.play('card_paper'), true);
    assert.equal(audio.play('maze_step'), true);
    assert.equal(audio.play('ui_click'), true);
    assert.equal(played.length, 3);
    assert.deepEqual(played, [0, 0, 0]);
    assert.equal(gains[0].gain.value, 0.105);
    assert.equal(gains[1].gain.value, 0.077);
    assert.equal(gains[2].gain.value, 0.35);
    audio.setVolume(0.5);
    assert.equal(gains[0].gain.value, 0.15);
    assert.equal(gains[1].gain.value, 0.11);
    audio.setEnabled(false);
});

test('preload never plays effects when async download completes', async () => {
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    let resolveLoad;
    let played = 0;
    class FakeAudio {
        constructor(src) { this.src = src; }
        load() {}
        pause() {}
        addEventListener() {}
        play() { played++; return Promise.resolve(); }
    }
    class FakeAudioContext {
        constructor() { this.state = 'running'; this.destination = {}; }
        decodeAudioData() { return Promise.resolve({}); }
        createBufferSource() { return { connect() {}, start() { played++; }, stop() {} }; }
        createGain() { return { gain: { value: 0 }, connect() {} }; }
    }
    const pending = new Promise(resolve => { resolveLoad = resolve; });
    vm.runInNewContext(script, {
        window: {
            Audio: FakeAudio, AudioContext: FakeAudioContext,
            fetch: () => pending, localStorage: { getItem: () => null }
        },
        document: { readyState: 'loading', addEventListener() {}, getElementById: () => null }
    });
    resolveLoad({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(played, 0);
});

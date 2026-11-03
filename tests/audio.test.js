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
    assert.ok(html.includes('audio.js?v=0.4.31'));
    assert.ok(html.indexOf('audio.js?v=0.4.31') < html.indexOf('game.js?v=0.4.31'));
    assert.ok(html.includes('audioSettingsModal') && html.includes('audioPreview'));
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    // Nieaktywne, historyczne pliki WAV nadal istnieją, ale nie muszą być w mapie odtwarzania.
    for (const name of ['ui_click','ui_back','ui_open','ui_error','equip_item','card_paper_1','card_paper_2']) {
        assert.ok(script.includes("'" + name + "'"), name);
    }
    for (const name of ['hit_enemy','hit_player']) {
        assert.ok(script.includes(name + ': ['), name);
    }
    for (const name of ['step_stone_1.ogg','step_wood_1.ogg','step_soft_1.ogg']) {
        assert.ok(script.includes("'" + name + "'"), name);
    }
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
    assert.equal(created.length, 22, '22 active files are preloaded only once');
    assert.equal(audio.play('card_paper'), true);
    assert.equal(audio.play('card_paper'), true);
    assert.equal(audio.play('maze_step'), true);
    assert.equal(audio.play('maze_step'), true);
    assert.equal(audio.play('ui_click'), true);
    assert.deepEqual(calls, [
        'assets/audio/card_paper_1.wav',
        'assets/audio/card_paper_2.wav',
        'assets/audio/step_stone_1.ogg',
        'assets/audio/step_stone_2.ogg',
        'assets/audio/ui_click.wav'
    ]);
    const sound = (file) => created.find(clip => clip.src.endsWith('/' + file));
    assert.equal(sound('card_paper_1.wav').volume, 0.35 * 0.30);
    assert.equal(sound('card_paper_2.wav').volume, 0.35 * 0.30);
    assert.equal(sound('step_stone_1.ogg').volume, 0.35 * 0.22);
    assert.equal(sound('step_stone_2.ogg').volume, 0.35 * 0.22);
    assert.equal(sound('ui_click.wav').volume, 0.35);
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
    assert.equal(fetchCount, 22);
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

const oggSounds = [
    'step_stone_1','step_stone_2','step_wood_1','step_wood_2',
    'step_soft_1','step_soft_2',
    'hit_enemy_1','hit_enemy_2','hit_enemy_3',
    'hit_player_1','hit_player_2','hit_player_3'
];

function oggDurationSeconds(data) {
    const id = data.indexOf(Buffer.from('vorbis'));
    assert.ok(id >= 1, 'valid Vorbis identification packet');
    const rate = data.readUInt32LE(id + 11);
    assert.ok(rate > 10000 && rate < 200000);
    const lastPage = data.lastIndexOf(Buffer.from('OggS'));
    assert.ok(lastPage >= 0, 'valid final Ogg page');
    const samples = data.readUInt32LE(lastPage + 6)
        + 4294967296 * data.readUInt32LE(lastPage + 10);
    return samples / rate;
}

test('Kenney CC0 sound files are valid, hits last less than 150 ms', () => {
    for (const name of oggSounds) {
        const data = fs.readFileSync(path.join(root, 'assets/audio', name + '.ogg'));
        assert.equal(data.toString('ascii', 0, 4), 'OggS', name);
        const seconds = oggDurationSeconds(data);
        assert.ok(seconds > 0.04, name + ': nonempty audio');
        if (name.startsWith('hit_')) {
            assert.ok(seconds < 0.15, name + ': combat clip must fit fast multi-hit combos, got ' + seconds);
        }
        if (name.startsWith('step_')) {
            assert.ok(seconds < 0.27, name + ': step must fit one 290ms map move');
        }
    }
});

test('footsteps offer stone, wood and soft sounds and remember selection', () => {
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    const played = [];
    let stored = null, clock = 2000;
    class FakeAudio {
        constructor(src) { this.src = src; this.handlers = {}; }
        load() {}
        pause() {}
        addEventListener(name, callback) { this.handlers[name] = callback; }
        play() {
            played.push(this.src);
            if (this.handlers.ended) this.handlers.ended();
            return Promise.resolve();
        }
    }
    const context = {
        window: {
            Audio: FakeAudio,
            localStorage: {
                getItem: () => JSON.stringify({ enabled:true, volume:0.5, footstepStyle:'wood' }),
                setItem: (key, value) => { stored = JSON.parse(value); }
            }
        },
        document: { readyState:'loading', addEventListener() {}, getElementById: () => null },
        Date: { now: () => (clock += 250) }
    };
    vm.runInNewContext(script, context);
    const audio = context.window.KalonAudio;
    assert.equal(audio.getSettings().footstepStyle, 'wood');
    assert.equal(audio.play('maze_step'), true);
    audio.enableDeveloperControls();
    assert.equal(audio.setFootstepStyle('soft'), true);
    assert.equal(audio.play('maze_step'), true);
    assert.equal(audio.setFootstepStyle('stone'), true);
    assert.equal(audio.play('maze_step'), true);
    assert.equal(audio.setFootstepStyle('invalid'), false);
    assert.equal(audio.getSettings().footstepStyle, 'stone');
    assert.equal(stored.footstepStyle, 'stone');
    assert.deepEqual(played, [
        'assets/audio/step_wood_1.ogg',
        'assets/audio/step_soft_1.ogg',
        'assets/audio/step_stone_1.ogg'
    ]);
});

test('six short hit variants support rapid triple strikes and independent gains', () => {
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    const played = [];
    const volumeByFile = {};
    let clock = 2000;
    class FakeAudio {
        constructor(src) { this.src = src; this.handlers={}; }
        load() {}
        pause() {}
        addEventListener(name, handler) { this.handlers[name]=handler; }
        play() {
            played.push(this.src);
            volumeByFile[this.src] = this.volume;
            if(this.handlers.ended) this.handlers.ended();
            return Promise.resolve();
        }
    }
    const global = { Audio: FakeAudio, localStorage:{ getItem: () => null, setItem() {} } };
    vm.runInNewContext(script, {
        window: global,
        document: { readyState: 'loading', addEventListener() {}, getElementById: () => null },
        Date: { now: () => (clock += 50) }
    });
    const audio = global.KalonAudio;
    // Szybkie ciosy używają aktualnie wybranego cięcia; odgłos otrzymania obrażeń
    // zachowuje trzy warianty, żeby można je było animować niezależnie.
    for (let i=0; i<3; i++) assert.equal(audio.play('hit_enemy'), true);
    for (let i=0; i<3; i++) assert.equal(audio.play('hit_player'), true);
    assert.deepEqual(played, [
        'assets/audio/blade_hit.wav','assets/audio/blade_hit.wav','assets/audio/blade_hit.wav',
        'assets/audio/hit_player_1.ogg','assets/audio/hit_player_2.ogg','assets/audio/hit_player_3.ogg'
    ]);
    assert.equal(volumeByFile['assets/audio/blade_hit.wav'], 0.35 * 0.46);
    assert.equal(volumeByFile['assets/audio/hit_player_1.ogg'], 0.35 * 0.42);
    audio.setEnabled(false);
});

test('actual HP loss triggers an impact and shield absorption alone does not', () => {
    const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.match(game, /duel\.enemyHp = Math\.max\(0, duel\.enemyHp - dealt\);[\s\S]{0,230}if \(dealt > 0\).*playGameSound\('hit_enemy'\)/);
    assert.match(game, /if \(dealt > 0\) \{[\s\S]{0,180}playGameSound\('hit_player'\)/);
    assert.match(game, /hpBeforeCounter[\s\S]{0,320}playGameSound\('hit_player'\)/);
    assert.match(game, /hpBeforePoison[\s\S]{0,210}playGameSound\('hit_player'\)/);
    assert.ok(html.includes('id="footstepStyle"'));
    assert.ok(html.includes('value="hit_enemy"') && html.includes('value="hit_player"'));
});

test('three sword hit styles can be previewed, selected and persisted', () => {
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    const played = [];
    let saved, now = 1000;
    class FakeAudio {
        constructor(src) { this.src = src; this.handlers = {}; }
        load() {}
        pause() {}
        addEventListener(type, fn) { this.handlers[type] = fn; }
        play() { played.push(this.src); if (this.handlers.ended) this.handlers.ended(); return Promise.resolve(); }
    }
    const win = { Audio: FakeAudio, localStorage: {
        getItem: () => null,
        setItem: (key, value) => { saved = JSON.parse(value); }
    }};
    vm.runInNewContext(script, {
        window: win,
        document: { readyState:'loading', addEventListener() {}, getElementById: () => null },
        Date: { now: () => (now += 200) }
    });
    const audio = win.KalonAudio;
    assert.equal(audio.getSettings().enemyHitStyle, 'blade_hit');
    assert.equal(audio.play('hit_enemy'), true);
    audio.enableDeveloperControls();
    assert.equal(audio.setEnemyHitStyle('sword_slash'), true);
    assert.equal(audio.play('hit_enemy'), true);
    assert.equal(audio.setEnemyHitStyle('heavy_slash'), true);
    assert.equal(audio.play('hit_enemy'), true);
    assert.equal(audio.setEnemyHitStyle('invalid'), false);
    assert.equal(saved.enemyHitStyle, 'heavy_slash');
    assert.equal(saved.footstepStyle, 'stone');
    assert.deepEqual(played, [
        'assets/audio/blade_hit.wav',
        'assets/audio/sword_slash.wav',
        'assets/audio/heavy_slash.wav'
    ]);
});

test('three short sword clips are valid mono WAV files', () => {
    for (const name of ['sword_slash','blade_hit','heavy_slash']) {
        const data = fs.readFileSync(path.join(root, 'assets/audio', name + '.wav'));
        assert.equal(data.toString('ascii', 0, 4), 'RIFF');
        assert.equal(data.toString('ascii', 8, 12), 'WAVE');
        assert.equal(data.readUInt16LE(22), 1);
        assert.equal(data.readUInt32LE(24), 32000);
        assert.ok((data.length - 44) / 64000 <= 0.20);
    }
});

test('ordinary audio settings show only mute and volume until existing dev mode unlocks', () => {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const dev = fs.readFileSync(path.join(root, 'dev.js'), 'utf8');
    const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
    const start = html.indexOf('<div id="audioDeveloperOptions" class="audio-dev-controls" hidden>');
    const volume = html.indexOf('id="audioVolume"');
    const enable = html.indexOf('id="audioEnabled"');
    const close = html.indexOf('onclick="KalonAudio.closeSettings()"');
    assert.ok(start > enable && start > volume, 'normal mute and volume remain outside developer section');
    assert.ok(start < html.indexOf('id="footstepStyle"'), 'footstep choice stays inside developer section');
    assert.ok(start < html.indexOf('id="enemyHitStyle"'), 'slash choice stays inside developer section');
    assert.ok(start < html.indexOf('id="audioPreview"'), 'sample preview stays inside developer section');
    assert.ok(html.indexOf('    </div>\n    <button class="btn-action lobby-shop"', start) < close, 'developer section ends before close button');
    assert.ok(style.includes('.audio-dev-controls[hidden] { display: none !important; }'));
    assert.match(dev, /function enableDev\(\) \{[\s\S]*?KalonAudio\.enableDeveloperControls\(\)/);
    assert.match(dev, /taps >= 5/);
    assert.match(dev, /\[\?&\]dev=1/);
    assert.ok(html.includes('dev.js?v=0.4.31'));
});

test('developer audio options stay hidden and selectors cannot change until unlock', () => {
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    const devOptions = { hidden: false };
    const volume = { value: '' };
    const enabled = { checked: false };
    const elements = {
        audioDeveloperOptions: devOptions, audioVolume: volume,
        audioEnabled: enabled, audioVolumeValue: { textContent: '' },
        soundSettingsBtn: { textContent: '', setAttribute() {} },
        footstepStyle: { value: '' }, enemyHitStyle: { value: '' },
        audioPreview: { value: 'card_paper' },
        audioSettingsModal: { style: {} }
    };
    const win = { localStorage: { getItem: () => null, setItem() {} } };
    vm.runInNewContext(script, {
        window: win,
        document: { readyState: 'complete', addEventListener() {}, getElementById(id) { return elements[id] || null; } }
    });
    const audio = win.KalonAudio;
    assert.equal(devOptions.hidden, true);
    assert.equal(volume.value, '35');
    assert.equal(enabled.checked, true);
    assert.equal(audio.setFootstepStyle('wood'), false);
    assert.equal(audio.setEnemyHitStyle('heavy_slash'), false);
    assert.equal(audio.previewSelected(), false);
    assert.equal(audio.getSettings().footstepStyle, 'stone');
    assert.equal(audio.getSettings().enemyHitStyle, 'blade_hit');
    audio.openSettings();
    assert.equal(devOptions.hidden, true);
    audio.enableDeveloperControls();
    assert.equal(devOptions.hidden, false);
    assert.equal(audio.setFootstepStyle('wood'), true);
    assert.equal(audio.setEnemyHitStyle('heavy_slash'), true);
    assert.equal(audio.getSettings().footstepStyle, 'wood');
    assert.equal(audio.getSettings().enemyHitStyle, 'heavy_slash');
    audio.setVolume(0.52);
    assert.equal(volume.value, '52');
    audio.setEnabled(false);
    assert.equal(enabled.checked, false);
    assert.equal(devOptions.hidden, false, 'developer controls remain unlocked after muting');
});

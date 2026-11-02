const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sounds = ['ui_click','ui_back','ui_open','ui_confirm','ui_error','coin_gain','exp_gain','level_up','equip_item','training_start','quest_start','quest_complete'];

test('all 12 medieval sounds are valid mono PCM WAV files', () => {
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
    assert.ok(html.includes('audio.js?v=0.4.20'));
    assert.ok(html.indexOf('audio.js?v=0.4.20') < html.indexOf('game.js?v=0.4.20'));
    assert.ok(html.includes('audioSettingsModal') && html.includes('audioPreview'));
    const script = fs.readFileSync(path.join(root, 'audio.js'), 'utf8');
    for (const name of sounds) assert.ok(script.includes("'" + name + "'"), name);
});

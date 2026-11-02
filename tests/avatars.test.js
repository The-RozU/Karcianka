// node --test tests/avatars.test.js
// Zabezpiecza mapowanie portretów postaci i zgodność rozszerzenia z formatem pliku.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'data/enemies/regular.js'), 'utf8');
const enemies = vm.runInNewContext(js + '\nREGULAR_ENEMIES;');
const expectedPortraitIds = [
  'sailor', 'smuggler', 'bored_waitress', 'young_rascal',
  'tavern_drunk', 'dock_porter', 'street_beggar',
  'traveling_merchant', 'firefighter_hubert'
];

test('Przypisane portrety należą do istniejących zwykłych przeciwników', () => {
  assert.equal(enemies.length, 11);
  assert.equal(new Set(enemies.map(enemy => enemy.id)).size, enemies.length);
  const assigned = enemies.filter(enemy => enemy.portrait).map(enemy => enemy.id).sort();
  assert.deepEqual(Array.from(assigned), expectedPortraitIds.slice().sort());
});

test('Pliki portretów istnieją i mają prawidłowe sygnatury PNG / WebP', () => {
  for (const enemy of enemies.filter(enemy => enemy.portrait)) {
    assert.match(enemy.portrait, /^assets\/enemies\/[a-z0-9_]+\.(png|webp)$/);
    const filename = path.join(root, enemy.portrait);
    assert.ok(fs.existsSync(filename), 'Brak grafiki postaci: ' + enemy.name);
    const raw = fs.readFileSync(filename);
    if (enemy.portrait.endsWith('.png')) {
      assert.ok(raw.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
        'Plik z rozszerzeniem PNG ma złą sygnaturę: ' + enemy.portrait);
    } else {
      assert.equal(raw.toString('ascii', 0, 4), 'RIFF', enemy.portrait);
      assert.equal(raw.toString('ascii', 8, 12), 'WEBP', enemy.portrait);
    }
  }
});

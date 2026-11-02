const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const categories = [
  ['regular.js', 'REGULAR_ENEMIES', 11],
  ['elite.js', 'ELITE_ENEMIES', 5],
  ['bosses.js', 'CALION_BOSSES', 8]
];

test('Wszystkie 24 postacie mają własne portrety w formacie WebP', () => {
  const allIds = new Set();
  for (const [filename, variable, count] of categories) {
    const code = fs.readFileSync(path.join(root, 'data/enemies', filename), 'utf8');
    const enemies = vm.runInNewContext(code + '\n' + variable + ';');
    assert.equal(enemies.length, count, filename);
    for (const enemy of enemies) {
      assert.ok(!allIds.has(enemy.id), 'Powtórzony identyfikator: ' + enemy.id);
      allIds.add(enemy.id);
      assert.equal(enemy.portrait, 'assets/enemies/' + enemy.id + '.webp');
      const filepath = path.join(root, enemy.portrait);
      assert.ok(fs.existsSync(filepath), 'Brak portretu: ' + enemy.name);
      const data = fs.readFileSync(filepath);
      assert.equal(data.toString('ascii', 0, 4), 'RIFF', enemy.portrait);
      assert.equal(data.toString('ascii', 8, 12), 'WEBP', enemy.portrait);
    }
  }
  assert.equal(allIds.size, 24);
  const directory = fs.readdirSync(path.join(root, 'assets/enemies'));
  assert.deepEqual(directory.filter(name => name.endsWith('.png')), [],
    'W katalogu pozostały zbędne pliki PNG');
  assert.equal(directory.filter(name => name.endsWith('.webp')).length, 24);
});

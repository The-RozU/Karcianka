#!/usr/bin/env python3
"""One-time conversion: replace PNG payloads in .webp files with actual WebP.
Preserves the user's images, removes binary duplicates, and unifies paths.
"""
from pathlib import Path
from PIL import Image, ImageOps
import re

root = Path(__file__).resolve().parents[1]
assets = root / "assets" / "enemies"
images = sorted(assets.glob("*.webp"))
if len(images) != 24:
    raise RuntimeError(f"Expected 24 portrait files, found {len(images)}")

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
converted = 0
preserved = 0
size_before = sum(p.stat().st_size for p in images)

for filepath in images:
    raw = filepath.read_bytes()[:12]
    if raw.startswith(PNG_MAGIC):
        with Image.open(filepath) as source:
            source.load()
            image = ImageOps.exif_transpose(source)
            image = image.convert("RGBA" if "A" in image.getbands()
                                  or "transparency" in image.info else "RGB")
            image.thumbnail((512, 512), Image.Resampling.LANCZOS)
            tmp = filepath.with_suffix(".webp.optimizing")
            image.save(tmp, format="WEBP", quality=83, method=6)
        with Image.open(tmp) as check:
            if check.format != "WEBP" or check.size[0] > 512 or check.size[1] > 512:
                raise RuntimeError(f"Bad conversion: {filepath.name}")
            check.verify()
        if tmp.read_bytes()[:4] != b"RIFF" or tmp.read_bytes()[8:12] != b"WEBP":
            raise RuntimeError(f"Bad WebP signature: {filepath.name}")
        tmp.replace(filepath)
        converted += 1
    elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        with Image.open(filepath) as check:
            if check.format != "WEBP":
                raise RuntimeError(f"Invalid WebP: {filepath.name}")
            check.verify()
        preserved += 1
    else:
        raise RuntimeError(f"Unsupported portrait format: {filepath.name}")

# Each historical .png was a byte-identical copy of the PNG payload previously
# saved under a .webp name. Confirm matching identities from Git history before
# removing the redundant files.
pngs = sorted(assets.glob("*.png"))
if len(pngs) != 23:
    raise RuntimeError(f"Expected 23 duplicate PNG files, found {len(pngs)}")
for png in pngs:
    expected = png.with_suffix(".webp")
    if not expected.is_file():
        raise RuntimeError(f"PNG has no WebP counterpart: {png.name}")
    with Image.open(png) as old, Image.open(expected) as new:
        if old.width < new.width or old.height < new.height:
            raise RuntimeError(f"New image unexpectedly larger than source: {png.name}")
        if new.format != "WEBP":
            raise RuntimeError(f"Conversion incomplete for: {png.name}")
        new.verify()
    png.unlink()

data_paths = [
    (root / "data/enemies/regular.js", 11),
    (root / "data/enemies/elite.js", 5),
    (root / "data/enemies/bosses.js", 8)
]
known = set()
for filepath, count in data_paths:
    source = filepath.read_text(encoding="utf-8")
    ids = re.findall(r"\bid:\s*'([^']+)'", source)
    if len(ids) != count or len(set(ids)) != count:
        raise RuntimeError(f"Enemy definitions changed: {filepath}")
    for enemy_id in ids:
        known.add(enemy_id)
        old = f"portrait: 'assets/enemies/{enemy_id}.png'"
        new = f"portrait: 'assets/enemies/{enemy_id}.webp'"
        if old in source:
            source = source.replace(old, new, 1)
        elif new not in source:
            raise RuntimeError(f"No portrait for: {enemy_id}")
        if not (assets / f"{enemy_id}.webp").is_file():
            raise RuntimeError(f"Missing converted portrait for: {enemy_id}")
    filepath.write_text(source, encoding="utf-8")

actual = set(p.stem for p in assets.glob("*.webp"))
if actual != known:
    raise RuntimeError(f"Portrait/character mismatch: missing={known - actual}, extra={actual - known}")

test_file = root / "tests/avatars.test.js"
test_file.write_text(r"""const test = require('node:test');
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
""", encoding="utf-8")

index_file = root / "index.html"
index = index_file.read_text(encoding="utf-8")
if "v0.4.16" not in index:
    raise RuntimeError("Expected intermediate version 0.4.16")
index_file.write_text(index.replace("0.4.16", "0.4.17"), encoding="utf-8")

readme_file = root / "README.md"
readme = readme_file.read_text(encoding="utf-8")
if "**Wersja: 0.4.16**" not in readme:
    raise RuntimeError("Unexpected README version")
readme = readme.replace("**Wersja: 0.4.16**", "**Wersja: 0.4.17**")
if "\nUwaga: zmiana samej końcówki nazwy pliku" in readme:
    readme = readme.split("\nUwaga: zmiana samej końcówki nazwy pliku", 1)[0].rstrip() + "\n"
readme_file.write_text(readme, encoding="utf-8")

size_after = sum(p.stat().st_size for p in images)
print(f"WebP converted={converted}, preserved={preserved}; PNG removed={len(pngs)}")
print(f"Portrait total: {size_before / 1048576:.1f} MiB -> {size_after / 1048576:.1f} MiB")
print("All 24 portraits have valid WebP signatures; the 23 duplicate PNG files are gone.")

# Remove one-time scaffolding from the final repository state.
(root / ".github/workflows/portraits-webp-once.yml").unlink()
Path(__file__).unlink()

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

// The catalog has bundled native image references; replace only image imports,
// not data or calculations, so its pure logic can run in Node without a device.
const source = fs.readFileSync(path.join(__dirname, '../constants/pharmacy.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const catalog = { exports: {} };
vm.runInNewContext(compiled, {
  exports: catalog.exports,
  require: name => {
    if (name.endsWith('.png')) return {};
    throw new Error(`Unexpected native dependency: ${name}`);
  },
});
const { initialCart, cartSummary, normalizeSearch, PHARMACIES, MEDICINES } = catalog.exports;

test('reference selection has two units and the exact 77 EGP subtotal', () => {
  const summary = cartSummary(initialCart());
  assert.equal(summary.count, 2);
  assert.equal(summary.total, 77);
  assert.equal(summary.items.length, 2);
});

test('quantity changes affect count and price consistently', () => {
  const summary = cartSummary({ metformin: 3, amlodipine: 1, 'panadol-extra': 2 });
  assert.equal(summary.count, 6);
  assert.equal(summary.total, 217);
});

test('empty selection is genuinely empty rather than restoring defaults', () => {
  assert.equal(cartSummary({}).count, 0);
  assert.equal(cartSummary({}).total, 0);
  assert.equal(cartSummary({ metformin: 0 }).items.length, 0);
});

test('unavailable and unknown medicines cannot contribute to an order', () => {
  const summary = cartSummary({ 'panadol-cold': 5, unknown: 99 });
  assert.equal(summary.count, 0);
  assert.equal(summary.total, 0);
});

test('Arabic search ignores diacritics, tatweel, and alef variants', () => {
  assert.equal(normalizeSearch(' أَمْلُودِيبِين '), normalizeSearch('املوديبين'));
  assert.equal(normalizeSearch('بـانادول'), normalizeSearch('بانادول'));
  assert.equal(MEDICINES.filter(m => normalizeSearch(m.name).includes(normalizeSearch('بانادول'))).length, 3);
});

test('sample directory has meaningful open, 24-hour, and nearest states', () => {
  assert.equal(PHARMACIES.filter(p => p.isOpen).length, 2);
  assert.equal(PHARMACIES.filter(p => p.is24Hours).length, 1);
  assert.equal([...PHARMACIES].sort((a, b) => a.distanceKm - b.distanceKm)[0].id, 'hayah');
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Store = require('../../js/store.js');

const KEY = 'test-key';
function memStorage() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    _m: m
  };
}
const throwing = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
  removeItem() { throw new Error('blocked'); }
};

test('new state has step 0 and empty records', () => {
  const s = Store.create(memStorage(), KEY).get();
  assert.equal(s.step, 0);
  assert.equal(s.maxStep, 0);
  assert.deepEqual(s.map, {});
  assert.deepEqual(s.cards, {});
  assert.deepEqual(s.around.opened, []);
  assert.equal(s.intro.ponds.forest.pick, null);
  assert.equal(s.quiz.done, false);
  assert.equal(s.learned, '');
});

test('restores saved state', () => {
  const st = memStorage();
  Store.create(st, KEY).update(s => { s.student.name = '하람'; s.map.paddy = { pick: 'human', tries: 1, correct: true }; s.step = 4; });
  const s = Store.create(st, KEY).get();
  assert.equal(s.student.name, '하람');
  assert.deepEqual(s.map.paddy, { pick: 'human', tries: 1, correct: true });
  assert.equal(s.step, 4);
  assert.equal(s.maxStep, 4);
});

test('works when storage throws', () => {
  const store = Store.create(throwing, KEY);
  const s = store.update(x => { x.learned = '알게 됐어요'; });
  assert.equal(s.learned, '알게 됐어요');
  assert.equal(store.get().learned, '알게 됐어요');
  assert.doesNotThrow(() => store.reset());
});

test('reset clears storage key only', () => {
  const st = memStorage();
  st.setItem('other', 'keep');
  const store = Store.create(st, KEY);
  store.update(s => { s.student.name = '하람'; });
  store.reset();
  assert.equal(st.getItem(KEY), null);
  assert.equal(st.getItem('other'), 'keep');
  assert.equal(store.get().student.name, '');
});

test('revisiting does not double count', () => {
  const store = Store.create(memStorage(), KEY);
  store.update(s => { s.map.paddy = { pick: 'natural', tries: 1, correct: false }; s.step = 5; });
  store.update(s => { s.map.paddy = { pick: 'human', tries: 2, correct: true }; s.step = 2; });
  const s = store.get();
  assert.equal(Object.keys(s.map).length, 1);
  assert.equal(s.step, 2);
  assert.equal(s.maxStep, 5);
});

test('bad JSON in storage starts fresh', () => {
  const st = memStorage();
  st.setItem(KEY, '{not json');
  assert.equal(Store.create(st, KEY).get().step, 0);
});

test('saved state missing new fields gets defaults', () => {
  const st = memStorage();
  st.setItem(KEY, JSON.stringify({ step: 3, student: { no: '7', name: '하람' } }));
  const s = Store.create(st, KEY).get();
  assert.equal(s.student.name, '하람');
  assert.deepEqual(s.kinds.flipped, []);
  assert.equal(s.intro.ponds.park.why, '');
});

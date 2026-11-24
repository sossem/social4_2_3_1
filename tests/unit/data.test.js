'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PLACES = require('../../data/places.js');
const CARDS = require('../../data/cards.js');
const EXTRA = require('../../data/quiz.js');
const CONFIG = require('../../js/config.js');

const NATURAL_PLACES = ['산', '들', '하천', '바다', '비', '바람'];
const HUMAN_PLACES = ['논', '밭', '비닐하우스', '과수원', '아파트', '도로', '다리', '항구'];

test('places has 14 items, 6 natural and 8 human', () => {
  assert.equal(PLACES.length, 14);
  assert.deepEqual(PLACES.filter(p => p.type === 'natural').map(p => p.name).sort(), [...NATURAL_PLACES].sort());
  assert.deepEqual(PLACES.filter(p => p.type === 'human').map(p => p.name).sort(), [...HUMAN_PLACES].sort());
});

test('cards has at least 30 items with both types at least 13', () => {
  assert.ok(CARDS.length >= 30, 'cards: ' + CARDS.length);
  assert.ok(CARDS.filter(c => c.type === 'natural').length >= 13);
  assert.ok(CARDS.filter(c => c.type === 'human').length >= 13);
  CARDS.forEach(c => assert.ok(['natural', 'human'].includes(c.type), c.name));
});

test('card names do not repeat place names', () => {
  const placeNames = new Set(PLACES.map(p => p.name));
  CARDS.forEach(c => assert.ok(!placeNames.has(c.name), c.name));
});

test('every item has non-empty reason', () => {
  [...PLACES, ...CARDS].forEach(i => assert.ok(i.reason && i.reason.trim().length > 5, i.name));
  PLACES.forEach(p => assert.ok(p.hint && p.hint.trim(), p.name));
  CARDS.forEach(c => assert.ok(c.emoji, c.name));
});

test('banned ambiguous names absent', () => {
  const banned = ['호수', '공원 나무', '개울', '강', '연못', '나무'];
  [...PLACES, ...CARDS].forEach(i => assert.ok(!banned.includes(i.name), i.name));
});

test('ids unique', () => {
  const ids = [...PLACES, ...CARDS].map(i => i.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('저수지 is human and reason mentions 둑', () => {
  const r = CARDS.find(c => c.name === '저수지');
  assert.ok(r);
  assert.equal(r.type, 'human');
  assert.match(r.reason, /둑/);
});

test('place coordinates inside 1000x640', () => {
  PLACES.forEach(p => {
    assert.ok(p.x >= 0 && p.x <= 1000, p.name);
    assert.ok(p.y >= 0 && p.y <= 640, p.name);
  });
});

test('extra quiz questions are well formed', () => {
  assert.ok(EXTRA.length >= 4);
  EXTRA.forEach(q => {
    assert.ok(['kind', 'ox', 'blank', 'reason', 'pickNot'].includes(q.type), q.id);
    assert.ok(q.choices.includes(q.answer), q.id);
    assert.ok(q.explain, q.id);
  });
});

test('config values', () => {
  assert.equal(CONFIG.storageKey, 'social4-2-3-1-env-v1');
  assert.equal(CONFIG.cardPassCount, 10);
  assert.equal(CONFIG.quizCount, 10);
  assert.equal(CONFIG.step2CheckQuiz, true);
});

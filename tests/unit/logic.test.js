'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PLACES = require('../../data/places.js');
const CARDS = require('../../data/cards.js');
const EXTRA = require('../../data/quiz.js');
const CONFIG = require('../../js/config.js');
const Store = require('../../js/store.js');
const Logic = require('../../js/logic.js');

const data = { places: PLACES, cards: CARDS, extra: EXTRA };
function seeded(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const fresh = () => Store.defaults();

test('whitespace counts as empty', () => {
  assert.equal(Logic.isBlank('  \n'), true);
  assert.equal(Logic.isBlank(null), true);
  assert.equal(Logic.isBlank(' 산 '), false);
  const s = fresh();
  s.intro.ponds.forest = { pick: 'natural', why: '산에서 물이 흘러서' };
  s.intro.ponds.park = { pick: 'human', why: '   ' };
  assert.equal(Logic.stepStatus(s, 1, data, CONFIG).done, false);
  s.intro.ponds.park.why = '돌로 반듯해서';
  assert.equal(Logic.stepStatus(s, 1, data, CONFIG).done, true);
});

test('step 2 needs 8 opened and 2 checks', () => {
  const s = fresh();
  s.around.opened = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  assert.equal(Logic.stepStatus(s, 2, data, CONFIG).done, false);
  s.around.check = { q1: true, q2: false };
  assert.equal(Logic.stepStatus(s, 2, data, CONFIG).done, true);
  s.around.check = {};
  assert.equal(Logic.stepStatus(s, 2, data, Object.assign({}, CONFIG, { step2CheckQuiz: false })).done, true);
});

test('step 3 needs both tabs and 7 flips', () => {
  const s = fresh();
  s.kinds.tabs = ['natural', 'human'];
  s.kinds.flipped = ['paddy', 'farm', 'orchard', 'port', 'bridge', 'road'];
  const st = Logic.stepStatus(s, 3, data, CONFIG);
  assert.equal(st.done, false);
  assert.match(st.remaining, /1/);
  s.kinds.flipped.push('apartment');
  assert.equal(Logic.stepStatus(s, 3, data, CONFIG).done, true);
});

test('step 4 remaining counts places', () => {
  const s = fresh();
  PLACES.slice(0, 11).forEach(p => { s.map[p.id] = { pick: p.type, tries: 1, correct: true }; });
  s.map[PLACES[11].id] = { pick: 'natural', tries: 1, correct: false };
  const st = Logic.stepStatus(s, 4, data, CONFIG);
  assert.equal(st.done, false);
  assert.match(st.remaining, /3곳/);
  s.map[PLACES[11].id] = { pick: PLACES[11].type, tries: 2, correct: false };
  s.map[PLACES[12].id] = { pick: PLACES[12].type, tries: 1, correct: true };
  s.map[PLACES[13].id] = { pick: PLACES[13].type, tries: 1, correct: true };
  assert.equal(Logic.stepStatus(s, 4, data, CONFIG).done, true);
});

test('step 5 passes at cardPassCount correct cards', () => {
  const s = fresh();
  CARDS.slice(0, 9).forEach(c => { s.cards[c.id] = { pick: c.type, correct: true }; });
  s.cards[CARDS[9].id] = { pick: 'x', correct: false };
  const st = Logic.stepStatus(s, 5, data, CONFIG);
  assert.equal(st.done, false);
  assert.match(st.remaining, /1장/);
  s.cards[CARDS[10].id] = { pick: CARDS[10].type, correct: true };
  assert.equal(Logic.stepStatus(s, 5, data, CONFIG).done, true);
  assert.equal(Logic.stepStatus(fresh(), 5, data, Object.assign({}, CONFIG, { cardPassCount: 0 })).done, true);
});

test('step 6 done when quiz done', () => {
  const s = fresh();
  assert.equal(Logic.stepStatus(s, 6, data, CONFIG).done, false);
  s.quiz.done = true;
  assert.equal(Logic.stepStatus(s, 6, data, CONFIG).done, true);
});

test('buildQuiz returns count unique questions', () => {
  const qs = Logic.buildQuiz(data, 10, seeded(1));
  assert.equal(qs.length, 10);
  assert.equal(new Set(qs.map(q => q.id)).size, 10);
  assert.equal(new Set(qs.map(q => q.question)).size, 10);
});

test('buildQuiz has at least 4 kind questions and at least 3 other types', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const qs = Logic.buildQuiz(data, 10, seeded(seed));
    assert.ok(qs.filter(q => q.type === 'kind').length >= 4, 'seed ' + seed);
    assert.ok(new Set(qs.filter(q => q.type !== 'kind').map(q => q.type)).size >= 3, 'seed ' + seed);
  }
});

test('buildQuiz is deterministic for same rng seed', () => {
  assert.deepEqual(Logic.buildQuiz(data, 10, seeded(7)), Logic.buildQuiz(data, 10, seeded(7)));
});

test('every question answer is in choices', () => {
  for (let seed = 1; seed <= 30; seed++) {
    Logic.buildQuiz(data, 10, seeded(seed)).forEach(q => {
      assert.ok(q.choices.includes(q.answer), q.id);
      assert.equal(new Set(q.choices).size, q.choices.length, q.id);
      assert.ok(q.explain && q.question, q.id);
    });
  }
});

test('pickNot has exactly one answer of other type', () => {
  const all = [...PLACES, ...CARDS];
  for (let seed = 1; seed <= 30; seed++) {
    Logic.buildQuiz(data, 10, seeded(seed)).filter(q => q.type === 'pickNot' && !q.id.startsWith('x-')).forEach(q => {
      const types = q.choices.map(n => all.find(i => i.name === n).type);
      const answerType = all.find(i => i.name === q.answer).type;
      assert.equal(types.filter(t => t === answerType).length, 1, q.id);
      assert.equal(q.choices.length, 4);
    });
  }
});

test('korean particles follow final consonant', () => {
  assert.equal(Logic.topic('산'), '산은');
  assert.equal(Logic.topic('바다'), '바다는');
  assert.equal(Logic.topic('비닐하우스'), '비닐하우스는');
  assert.equal(Logic.topic('계단식 논'), '계단식 논은');
  assert.equal(Logic.object('다리'), '다리를');
  assert.equal(Logic.object('항구'), '항구를');
  assert.equal(Logic.object('논'), '논을');
});

test('grade true only for answer', () => {
  const q = { answer: '인문환경', choices: ['자연환경', '인문환경'] };
  assert.equal(Logic.grade(q, '인문환경'), true);
  assert.equal(Logic.grade(q, '자연환경'), false);
  assert.equal(Logic.grade(q, undefined), false);
});

test('shuffle returns new array with same items', () => {
  const a = [1, 2, 3, 4, 5];
  const b = Logic.shuffle(a, seeded(3));
  assert.notEqual(a, b);
  assert.deepEqual([...b].sort(), a);
  assert.deepEqual(a, [1, 2, 3, 4, 5]);
});

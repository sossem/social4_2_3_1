#!/usr/bin/env node
/*
 * 전체 흐름 시험: 태블릿 가로(1024x768, 터치)로 앱을 처음부터 진행한다.
 *   node tests/e2e/flow.js            모든 단계
 *   node tests/e2e/flow.js --until 3  3단계 화면이 보일 때까지
 */
'use strict';
const path = require('path');
const assert = require('assert/strict');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const URL = pathToFileURL(path.join(__dirname, '..', '..', 'index.html')).href;
const untilArg = process.argv.indexOf('--until');
const UNTIL = untilArg > 0 ? Number(process.argv[untilArg + 1]) : 99;

function watchErrors(page) {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => { if (r.url().startsWith('file:')) errors.push('missing file: ' + r.url()); });
  return errors;
}
const tid = (page, id) => page.getByTestId(id);
async function next(page) {
  await page.waitForSelector('#next:not([disabled])');
  await page.click('#next');
}
async function heading(page) { return (await page.locator('#screen h2').first().innerText()).trim(); }

const steps = [];
const step = (n, name, fn) => steps.push({ n, name, fn });

step(0, '시작 화면', async page => {
  assert.equal(await tid(page, 'start').isDisabled(), true, '이름이 비면 시작할 수 없어요');
  await page.fill('#student-no', '7');
  await page.fill('#student-name', '   ');
  assert.equal(await tid(page, 'start').isDisabled(), true, '공백 이름은 빈 칸');
  await page.fill('#student-name', '김하람');
  await tid(page, 'start').tap();
  assert.match(await heading(page), /연못/);
});

step(1, '궁금한 연못', async page => {
  assert.equal(await page.isDisabled('#next'), true);
  await tid(page, 'pick-forest-natural').tap();
  await tid(page, 'pick-park-natural').tap();
  await page.fill('[data-testid=why-forest]', '산에서 물이 흘러와서 생긴 것 같아요.');
  assert.equal(await page.isDisabled('#next'), true, '까닭을 하나만 쓰면 아직');
  await page.fill('[data-testid=why-park]', '분수가 있어서');
  assert.equal(await page.locator('#screen').innerText().then(t => /사람이 만든 연못이에요|정답/.test(t)), false, '정답은 아직 보이면 안 돼요');
  await next(page);
  assert.match(await heading(page), /환경이 뭘까/);
});

step(2, '환경이 뭘까', async page => {
  const items = page.locator('[data-testid^=around-]');
  assert.equal(await items.count(), 8);
  assert.equal(await page.isDisabled('#next'), true);
  for (let i = 0; i < 8; i++) await items.nth(i).tap();
  assert.match(await page.locator('#screen').innerText(), /우리를 둘러싸고 있는 모든 것/);
  await tid(page, 'check-q1-x').tap();
  await tid(page, 'check-q2-o').tap();
  assert.match(await page.locator('#feedback').innerText(), /○|맞아요/);
  await next(page);
  assert.match(await heading(page), /환경의 두 가지/);
});

step(3, '환경의 두 가지', async page => {
  assert.equal(await page.isDisabled('#next'), true);
  await tid(page, 'tab-natural').tap();
  const nat = await page.locator('#screen').innerText();
  assert.match(nat, /땅의 생김새/);
  assert.match(nat, /날씨/);
  assert.match(nat, /날씨도 환경이에요/);
  await tid(page, 'tab-human').tap();
  const flips = ['paddy', 'farm', 'orchard', 'port', 'bridge', 'road'];
  for (const f of flips) await tid(page, 'flip-' + f).tap();
  assert.equal(await page.isDisabled('#next'), true, '6장만 뒤집으면 아직');
  assert.match(await page.locator('#next-hint').innerText(), /1장/);
  assert.equal(await tid(page, 'pond-answer').count(), 0, '다 뒤집기 전에는 연못 답이 없어요');
  await tid(page, 'flip-apartment').tap();
  assert.match(await tid(page, 'flip-bridge').innerText(), /건너/);
  const ans = await tid(page, 'pond-answer').innerText();
  assert.match(ans, /숲속 연못[\s\S]*○ 자연환경/);
  assert.match(ans, /공원[\s\S]*△ 인문환경/);
  assert.match(ans, /내 생각/);
  await next(page);
  assert.match(await heading(page), /그림 지도/);
});

const PLACES = require('../../data/places.js');

async function relBox(page, id) {
  const map = await page.locator('#town-map svg').boundingBox();
  const b = await tid(page, 'place-' + id).boundingBox();
  return { x: (b.x + b.width / 2 - map.x) / map.width, y: (b.y + b.height / 2 - map.y) / map.height };
}

step(4, '그림 지도', async (page) => {
  assert.equal(await page.isDisabled('#next'), true);
  // 논을 자연환경으로 고르면 힌트 질문, 두 번째에 인문환경이면 맞아요
  await tid(page, 'place-paddy').tap();
  assert.equal(await page.locator('#choice-sheet').isVisible(), true);
  await tid(page, 'choose-natural').tap();
  const hint = await page.locator('#feedback').innerText();
  assert.match(hint, /\?/);
  assert.doesNotMatch(hint, /✕/);
  await tid(page, 'choose-human').tap();
  assert.match(await page.locator('#feedback').innerText(), /○ 맞아요[\s\S]*벼/);
  assert.match(await tid(page, 'mark-paddy').textContent(), /△/);

  // 화면 크기가 바뀌어도 이름표가 그림의 제자리에 있다
  const a = await relBox(page, 'mountain');
  await page.setViewportSize({ width: 768, height: 1024 });
  const b = await relBox(page, 'mountain');
  await page.setViewportSize({ width: 1024, height: 768 });
  assert.ok(Math.abs(a.x - b.x) < 0.02 && Math.abs(a.y - b.y) < 0.02, JSON.stringify({ a, b }));

  for (const p of PLACES) {
    if (p.id === 'paddy') continue;
    await tid(page, 'place-' + p.id).tap();
    await tid(page, 'choose-' + p.type).tap();
  }
  assert.equal(await page.locator('[data-testid^=mark-]').count(), 14);
  assert.match(await tid(page, 'mark-wind').textContent(), /○/);

  // 새로고침해도 표시가 그대로
  await page.reload();
  assert.match(await heading(page), /그림 지도/);
  assert.equal(await page.locator('[data-testid^=mark-]').count(), 14);
  await next(page);
  assert.match(await heading(page), /카드 나누기/);
});

const CARDS = require('../../data/cards.js');
const cardType = id => CARDS.find(c => c.id === id).type;
const other = t => (t === 'natural' ? 'human' : 'natural');
async function center(page, sel) {
  const b = await page.locator(sel).boundingBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
}
async function deckIds(page) {
  return page.locator('#deck [data-testid^=card-]').evaluateAll(els => els.map(e => e.dataset.testid.slice(5)));
}
async function count(page) { return (await tid(page, 'card-count').innerText()).trim(); }

step(5, '카드 나누기', async (page, ctx) => {
  assert.equal(await page.isDisabled('#next'), true);
  let ids = await deckIds(page);
  assert.equal(ids.length, 6, '카드 더미에 6장이 보여요');

  // 1) 마우스로 끌어 놓기
  let id = ids[0];
  let [x, y] = await center(page, '[data-testid=card-' + id + ']');
  let [tx, ty] = await center(page, '[data-testid=bin-' + cardType(id) + ']');
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 15, y + 15, { steps: 3 }); await page.mouse.move(tx, ty, { steps: 12 }); await page.mouse.up();
  assert.match(await page.locator('#feedback').innerText(), /○ 맞아요/);
  assert.match(await count(page), /^맞게 놓은 카드 1 \/ 10/);

  // 2) 손가락(터치)으로 끌어 놓기
  ids = await deckIds(page);
  id = ids[0];
  [x, y] = await center(page, '[data-testid=card-' + id + ']');
  [tx, ty] = await center(page, '[data-testid=bin-' + cardType(id) + ']');
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, X, Y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: X, y: Y }] });
  await touch('touchStart', x, y);
  for (let i = 1; i <= 12; i++) await touch('touchMove', x + (tx - x) * i / 12, y + (ty - y) * i / 12);
  await touch('touchEnd');
  assert.match(await count(page), /^맞게 놓은 카드 2 \/ 10/);

  // 3) 틀린 상자에 놓으면 힌트, 카드는 더미로 돌아와요
  ids = await deckIds(page);
  id = ids[0];
  await tid(page, 'card-' + id).tap();
  await tid(page, 'bin-' + other(cardType(id))).tap();
  assert.match(await page.locator('#feedback').innerText(), /\?/);
  assert.ok((await deckIds(page)).includes(id), '틀린 카드는 더미에 남아요');
  assert.match(await count(page), /^맞게 놓은 카드 2 \/ 10/);

  // 4) 누르고 상자 누르기로 나머지
  while (true) {
    const c = await count(page);
    if (/^맞게 놓은 카드 10 /.test(c)) break;
    id = (await deckIds(page))[0];
    await tid(page, 'card-' + id).tap();
    await tid(page, 'bin-' + cardType(id)).tap();
  }
  await page.waitForSelector('#next:not([disabled])');
  assert.ok((await deckIds(page)).length > 0, '남은 카드는 더 해 보기로 계속 보여요');
  assert.match(await page.locator('#screen').innerText(), /더 해 보기/);

  await page.reload();
  assert.match(await count(page), /^맞게 놓은 카드 10 \/ 10/);
  await next(page);
  assert.match(await heading(page), /정리 퀴즈/);
});

module.exports = { step, steps, tid, next, heading };

async function run() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, locale: 'ko-KR' });
  const page = await ctx.newPage();
  const errors = watchErrors(page);
  await page.goto(URL);
  let failed = false;
  for (const s of steps) {
    if (s.n > UNTIL) break;
    try {
      await s.fn(page, ctx);
      console.log('ok   ' + s.n + ' ' + s.name);
    } catch (e) {
      failed = true;
      console.log('FAIL ' + s.n + ' ' + s.name + '\n     ' + e.message.split('\n')[0]);
      await page.screenshot({ path: path.join(__dirname, 'fail-' + s.n + '.png') }).catch(() => {});
      break;
    }
  }
  if (errors.length) { failed = true; console.log('FAIL console errors:\n  ' + errors.join('\n  ')); }
  await browser.close();
  console.log(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
  process.exit(failed ? 1 : 0);
}
if (require.main === module) run();

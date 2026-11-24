#!/usr/bin/env node
/*
 * 화면 크기 점검: 전체 흐름을 한 번 끝낸 기록으로 모든 단계를 학교 기기 크기마다 열어
 * 가로 스크롤, 44px보다 작은 누르는 곳, 16px보다 작은 글자를 검사하고 화면을 찍는다.
 *   node tests/e2e/screens.js [결과 폴더]
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const { steps, layoutCheck } = require('./flow.js');

const URL = pathToFileURL(path.join(__dirname, '..', '..', 'index.html')).href;
const KEY = 'social4-2-3-1-env-v1';
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'screens'));
const SIZES = [
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'galaxy-tab', width: 1280, height: 800 },
  { name: 'chromebook', width: 1366, height: 768 },
  { name: 'phone', width: 390, height: 844 }
];

async function smallFonts(page) {
  return page.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const el = n.parentElement;
      if (!n.textContent.trim() || !el || el.closest('svg') || el.closest('[hidden]')) continue;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') continue;
      const size = parseFloat(st.fontSize);
      if (size < 16) out.push(size + 'px "' + n.textContent.trim().slice(0, 20) + '"');
    }
    return out;
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // 1) 전체 흐름을 끝내 완성된 기록을 만든다.
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(URL);
  for (const s of steps) await s.fn(page, ctx);
  const done = await page.evaluate(k => localStorage.getItem(k), KEY);
  await ctx.close();

  // 2) 단계마다, 크기마다 연다. 퀴즈는 푸는 중인 화면도 본다.
  const views = [];
  for (let n = 0; n <= 7; n++) views.push({ n, name: 'step' + n });
  views.push({ n: 6, name: 'step6-question', patch: s => { s.quiz.answers = {}; s.quiz.retryAnswers = {}; s.quiz.retry = []; s.quiz.retryStarted = false; s.quiz.done = false; } });
  views.push({ n: 5, name: 'step5-deck', patch: s => { s.cards = {}; } });

  let failed = false;
  for (const size of SIZES) {
    const c = await browser.newContext({ viewport: { width: size.width, height: size.height }, hasTouch: true, isMobile: size.name === 'phone' });
    const p = await c.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(URL);
    for (const v of views) {
      await p.evaluate(([k, raw, n, patch]) => {
        const s = JSON.parse(raw);
        s.step = n;
        if (patch) (new Function('s', patch))(s);
        localStorage.setItem(k, JSON.stringify(s));
      }, [KEY, done, v.n, v.patch ? '(' + v.patch.toString() + ')(s)' : '']);
      await p.reload();
      await p.waitForTimeout(150);
      const problems = await layoutCheck(p);
      const fonts = await smallFonts(p);
      const shot = path.join(OUT, size.name + '-' + v.name + '.png');
      await p.screenshot({ path: shot, fullPage: true });
      const hard = problems.length > 0 && size.name !== 'phone';
      if (hard) failed = true;
      const mark = problems.length ? (size.name === 'phone' ? '경고' : '실패') : '통과';
      console.log(`[${mark}] ${size.name} ${v.name}` + (problems.length ? ' — ' + problems.slice(0, 4).join(' / ') : '') + (fonts.length ? ' (작은 글자 ' + fonts.length + '개: ' + fonts.slice(0, 2).join(', ') + ')' : ''));
    }
    if (errors.length) { failed = true; console.log('[실패] ' + size.name + ' 오류: ' + errors.join(' / ')); }
    await c.close();
  }
  await browser.close();
  console.log('RESULT: ' + (failed ? 'FAIL' : 'PASS') + ' — 화면: ' + OUT);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

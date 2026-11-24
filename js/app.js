/* 앱 동작: 단계마다 화면을 그린다. */
(function () {
  'use strict';

  var CONFIG = window.CONFIG;
  var DATA = { places: window.PLACES, cards: window.CARDS, extra: window.EXTRA_QUIZ };
  var LABEL = window.Logic.LABEL;
  var MARK = { natural: '○', human: '△' };

  var STEPS = [
    { n: 0, name: '시작' },
    { n: 1, name: '궁금한 연못' },
    { n: 2, name: '환경이 뭘까?' },
    { n: 3, name: '환경의 두 가지' },
    { n: 4, name: '그림 지도' },
    { n: 5, name: '카드 나누기' },
    { n: 6, name: '정리 퀴즈' },
    { n: 7, name: '마무리' }
  ];

  var AROUND = [
    { id: 'sky', name: '하늘', emoji: '🌤️' },
    { id: 'mountain', name: '산', emoji: '⛰️' },
    { id: 'rain', name: '비', emoji: '🌧️' },
    { id: 'wind', name: '바람', emoji: '🍃' },
    { id: 'house', name: '집', emoji: '🏠' },
    { id: 'road', name: '길', emoji: '🛣️' },
    { id: 'school', name: '학교', emoji: '🏫' },
    { id: 'tree', name: '나무', emoji: '🌳' }
  ];

  var CHECKS = [
    { id: 'q1', text: '환경은 산과 바다만 말해요.', answer: 'x',
      explain: '산과 바다뿐 아니라 우리를 둘러싼 모든 것이 환경이에요.' },
    { id: 'q2', text: '비와 바람도 환경이에요.', answer: 'o',
      explain: '비와 바람 같은 날씨도 우리를 둘러싼 환경이에요.' }
  ];

  function safeStorage() {
    try {
      var s = window.localStorage;
      var k = '__test__';
      s.setItem(k, '1'); s.removeItem(k);
      return s;
    } catch (e) {
      return { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };
    }
  }

  var store = window.Store.create(safeStorage(), CONFIG.storageKey);
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function S() { return store.get(); }

  // ---------- 공통 ----------
  var screen = $('#screen');
  var feedbackEl = $('#feedback');
  var cleanup = null;

  function feedback(html, kind) {
    feedbackEl.className = 'feedback' + (kind ? ' is-' + kind : '');
    feedbackEl.innerHTML = html || '';
  }
  function ok(text) { return '<span class="mark-ok">○ 맞아요!</span> ' + esc(text); }

  function renderStepper() {
    var st = S();
    $('#stepper').innerHTML = STEPS.slice(1).map(function (s) {
      var cls = 'step-btn' + (s.n === st.step ? ' is-current' : '') + (s.n < st.maxStep ? ' is-done' : '');
      var disabled = st.step === 0 || s.n > st.maxStep ? ' disabled' : '';
      return '<button type="button" class="' + cls + '" data-step="' + s.n + '"' + disabled +
        (s.n === st.step ? ' aria-current="step"' : '') + '>' +
        '<span class="step-no">' + s.n + '</span> <span class="step-name">' + esc(s.name) + '</span></button>';
    }).join('');
  }

  function updateNav() {
    var st = S();
    var nav = $('#nav');
    nav.hidden = st.step === 0;
    $('#back').hidden = st.step <= 1;
    $('#next').hidden = st.step >= 7;
    var status = window.Logic.stepStatus(st, st.step, DATA, CONFIG);
    $('#next').disabled = !status.done;
    $('#next-hint').textContent = status.done ? '' : status.remaining;
  }

  function go(n) {
    store.update(function (s) { s.step = n; });
    feedback('');
    render();
    screen.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function render() {
    if (cleanup) { cleanup(); cleanup = null; }
    var st = S();
    renderStepper();
    var fn = RENDER[st.step] || RENDER[0];
    cleanup = fn(screen) || null;
    updateNav();
  }

  function heading(n, title, lead) {
    return '<span class="eyebrow">미션 ' + n + '</span><h2>' + esc(title) + '</h2>' +
      (lead ? '<p class="lead">' + lead + '</p>' : '');
  }

  // ---------- 0. 시작 ----------
  function renderStart(root) {
    var st = S();
    var missions = ['궁금한 연못', '환경이 뭘까?', '환경의 두 가지', '환경 구분하기 (그림 지도, 카드 나누기)', '정리 퀴즈'];
    root.innerHTML =
      '<div class="start">' +
        '<div>' +
          '<span class="eyebrow">사회 · 우리를 둘러싼 환경</span>' +
          '<h2>우리 동네 환경 탐험대</h2>' +
          '<p class="lead">우리를 둘러싼 환경에는 어떤 것들이 있을까요? 탐험대가 되어 알아봐요.</p>' +
          '<div class="start-art">' + window.Art.pond('forest') + '</div>' +
        '</div>' +
        '<div>' +
          '<h3>오늘의 미션</h3>' +
          '<ol class="mission-list">' + missions.map(function (m, i) {
            return '<li><span class="mission-no">' + (i + 1) + '</span>' + esc(m) + '</li>';
          }).join('') + '</ol>' +
          '<div class="start-form" style="margin-top:18px">' +
            '<div class="field"><label for="student-no">번호</label>' +
              '<input id="student-no" type="text" inputmode="numeric" autocomplete="off" value="' + esc(st.student.no) + '"></div>' +
            '<div class="field"><label for="student-name">이름</label>' +
              '<input id="student-name" type="text" autocomplete="off" value="' + esc(st.student.name) + '"></div>' +
          '</div>' +
          '<button class="btn btn-primary" type="button" data-testid="start" style="width:100%">탐험 출발 🧭</button>' +
        '</div>' +
      '</div>';
    var no = $('#student-no', root), name = $('#student-name', root), start = $('[data-testid=start]', root);
    function sync() {
      start.disabled = window.Logic.isBlank(name.value);
    }
    no.addEventListener('input', sync);
    name.addEventListener('input', sync);
    sync();
    start.addEventListener('click', function () {
      if (window.Logic.isBlank(name.value)) return;
      store.update(function (s) { s.student = { no: no.value.trim(), name: name.value.trim() }; });
      go(Math.max(1, S().maxStep));
    });
  }

  // ---------- 1. 궁금한 연못 ----------
  var PONDS = [
    { id: 'forest', title: '뒷산 숲속 연못', desc: '산에서 흘러내린 물이 모여 있어요. 둘레가 울퉁불퉁해요.' },
    { id: 'park', title: '공원 한가운데 연못', desc: '아파트 단지 공원에 있어요. 분수가 있고 둘레가 돌로 반듯해요.' }
  ];

  function renderIntro(root) {
    var st = S();
    root.innerHTML = heading(1, '궁금한 연못',
      '두 연못을 보고 어떻게 생겼는지 내 생각을 써 봐요.') +
      '<div class="story">우리 동네에는 연못이 두 개 있어. 뒷산 숲속 연못은 맑은 물이 가득하고, ' +
      '공원 한가운데 연못은 밤마다 분수가 반짝여서 정말 멋져. 그런데 궁금한 게 생겼어. ' +
      '<strong>두 연못은 각각 어떻게 생긴 걸까?</strong></div>' +
      '<div class="ponds">' + PONDS.map(function (p) {
        var cur = st.intro.ponds[p.id];
        return '<div class="pond-card">' + window.Art.pond(p.id) +
          '<h3>' + esc(p.title) + '</h3><p class="note">' + esc(p.desc) + '</p>' +
          '<div class="pick-row" role="group" aria-label="' + esc(p.title) + '은 누가 만들었을까요?">' +
            '<button type="button" class="btn btn-natural' + (cur.pick === 'natural' ? ' is-picked' : '') + '" data-testid="pick-' + p.id + '-natural" data-pond="' + p.id + '" data-pick="natural" aria-pressed="' + (cur.pick === 'natural') + '">🌿 자연이 만들었어요</button>' +
            '<button type="button" class="btn btn-human' + (cur.pick === 'human' ? ' is-picked' : '') + '" data-testid="pick-' + p.id + '-human" data-pond="' + p.id + '" data-pick="human" aria-pressed="' + (cur.pick === 'human') + '">🛠️ 사람이 만들었어요</button>' +
          '</div>' +
          '<div class="field"><label for="why-' + p.id + '">그렇게 생각한 까닭</label>' +
            '<textarea id="why-' + p.id + '" data-testid="why-' + p.id + '" data-pond="' + p.id + '" placeholder="예) ~이 있어서 ~이 만든 것 같아요.">' + esc(cur.why) + '</textarea></div>' +
          '</div>';
      }).join('') + '</div>' +
      '<p class="note" style="margin-top:14px">🔎 답은 <strong>미션 3</strong>에서 찾을 수 있어요.</p>';

    $$('[data-pick]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var pond = b.dataset.pond, pick = b.dataset.pick;
        store.update(function (s) { s.intro.ponds[pond].pick = pick; });
        $$('[data-pond="' + pond + '"][data-pick]', root).forEach(function (o) {
          var on = o.dataset.pick === pick;
          o.classList.toggle('is-picked', on);
          o.setAttribute('aria-pressed', String(on));
        });
        updateNav();
      });
    });
    $$('textarea[data-pond]', root).forEach(function (t) {
      t.addEventListener('input', function () {
        store.update(function (s) { s.intro.ponds[t.dataset.pond].why = t.value; });
        updateNav();
      });
      t.addEventListener('focus', function () { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
    });
  }

  // ---------- 2. 환경이 뭘까? ----------
  function renderAround(root) {
    var st = S();
    var allOpen = function () { return AROUND.every(function (a) { return S().around.opened.indexOf(a.id) >= 0; }); };
    root.innerHTML = heading(2, '환경이 뭘까?', '탐험대원을 둘러싼 <strong>?</strong>를 하나씩 눌러 봐요.') +
      '<div class="around-layout">' +
        '<div class="around"><div class="around-ring"></div><div class="around-center">' + window.Art.explorer() + '</div>' +
        AROUND.map(function (a, i) {
          var ang = (i / AROUND.length) * Math.PI * 2 - Math.PI / 2;
          var x = 50 + Math.cos(ang) * 41, y = 50 + Math.sin(ang) * 41;
          var open = st.around.opened.indexOf(a.id) >= 0;
          return '<button type="button" class="around-item ' + (open ? 'is-open' : 'is-closed') + '" data-testid="around-' + a.id + '" data-id="' + a.id + '" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%" aria-label="' + (open ? esc(a.name) : '숨은 것 열기') + '">' +
            (open ? '<span class="emoji" aria-hidden="true">' + a.emoji + '</span>' + esc(a.name) : '?') + '</button>';
        }).join('') + '</div>' +
        '<div id="around-side"></div>' +
      '</div>';

    function renderSide() {
      var side = $('#around-side', root);
      if (!allOpen()) {
        side.innerHTML = '<p class="note">' + S().around.opened.length + ' / ' + AROUND.length + '개를 찾았어요.</p>';
        return;
      }
      var cur = S().around.check;
      side.innerHTML =
        '<div class="definition">하늘, 산, 비, 바람, 집, 길, 학교, 나무 … 모두 나를 둘러싸고 있어요.<br>' +
        '<strong>우리를 둘러싸고 있는 모든 것</strong>을 <strong>환경</strong>이라고 해요.</div>' +
        (CONFIG.step2CheckQuiz ? '<div class="check"><h3>확인해 봐요</h3>' + CHECKS.map(function (q, i) {
          var answered = cur[q.id] !== undefined;
          return '<div class="check-q"><p>' + (i + 1) + '. ' + esc(q.text) + '</p>' +
            ['o', 'x'].map(function (v) {
              var cls = 'btn btn-ghost ox';
              if (answered && v === q.answer) cls += ' is-right';
              return '<button type="button" class="' + cls + '" data-testid="check-' + q.id + '-' + v + '" data-q="' + q.id + '" data-v="' + v + '"' + (answered ? ' disabled' : '') + ' aria-label="' + (v === 'o' ? '맞아요' : '틀려요') + '">' + (v === 'o' ? '○' : '✕') + '</button>';
            }).join('') + '</div>';
        }).join('') + '</div>' : '') +
        '<p class="teaser">환경은 크게 두 가지로 나눌 수 있어요. 다음 미션에서 알아봐요!</p>';
      $$('[data-q]', side).forEach(function (b) {
        b.addEventListener('click', function () {
          var q = CHECKS.filter(function (c) { return c.id === b.dataset.q; })[0];
          var right = b.dataset.v === q.answer;
          store.update(function (s) { s.around.check[q.id] = right; });
          feedback(right ? ok(q.explain) : '<span class="mark-no">✕ 다시 생각해 봐요.</span> ' + esc(q.explain), right ? 'ok' : 'no');
          renderSide();
          updateNav();
        });
      });
    }

    $$('.around-item', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.id;
        if (S().around.opened.indexOf(id) >= 0) return;
        var a = AROUND.filter(function (x) { return x.id === id; })[0];
        store.update(function (s) { s.around.opened.push(id); });
        b.classList.remove('is-closed');
        b.classList.add('is-open');
        b.setAttribute('aria-label', a.name);
        b.innerHTML = '<span class="emoji" aria-hidden="true">' + a.emoji + '</span>' + esc(a.name);
        renderSide();
        updateNav();
      });
    });
    renderSide();
  }

  // ---------- 아직 만들지 않은 단계 ----------
  function stub(n) {
    return function (root) { root.innerHTML = heading(n, STEPS[n].name, ''); };
  }

  var RENDER = {
    0: renderStart,
    1: renderIntro,
    2: renderAround,
    3: stub(3),
    4: stub(4),
    5: stub(5),
    6: stub(6),
    7: stub(7)
  };

  // ---------- 이벤트 ----------
  $('#next').addEventListener('click', function () {
    var st = S();
    if (!window.Logic.stepStatus(st, st.step, DATA, CONFIG).done) return;
    go(Math.min(7, st.step + 1));
  });
  $('#back').addEventListener('click', function () { go(Math.max(1, S().step - 1)); });
  $('#stepper').addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]');
    if (b && !b.disabled) go(Number(b.dataset.step));
  });
  $('#reset').addEventListener('click', function () {
    if (!window.confirm('지금까지 한 활동이 모두 지워져요. 처음부터 다시 할까요?')) return;
    store.reset();
    feedback('');
    render();
  });

  window.App = { go: go, render: render, store: store, MARK: MARK, LABEL: LABEL, esc: esc, feedback: feedback, ok: ok, heading: heading, DATA: DATA, RENDER: RENDER, updateNav: updateNav, STEPS: STEPS };
  render();
})();

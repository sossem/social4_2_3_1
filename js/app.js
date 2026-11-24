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
    return '<span class="eyebrow">' + (n >= 7 ? '마무리' : '미션 ' + n) + '</span><h2>' + esc(title) + '</h2>' +
      (lead ? '<p class="lead">' + lead + '</p>' : '');
  }

  // ---------- 0. 시작 ----------
  function renderStart(root) {
    var st = S();
    var missions = STEPS.slice(1, 7).map(function (x) { return x.name; });
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
          feedback(right ? ok(q.explain) : '<span class="mark-no">✕ 아쉬워요.</span> 정답은 ' + (q.answer === 'o' ? '○' : '✕') + '예요. ' + esc(q.explain), right ? 'ok' : 'no');
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


  // ---------- 3. 환경의 두 가지 ----------
  var NATURAL_GROUPS = [
    { title: '땅의 생김새', items: [['산', '⛰️'], ['들', '🌼'], ['하천', '🏞️'], ['바다', '🌊']] },
    { title: '날씨', items: [['눈', '❄️'], ['비', '🌧️'], ['바람', '🍃'], ['기온', '🌡️']] }
  ];
  var FLIP_EMOJI = { paddy: '🌾', farm: '🥬', orchard: '🍎', port: '⚓', bridge: '🌉', road: '🛣️', apartment: '🏢' };

  function placeById(id) { return DATA.places.filter(function (p) { return p.id === id; })[0]; }

  function renderKinds(root) {
    root.innerHTML = heading(3, '환경의 두 가지', '환경은 크게 <strong>자연환경</strong>과 <strong>인문환경</strong>으로 나눌 수 있어요. 두 가지를 모두 눌러 봐요.') +
      '<div class="tabs" role="tablist">' +
        '<button type="button" role="tab" class="tab tab-natural" data-testid="tab-natural" data-tab="natural">○ 자연환경</button>' +
        '<button type="button" role="tab" class="tab tab-human" data-testid="tab-human" data-tab="human">△ 인문환경</button>' +
      '</div>' +
      '<div id="tab-panel" class="tab-panel" role="tabpanel"></div>' +
      '<div id="pond-slot"></div>';

    var current = S().kinds.tabs[S().kinds.tabs.length - 1] || null;

    function panelHtml(tab) {
      if (!tab) return '<p class="note">위의 버튼을 눌러 봐요.</p>';
      if (tab === 'natural') {
        return '<div class="kind-def kind-def-natural"><span class="kind-mark">○</span><div><h3>자연환경</h3>' +
          '<p><strong>자연 그대로의 환경</strong>을 자연환경이라고 해요.</p></div></div>' +
          '<div class="groups">' + NATURAL_GROUPS.map(function (g) {
            return '<div class="group"><h3>' + esc(g.title) + '</h3><ul class="chips">' + g.items.map(function (it) {
              return '<li class="chip chip-natural"><span aria-hidden="true">' + it[1] + '</span> ' + esc(it[0]) + '</li>';
            }).join('') + '</ul></div>';
          }).join('') + '</div>' +
          '<p class="callout">☔ 눈, 비, 바람, 기온 같은 <strong>날씨도 환경이에요!</strong> 땅의 생김새와 날씨는 모두 자연 그대로의 환경이에요.</p>';
      }
      var flipped = S().kinds.flipped;
      return '<div class="kind-def kind-def-human"><span class="kind-mark">△</span><div><h3>인문환경</h3>' +
        '<p>사람들이 <strong>필요한 것을 얻거나 생활을 편리하게 하려고 만든 환경</strong>을 인문환경이라고 해요.</p></div></div>' +
        '<p class="note">카드를 눌러 <strong>왜 만들었을까요?</strong>의 답을 확인해 봐요. (<span class="flip-count">' + flipped.length + ' / ' + window.Logic.FLIP_IDS.length + '</span>)</p>' +
        '<div class="flips">' + window.Logic.FLIP_IDS.map(function (id) {
          var p = placeById(id), open = flipped.indexOf(id) >= 0;
          return '<button type="button" class="flip' + (open ? ' is-open' : '') + '" data-testid="flip-' + id + '" data-flip="' + id + '" aria-pressed="' + open + '">' +
            '<span class="flip-front"><span class="flip-emoji" aria-hidden="true">' + FLIP_EMOJI[id] + '</span><strong>' + esc(p.name) + '</strong><small>왜 만들었을까요?</small></span>' +
            (open ? '<span class="flip-back"><strong>' + esc(p.name) + '</strong>' + esc(p.reason) + '</span>' : '') +
            '</button>';
        }).join('') + '</div>';
    }

    function pondAnswer() {
      var tabs = S().kinds.tabs;
      if (tabs.indexOf('natural') < 0 || tabs.indexOf('human') < 0) return '';
      var ponds = S().intro.ponds;
      var rows = [['forest', '뒷산 숲속 연못', 'natural', '산에서 흘러내린 물이 저절로 모여 생겼어요.'],
                  ['park', '공원 한가운데 연못', 'human', '사람들이 공원을 꾸미려고 땅을 파고 돌을 둘러 만들었어요.']];
      return '<div class="pond-answer" data-testid="pond-answer"><h3>🔎 미션 1의 답</h3>' + rows.map(function (r) {
        var mine = ponds[r[0]].pick;
        var same = mine === r[2];
        return '<div class="pond-row">' +
          '<p class="pond-name">' + r[1] + ' → <strong class="kind-' + r[2] + '">' + MARK[r[2]] + ' ' + LABEL[r[2]] + '</strong></p>' +
          '<p class="note">' + esc(r[3]) + '</p>' +
          '<p class="pond-mine">내 생각: ' + (mine === 'natural' ? '자연이 만들었어요' : '사람이 만들었어요') +
          ' <span class="' + (same ? 'mark-ok' : 'mark-no') + '">' + (same ? '○ 맞혔어요!' : '✕ 다르게 생각했어요') + '</span></p></div>';
      }).join('') +
      '<p class="callout">같은 연못이라도 <strong>자연이 만든 것</strong>은 자연환경, <strong>사람이 만든 것</strong>은 인문환경이에요.</p></div>';
    }

    function paint() {
      $$('.tab', root).forEach(function (t) {
        var on = t.dataset.tab === current;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      $('#tab-panel', root).innerHTML = panelHtml(current);
      $('#pond-slot', root).innerHTML = pondAnswer();
      $$('[data-flip]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.dataset.flip;
          if (S().kinds.flipped.indexOf(id) >= 0) return;
          store.update(function (s) { s.kinds.flipped.push(id); });
          var p = placeById(id);
          // 앞면이 돌아가는 움직임이 보이도록 이 카드만 바꾼다.
          b.insertAdjacentHTML('beforeend', '<span class="flip-back"><strong>' + esc(p.name) + '</strong>' + esc(p.reason) + '</span>');
          void b.offsetWidth;
          b.classList.add('is-open');
          b.setAttribute('aria-pressed', 'true');
          var count = $('.flip-count', root);
          if (count) count.textContent = S().kinds.flipped.length + ' / ' + window.Logic.FLIP_IDS.length;
          $('#pond-slot', root).innerHTML = pondAnswer();
          updateNav();
        });
      });
    }

    $$('.tab', root).forEach(function (t) {
      t.addEventListener('click', function () {
        current = t.dataset.tab;
        if (S().kinds.tabs.indexOf(current) < 0) store.update(function (s) { s.kinds.tabs.push(current); });
        paint();
        updateNav();
      });
    });
    paint();
  }


  // ---------- 4. 그림 지도 ----------
  function placeDone(m) { return m && (m.correct || m.tries >= 2); }

  function renderMap(root) {
    var selected = null;
    root.innerHTML = heading(4, '그림 지도', '이름표를 누르고 <strong>○ 자연환경</strong>인지 <strong>△ 인문환경</strong>인지 골라 봐요.') +
      '<div class="map-layout">' +
        '<div id="town-map" class="town-map">' + window.Art.townMap(DATA.places) + '</div>' +
        '<aside class="map-side">' +
          '<p class="legend"><span class="kind-natural">○ 자연환경</span> · <span class="kind-human">△ 인문환경</span></p>' +
          '<p class="map-progress" id="map-progress"></p>' +
          '<div id="choice-sheet" class="choice-sheet" hidden>' +
            '<p id="choice-q" class="choice-q"></p>' +
            '<div class="choice-row">' +
              '<button type="button" class="btn btn-natural" data-testid="choose-natural" data-choose="natural">○ 자연환경</button>' +
              '<button type="button" class="btn btn-human" data-testid="choose-human" data-choose="human">△ 인문환경</button>' +
            '</div>' +
          '</div>' +
          '<p class="note" id="map-help">지도에서 이름표를 하나 눌러 봐요.</p>' +
        '</aside>' +
      '</div>';

    function paintMarks() {
      var map = S().map;
      DATA.places.forEach(function (p) {
        var g = $('[data-id="' + p.id + '"]', root);
        var t = $('[data-mark="' + p.id + '"]', root);
        var done = placeDone(map[p.id]);
        g.classList.toggle('is-done', !!done);
        g.classList.toggle('is-natural', !!done && p.type === 'natural');
        g.classList.toggle('is-human', !!done && p.type === 'human');
        g.classList.toggle('is-selected', selected === p.id);
        if (done) {
          t.textContent = MARK[p.type];
          t.setAttribute('data-testid', 'mark-' + p.id);
        } else {
          t.textContent = '';
          t.removeAttribute('data-testid');
        }
      });
      var count = DATA.places.filter(function (p) { return placeDone(map[p.id]); }).length;
      $('#map-progress', root).textContent = DATA.places.length + '곳 중 ' + count + '곳을 표시했어요.';
    }

    function select(id) {
      selected = id;
      var p = placeById(id);
      $('#choice-sheet', root).hidden = false;
      $('#map-help', root).hidden = true;
      $('#choice-q', root).innerHTML = '<strong>' + esc(window.Logic.topic(p.name)) + '</strong> 어떤 환경일까요?';
      var m = S().map[id];
      if (placeDone(m)) feedback('<strong>' + esc(p.name) + '</strong>: ' + MARK[p.type] + ' ' + LABEL[p.type] + '. ' + esc(p.reason), 'ok');
      else feedback('');
      paintMarks();
    }

    function choose(kind) {
      if (!selected) return;
      var p = placeById(selected);
      var m = S().map[p.id] || { pick: null, tries: 0, correct: false };
      if (placeDone(m)) { select(p.id); return; }
      if (kind === p.type) {
        store.update(function (s) { s.map[p.id] = { pick: kind, tries: m.tries + 1, correct: true }; });
        feedback(ok(p.reason), 'ok');
      } else if (m.tries === 0) {
        store.update(function (s) { s.map[p.id] = { pick: kind, tries: 1, correct: false }; });
        feedback('🤔 다시 생각해 봐요. ' + esc(p.hint), 'no');
      } else {
        store.update(function (s) { s.map[p.id] = { pick: p.type, tries: 2, correct: false }; });
        feedback('정답은 <strong>' + MARK[p.type] + ' ' + LABEL[p.type] + '</strong>이에요. ' + esc(p.reason), 'no');
      }
      paintMarks();
      updateNav();
    }

    $$('.place', root).forEach(function (g) {
      g.addEventListener('click', function () { select(g.dataset.id); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.dataset.id); }
      });
    });
    $$('[data-choose]', root).forEach(function (b) {
      b.addEventListener('click', function () { choose(b.dataset.choose); });
    });
    paintMarks();
  }


  // ---------- 5. 카드 나누기 ----------
  var DECK_SIZE = 6;
  function cardById(id) { return DATA.cards.filter(function (c) { return c.id === id; })[0]; }

  function cardFace(c) {
    return (c.image ? '<img src="' + esc(c.image) + '" alt="" class="card-img">' : '<span class="card-emoji" aria-hidden="true">' + c.emoji + '</span>') +
      '<span class="card-name">' + esc(c.name) + '</span>';
  }

  function renderCards(root) {
    var ids = DATA.cards.map(function (c) { return c.id; });
    var order = S().cardOrder;
    var valid = order.length === ids.length && ids.every(function (id) { return order.indexOf(id) >= 0; });
    if (!valid) store.update(function (s) { s.cardOrder = window.Logic.shuffle(ids, Math.random); });

    root.innerHTML = heading(5, '카드 나누기', '카드를 끌어다 알맞은 상자에 놓아 봐요. 카드를 누르고 상자를 눌러도 돼요.') +
      '<p class="card-count" data-testid="card-count" id="card-count"></p>' +
      '<div id="board" class="board">' +
        '<div id="deck" class="deck" aria-label="카드 더미"></div>' +
        '<div class="bins">' +
          '<div class="bin bin-natural" data-testid="bin-natural" data-bin="natural" role="button" aria-label="자연환경 상자">' +
            '<p class="bin-title">○ 자연환경</p><ul class="bin-list" data-list="natural"></ul></div>' +
          '<div class="bin bin-human" data-testid="bin-human" data-bin="human" role="button" aria-label="인문환경 상자">' +
            '<p class="bin-title">△ 인문환경</p><ul class="bin-list" data-list="human"></ul></div>' +
        '</div>' +
      '</div>' +
      '<p class="note" id="more-note" hidden>🎉 다음으로 갈 수 있어요! 남은 카드는 <strong>더 해 보기</strong>로 계속 나눠 봐요.</p>';

    function paint() {
      var st = S();
      var placed = function (id) { return st.cards[id] && st.cards[id].correct; };
      var left = st.cardOrder.filter(function (id) { return !placed(id); });
      $('#deck', root).innerHTML = left.length ? left.slice(0, DECK_SIZE).map(function (id) {
        var c = cardById(id);
        return '<div class="card" data-testid="card-' + id + '" data-id="' + id + '" aria-label="' + esc(c.name) + '">' + cardFace(c) + '</div>';
      }).join('') : '<p class="note">카드를 모두 나누었어요! 👏</p>';
      ['natural', 'human'].forEach(function (kind) {
        $('[data-list="' + kind + '"]', root).innerHTML = st.cardOrder.filter(function (id) {
          return placed(id) && cardById(id).type === kind;
        }).map(function (id) {
          var c = cardById(id);
          return '<li class="bin-chip"><span aria-hidden="true">' + c.emoji + '</span> ' + esc(c.name) + '</li>';
        }).join('');
      });
      var ok = st.cardOrder.filter(placed).length;
      $('#card-count', root).textContent = CONFIG.cardPassCount > 0
        ? '맞게 놓은 카드 ' + Math.min(ok, CONFIG.cardPassCount) + ' / ' + CONFIG.cardPassCount + (ok > CONFIG.cardPassCount ? ' (모두 ' + ok + '장)' : '')
        : '맞게 놓은 카드 ' + ok + '장';
      $('#more-note', root).hidden = !(ok >= CONFIG.cardPassCount && left.length > 0);
      if (drag) drag.refresh();
    }

    function place(item, zone) {
      var c = cardById(item.dataset.id), kind = zone.dataset.bin;
      var prev = S().cards[c.id] || { pick: null, correct: false, tries: 0 };
      if (prev.correct) return;
      var tries = prev.tries + 1;
      if (kind === c.type) {
        store.update(function (s) { s.cards[c.id] = { pick: kind, correct: true, tries: tries }; });
        feedback(ok(c.reason), 'ok');
      } else {
        store.update(function (s) { s.cards[c.id] = { pick: kind, correct: false, tries: tries }; });
        if (tries === 1) feedback('🤔 다시 생각해 봐요. <strong>' + esc(window.Logic.topic(c.name)) + '</strong> 사람이 만들었을까요?', 'no');
        else feedback('정답은 <strong>' + MARK[c.type] + ' ' + LABEL[c.type] + '</strong>이에요. ' + esc(c.reason) + ' 알맞은 상자에 다시 놓아 봐요.', 'no');
      }
      paint();
      updateNav();
    }

    var drag = window.PointerDrag.attach({
      root: $('#board', root),
      itemSelector: '.card',
      zoneSelector: '.bin',
      onDrop: place
    });
    paint();
    return function () { drag.destroy(); };
  }


  // ---------- 6. 정리 퀴즈 ----------
  var QTYPE = { kind: '자연환경일까? 인문환경일까?', ox: 'OX 퀴즈', blank: '빈칸 채우기', reason: '알맞은 설명 고르기', pickNot: '아닌 것 고르기' };

  function quizScore(q) {
    return q.questions.filter(function (_, i) { return q.answers[i] && q.answers[i].correct; }).length;
  }

  // 지금 풀 문제: {phase:'main'|'retry'|'done', pos, q}
  function quizPosition() {
    var q = S().quiz, i;
    for (i = 0; i < q.questions.length; i++) if (!q.answers[i]) return { phase: 'main', pos: i, q: q.questions[i] };
    if (!q.done) {
      for (i = 0; i < q.retry.length; i++) if (!q.retryAnswers[i]) return { phase: 'retry', pos: i, q: q.questions[q.retry[i]] };
    }
    return { phase: 'done' };
  }

  function finishIfComplete() {
    store.update(function (s) {
      var q = s.quiz;
      var mainDone = q.questions.every(function (_, i) { return q.answers[i]; });
      if (!mainDone || q.done) return;
      if (!q.retry.length && !q.retryStarted) {
        q.retry = q.questions.map(function (_, i) { return i; }).filter(function (i) { return !q.answers[i].correct; });
        q.retryStarted = true;
      }
      if (q.retry.every(function (_, j) { return q.retryAnswers[j]; })) q.done = true;
    });
  }

  function renderQuiz(root) {
    if (!S().quiz.questions.length) {
      store.update(function (s) { s.quiz.questions = window.Logic.buildQuiz(DATA, CONFIG.quizCount, Math.random); });
    }
    finishIfComplete();
    root.innerHTML = heading(6, '정리 퀴즈', '오늘 배운 것을 퀴즈로 확인해 봐요. 틀린 문제는 마지막에 한 번 더 풀어요.') +
      '<div id="quiz-box" class="quiz-box"></div>';

    function paint() {
      var box = $('#quiz-box', root);
      var at = quizPosition();
      var total = S().quiz.questions.length;
      if (at.phase === 'done') {
        var q = S().quiz;
        box.removeAttribute('data-q');
        box.setAttribute('data-phase', 'done');
        box.innerHTML = '<div class="quiz-done"><p class="quiz-done-title">🎉 퀴즈를 다 풀었어요!</p>' +
          '<p class="quiz-score">내 점수 <strong>' + quizScore(q) + ' / ' + total + '</strong></p>' +
          '<ol class="quiz-review">' + q.questions.map(function (qq, i) {
            var a = q.answers[i];
            return '<li><span class="' + (a.correct ? 'mark-ok' : 'mark-no') + '">' + (a.correct ? '○' : '✕') + '</span> ' + esc(qq.question) + '</li>';
          }).join('') + '</ol></div>';
        updateNav();
        return;
      }
      var list = at.phase === 'retry' ? S().quiz.retry.length : total;
      var shown = at.phase === 'retry' ? window.Logic.retryChoices(at.q.choices) : at.q.choices;
      box.setAttribute('data-phase', at.phase);
      box.setAttribute('data-q', String(at.pos));
      box.innerHTML =
        '<p class="quiz-progress">' + (at.phase === 'retry' ? '🔁 틀린 문제 다시 풀기 ' + (at.pos + 1) + ' / ' + list : '문제 ' + (at.pos + 1) + ' / ' + total) +
          ' <span class="quiz-type">' + esc(QTYPE[at.q.type] || '') + '</span></p>' +
        '<p class="quiz-question">' + esc(at.q.question) + '</p>' +
        '<div class="quiz-choices' + (shown.length > 2 ? ' is-many' : '') + '">' + shown.map(function (c, k) {
          return '<button type="button" class="btn btn-ghost quiz-choice" data-testid="quiz-choice-' + k + '" data-k="' + k + '">' + esc(c) + '</button>';
        }).join('') + '</div>' +
        '<div class="quiz-actions"><button type="button" class="btn btn-primary" data-testid="quiz-next" hidden>다음 문제 ▶</button></div>';

      var answered = false;
      $$('.quiz-choice', box).forEach(function (b) {
        b.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          var pick = shown[Number(b.dataset.k)];
          var right = window.Logic.grade(at.q, pick);
          store.update(function (s) {
            var rec = { pick: pick, correct: right };
            if (at.phase === 'main') s.quiz.answers[at.pos] = rec; else s.quiz.retryAnswers[at.pos] = rec;
          });
          $$('.quiz-choice', box).forEach(function (o) {
            o.disabled = true;
            var c = shown[Number(o.dataset.k)];
            if (c === at.q.answer) o.classList.add('is-right');
            else if (o === b) o.classList.add('is-wrong');
          });
          feedback(right ? ok(at.q.explain) : '<span class="mark-no">✕ 아쉬워요.</span> <strong>' + esc(window.Logic.answerLine(at.q)) + '</strong> ' + esc(at.q.explain), right ? 'ok' : 'no');
          var nextBtn = $('[data-testid=quiz-next]', box);
          finishIfComplete();
          var after = quizPosition();
          nextBtn.textContent = after.phase === 'done' ? '결과 보기 ▶' : (after.phase === 'retry' && at.phase === 'main' ? '틀린 문제 다시 풀기 ▶' : '다음 문제 ▶');
          nextBtn.hidden = false;
          nextBtn.focus();
        });
      });
      $('[data-testid=quiz-next]', box).addEventListener('click', function () {
        feedback('');
        paint();
      });
      updateNav();
    }
    paint();
  }

  // ---------- 7. 마무리 ----------
  function renderWrap(root) {
    var st = S();
    var q = st.quiz;
    var total = q.questions.length || CONFIG.quizCount;
    var ponds = [['forest', '뒷산 숲속 연못', 'natural'], ['park', '공원 한가운데 연못', 'human']];
    var placedBy = function (kind) {
      return st.cardOrder.filter(function (id) { return st.cards[id] && st.cards[id].correct && cardById(id).type === kind; })
        .map(function (id) { return esc(cardById(id).name); }).join(', ') || '없음';
    };
    var firstTry = DATA.places.filter(function (p) { var m = st.map[p.id]; return m && m.correct && m.tries === 1; }).length;

    root.innerHTML =
      '<div id="record" class="record">' +
        heading(7, '마무리', '오늘 내가 한 활동을 모아 봤어요.') +
        '<div class="badge">' +
          '<div class="badge-medal" aria-hidden="true">🏅</div>' +
          '<div><p class="badge-title">우리 동네 환경 탐험대</p>' +
          '<p class="badge-name">' + esc(st.student.no ? st.student.no + '번 ' : '') + esc(st.student.name) + '</p></div>' +
          '<div class="badge-score"><span>퀴즈 점수</span><strong data-testid="score">' + quizScore(q) + ' / ' + total + '</strong></div>' +
        '</div>' +
        '<section class="rec"><h3>궁금한 연못</h3>' + ponds.map(function (p) {
          var mine = st.intro.ponds[p[0]];
          return '<p><strong>' + p[1] + '</strong> → 정답 <span class="kind-' + p[2] + '">' + MARK[p[2]] + ' ' + LABEL[p[2]] + '</span> · ' +
            '내 생각: ' + (mine.pick === 'natural' ? '자연이 만들었어요' : mine.pick === 'human' ? '사람이 만들었어요' : '-') +
            (mine.why ? ' (' + esc(mine.why) + ')' : '') + '</p>';
        }).join('') + '</section>' +
        '<section class="rec"><h3>그림 지도</h3><p>14곳 중 <strong>' + firstTry + '곳</strong>을 한 번에 맞혔어요.</p>' +
          '<div class="map-preview" data-testid="map-preview">' + window.Art.townMap(DATA.places) + '</div></section>' +
        '<section class="rec"><h3>카드 나누기</h3>' +
          '<p><span class="kind-natural">○ 자연환경</span>: ' + placedBy('natural') + '</p>' +
          '<p><span class="kind-human">△ 인문환경</span>: ' + placedBy('human') + '</p></section>' +
        '<section class="rec"><h3>오늘 알게 된 점</h3>' +
          '<textarea data-testid="learned" id="learned" placeholder="예) 논과 밭은 사람이 만든 인문환경이라는 것을 알게 되었어요.">' + esc(st.learned) + '</textarea></section>' +
      '</div>' +
      '<div class="wrap-actions no-print">' +
        '<button type="button" class="btn btn-ghost" data-testid="print">🖨️ 인쇄하기</button>' +
        '<button type="button" class="btn btn-ghost" data-testid="save-image">🖼️ 이미지로 저장</button>' +
      '</div>';

    var preview = $('[data-testid=map-preview]', root);
    $$('.place', preview).forEach(function (g) {
      g.removeAttribute('tabindex'); g.removeAttribute('role');
      var p = placeById(g.dataset.id), m = st.map[p.id];
      if (m && (m.correct || m.tries >= 2)) {
        g.classList.add('is-done', 'is-' + p.type);
        $('[data-mark="' + p.id + '"]', g).textContent = MARK[p.type];
      }
    });

    var learned = $('#learned', root);
    learned.addEventListener('input', function () { store.update(function (s) { s.learned = learned.value; }); });
    $('[data-testid=print]', root).addEventListener('click', function () { window.print(); });
    $('[data-testid=save-image]', root).addEventListener('click', function () { saveImage($('#record', root)); });
  }

  function saveImage(target) {
    var fallback = function () {
      feedback('이미지로 저장하지 못했어요. <strong>인쇄하기</strong>를 누르고 프린터에서 <strong>PDF로 저장</strong>을 골라 저장해 주세요.', 'no');
    };
    if (!window.html2canvas) { fallback(); return; }
    var name = S().student.name || '탐험대';
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      return window.html2canvas(target, { scale: 2, backgroundColor: '#fffdf6' });
    }).then(function (canvas) {
      var a = document.createElement('a');
      a.download = '환경탐험대-' + name + '.png';
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      a.remove();
      feedback('이미지를 저장했어요.', 'ok');
    }).catch(fallback);
  }

  // ---------- 아직 만들지 않은 단계 ----------
  function stub(n) {
    return function (root) { root.innerHTML = heading(n, STEPS[n].name, ''); };
  }

  var RENDER = {
    0: renderStart,
    1: renderIntro,
    2: renderAround,
    3: renderKinds,
    4: renderMap,
    5: renderCards,
    6: renderQuiz,
    7: renderWrap
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

if (typeof window === 'undefined') global.window = global;
/* 통과 조건, 퀴즈 만들기, 채점 */
(function () {
  'use strict';

  var AROUND_COUNT = 8;        // '환경이 뭘까?'에서 열어야 하는 것
  var CHECK_COUNT = 2;         // 그 단계의 확인 문제
  var FLIP_IDS = ['paddy', 'farm', 'orchard', 'port', 'bridge', 'road', 'apartment']; // 인문환경 예 카드
  var LABEL = { natural: '자연환경', human: '인문환경' };

  function isBlank(s) { return s == null || String(s).trim() === ''; }

  function hasFinal(word) {
    var ch = String(word).trim().slice(-1);
    var code = ch.charCodeAt(0) - 0xac00;
    if (code < 0 || code > 11171) return false;
    return code % 28 !== 0;
  }
  function topic(word) { return word + (hasFinal(word) ? '은' : '는'); }
  function object(word) { return word + (hasFinal(word) ? '을' : '를'); }
  function copula(word) { return word + (hasFinal(word) ? '이에요' : '예요'); }
  // 틀렸을 때 보여 줄 정답 문장. 문장으로 된 답(설명 고르기)은 조사를 붙이지 않는다.
  function answerLine(q) {
    if (q.type === 'reason') return '알맞은 답: ' + q.answer;
    return '정답은 ' + copula(q.answer) + '.';
  }
  // '다리는 사람들이 …'에서 앞의 '다리는 '을 떼어 이름으로 답을 맞히지 못하게 한다.
  function withoutSubject(item) {
    var head = topic(item.name) + ' ';
    return item.reason.indexOf(head) === 0 ? item.reason.slice(head.length) : item.reason;
  }
  // 다시 풀 때 보기 순서를 한 칸 돌린다(늘 처음과 다른 순서).
  function retryChoices(choices) { return choices.slice(1).concat(choices.slice(0, 1)); }

  function stepStatus(state, step, data, config) {
    var left;
    switch (step) {
      case 1: {
        var p = state.intro.ponds;
        var done = ['forest', 'park'].every(function (k) { return p[k].pick && !isBlank(p[k].why); });
        return { done: done, remaining: done ? '' : '두 연못 모두 고르고 까닭을 써요.' };
      }
      case 2: {
        var opened = state.around.opened.length;
        var checks = Object.keys(state.around.check).length;
        if (opened < AROUND_COUNT) return { done: false, remaining: '아직 ' + (AROUND_COUNT - opened) + '개를 더 눌러 봐요.' };
        if (config.step2CheckQuiz && checks < CHECK_COUNT) return { done: false, remaining: '확인 문제를 ' + (CHECK_COUNT - checks) + '개 더 풀어요.' };
        return { done: true, remaining: '' };
      }
      case 3: {
        var tabs = state.kinds.tabs;
        if (!(tabs.indexOf('natural') >= 0 && tabs.indexOf('human') >= 0)) return { done: false, remaining: '두 가지 환경을 모두 눌러 봐요.' };
        left = FLIP_IDS.filter(function (id) { return state.kinds.flipped.indexOf(id) < 0; }).length;
        return { done: left === 0, remaining: left ? '카드를 ' + left + '장 더 뒤집어 봐요.' : '' };
      }
      case 4: {
        left = data.places.filter(function (pl) {
          var m = state.map[pl.id];
          return !(m && (m.correct || m.tries >= 2));
        }).length;
        return { done: left === 0, remaining: left ? '지도에서 ' + left + '곳이 남았어요.' : '' };
      }
      case 5: {
        var ok = Object.keys(state.cards).filter(function (id) { return state.cards[id].correct; }).length;
        left = Math.max(0, config.cardPassCount - ok);
        return { done: left === 0, remaining: left ? '카드를 ' + left + '장 더 맞게 놓아요.' : '' };
      }
      case 6:
        return { done: !!state.quiz.done, remaining: state.quiz.done ? '' : '퀴즈를 끝까지 풀어요.' };
      default:
        return { done: true, remaining: '' };
    }
  }

  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function kindQ(item) {
    return { id: 'kind-' + item.id, type: 'kind', question: topic(item.name) + ' 어떤 환경일까요?',
      choices: ['자연환경', '인문환경'], answer: LABEL[item.type], explain: item.reason };
  }
  function oxQ(item, rng) {
    var claim = rng() < 0.5 ? item.type : (item.type === 'natural' ? 'human' : 'natural');
    return { id: 'ox-' + item.id, type: 'ox', question: topic(item.name) + ' ' + LABEL[claim] + '이에요.',
      choices: ['○', '✕'], answer: claim === item.type ? '○' : '✕', explain: item.reason };
  }
  function reasonQ(item, humans, rng) {
    var answer = withoutSubject(item);
    var wrong = shuffle(humans.filter(function (h) { return h.id !== item.id; }), rng).slice(0, 3)
      .map(withoutSubject);
    return { id: 'reason-' + item.id, type: 'reason', question: topic(item.name) + ' 어떤 곳일까요? 알맞은 설명을 골라요.',
      choices: shuffle([answer].concat(wrong), rng), answer: answer, explain: item.reason };
  }
  function pickNotQ(odd, sameType, rng) {
    var three = shuffle(sameType, rng).slice(0, 3);
    var base = odd.type === 'natural' ? 'human' : 'natural';
    return { id: 'pickNot-' + odd.id, type: 'pickNot', question: '다음 중 ' + LABEL[base] + '이 아닌 것은 무엇일까요?',
      choices: shuffle(three.map(function (i) { return i.name; }).concat(odd.name), rng), answer: odd.name, explain: odd.reason };
  }

  // count개의 문제: 직접 넣은 문제 최대 2개, 고르기(아닌 것) 1, 까닭 1, OX 1, 나머지는 자연/인문 고르기.
  function buildQuiz(data, count, rng) {
    var items = shuffle(data.places.concat(data.cards), rng);
    var humans = items.filter(function (i) { return i.type === 'human'; });
    var naturals = items.filter(function (i) { return i.type === 'natural'; });
    var used = {};
    function take(list) {
      for (var i = 0; i < list.length; i++) if (!used[list[i].id]) { used[list[i].id] = true; return list[i]; }
      return null;
    }
    var qs = shuffle(data.extra || [], rng).slice(0, Math.min(2, count));
    // 직접 넣은 문제가 다루는 항목은 자동 문제에서 빼서 같은 것을 두 번 묻지 않는다.
    qs.forEach(function (q) { (q.items || []).forEach(function (id) { used[id] = true; }); });
    var odd = take(items);
    if (odd && qs.length < count) qs.push(pickNotQ(odd, odd.type === 'natural' ? humans.filter(function (h) { return !used[h.id]; }) : naturals.filter(function (n) { return !used[n.id]; }), rng));
    var r = take(humans);
    if (r && qs.length < count) qs.push(reasonQ(r, humans, rng));
    var o = take(items);
    if (o && qs.length < count) qs.push(oxQ(o, rng));
    while (qs.length < count) {
      var k = take(items);
      if (!k) break;
      qs.push(kindQ(k));
    }
    return shuffle(qs, rng);
  }

  function grade(q, pick) { return pick !== undefined && pick === q.answer; }

  window.Logic = { isBlank: isBlank, topic: topic, object: object, copula: copula, answerLine: answerLine, retryChoices: retryChoices, stepStatus: stepStatus, buildQuiz: buildQuiz,
    grade: grade, shuffle: shuffle, LABEL: LABEL, FLIP_IDS: FLIP_IDS, AROUND_COUNT: AROUND_COUNT };
  if (typeof module !== 'undefined') module.exports = window.Logic;
})();

if (typeof window === 'undefined') global.window = global;
/* 학습 기록 저장. localStorage가 막혀 있어도 메모리로 동작한다. */
(function () {
  'use strict';

  function defaults() {
    return {
      student: { no: '', name: '' },
      step: 0,
      maxStep: 0,
      intro: { ponds: { forest: { pick: null, why: '' }, park: { pick: null, why: '' } } },
      around: { opened: [], check: {} },
      kinds: { tabs: [], flipped: [] },
      map: {},
      cards: {},
      cardOrder: [],
      quiz: { questions: [], answers: {}, retry: [], retryAnswers: {}, retryStarted: false, done: false },
      learned: ''
    };
  }

  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

  // 기본값의 모양을 따르되 저장된 값을 우선한다. 기본값이 빈 객체({})인 곳은 저장값을 그대로 쓴다.
  function merge(base, saved) {
    if (!isObj(saved)) return base;
    Object.keys(saved).forEach(function (k) {
      if (isObj(base[k]) && Object.keys(base[k]).length && isObj(saved[k])) base[k] = merge(base[k], saved[k]);
      else if (k in base && saved[k] !== undefined) base[k] = saved[k];
    });
    return base;
  }

  function create(storage, key) {
    var state = defaults();
    try {
      var raw = storage.getItem(key);
      if (raw) state = merge(defaults(), JSON.parse(raw));
    } catch (e) { state = defaults(); }

    function save() {
      try { storage.setItem(key, JSON.stringify(state)); } catch (e) { /* 저장이 막혀도 계속 */ }
    }

    return {
      get: function () { return state; },
      update: function (fn) {
        fn(state);
        if (state.step > state.maxStep) state.maxStep = state.step;
        save();
        return state;
      },
      reset: function () {
        try { storage.removeItem(key); } catch (e) { /* 무시 */ }
        state = defaults();
        return state;
      }
    };
  }

  window.Store = { create: create, defaults: defaults };
  if (typeof module !== 'undefined') module.exports = window.Store;
})();

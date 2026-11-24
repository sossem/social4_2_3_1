if (typeof window === "undefined") global.window = global;
/* 교사 설정: 값을 바꾸고 저장한 뒤 브라우저를 새로고침하세요. */
window.CONFIG = {
  // 학습 기록을 저장하는 이름입니다. 바꾸면 학생 기록이 처음부터 시작됩니다.
  storageKey: 'social4-2-3-1-env-v1',
  // 카드 나누기에서 맞게 놓아야 하는 카드 수입니다. 0이면 선택 활동이 됩니다.
  cardPassCount: 10,
  // 정리 퀴즈 문항 수입니다.
  quizCount: 10,
  // '환경이 뭘까?' 단계의 확인 문제(OX 2개)를 쓸지 정합니다.
  step2CheckQuiz: true
};
if (typeof module !== 'undefined') module.exports = window.CONFIG;

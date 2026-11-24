if (typeof window === 'undefined') global.window = global;
/*
 * 직접 넣는 퀴즈 문제. 자동으로 만든 문제와 섞여 나옵니다.
 * type: ox | blank | reason | pickNot | kind
 * choices: 보기, answer: 정답(보기 중 하나), explain: 까닭 한 줄
 * items: 이 문제가 다루는 장소·카드의 id. 자동 문제에서 같은 것을 또 묻지 않게 합니다.
 */
window.EXTRA_QUIZ = [
  { id: 'x-ox-paddy', items: ['paddy'], type: 'ox', question: '논은 자연환경이에요.', choices: ['○', '✕'], answer: '✕',
    explain: '논은 사람들이 벼를 기르려고 만든 인문환경이에요.' },
  { id: 'x-blank-human', items: [], type: 'blank', question: '사람들이 만든 환경을 (     )이라고 해요.',
    choices: ['자연환경', '인문환경'], answer: '인문환경',
    explain: '사람들이 필요한 것을 얻거나 생활을 편리하게 하려고 만든 환경을 인문환경이라고 해요.' },
  { id: 'x-reason-port', items: ['port'], type: 'reason', question: '사람들이 항구를 만든 까닭은 무엇일까요?',
    choices: ['배가 안전하게 드나들고 머물게 하려고', '바닷물을 깨끗하게 하려고', '물고기가 살 곳을 만들려고', '바다를 넓히려고'],
    answer: '배가 안전하게 드나들고 머물게 하려고', explain: '항구는 배가 드나들고 머물 수 있게 사람들이 만든 인문환경이에요.' },
  { id: 'x-pickNot-natural', items: ['mountain', 'wind', 'orchard', 'stream'], type: 'pickNot', question: '다음 중 자연환경이 아닌 것은 무엇일까요?',
    choices: ['산', '바람', '과수원', '하천'], answer: '과수원',
    explain: '과수원은 사람들이 과일나무를 가꾸려고 만든 인문환경이에요.' },
  { id: 'x-blank-env', items: [], type: 'blank', question: '우리를 둘러싸고 있는 모든 것을 (     )이라고 해요.',
    choices: ['환경', '날씨'], answer: '환경',
    explain: '우리를 둘러싸고 있는 모든 것을 환경이라고 해요.' }
];
if (typeof module !== 'undefined') module.exports = window.EXTRA_QUIZ;

if (typeof window === 'undefined') global.window = global;
/*
 * 마을 그림 지도에 표시할 곳 (4-1 활동)
 * type: natural(자연환경 ○) | human(인문환경 △)
 * x, y: 그림 위 이름표 위치 (가로 0~1000, 세로 0~640)
 * reason: 맞혔을 때 보여 줄 까닭, hint: 처음 틀렸을 때 보여 줄 질문
 */
window.PLACES = [
  { id: 'mountain', name: '산', type: 'natural', x: 470, y: 70,
    reason: '산은 사람이 만들지 않은 자연 그대로의 땅이에요.',
    hint: '산을 사람이 쌓아서 만들었을까요?' },
  { id: 'field', name: '들', type: 'natural', x: 360, y: 250,
    reason: '들은 자연 그대로 넓게 펼쳐진 평평한 땅이에요.',
    hint: '풀이 자라는 넓은 땅을 사람이 만들었을까요?' },
  { id: 'stream', name: '하천', type: 'natural', x: 880, y: 230,
    reason: '하천은 자연에서 물이 흘러 생긴 물길이에요.',
    hint: '산에서 흘러내리는 물길은 누가 만들었을까요?' },
  { id: 'sea', name: '바다', type: 'natural', x: 300, y: 590,
    reason: '바다는 자연 그대로의 환경이에요.',
    hint: '넓은 바다를 사람이 만들 수 있을까요?' },
  { id: 'rain', name: '비', type: 'natural', x: 790, y: 50,
    reason: '비는 날씨예요. 날씨도 자연환경이에요.',
    hint: '비가 내리는 날씨는 사람이 만든 것일까요?' },
  { id: 'wind', name: '바람', type: 'natural', x: 150, y: 150,
    reason: '바람은 날씨예요. 날씨도 자연환경이에요.',
    hint: '나무를 흔드는 바람은 사람이 만든 것일까요?' },
  { id: 'paddy', name: '논', type: 'human', x: 110, y: 300,
    reason: '논은 사람들이 벼를 기르려고 만든 땅이에요.',
    hint: '논에 물을 대고 벼를 심은 것은 누구일까요?' },
  { id: 'farm', name: '밭', type: 'human', x: 250, y: 380,
    reason: '밭은 사람들이 채소나 곡식을 기르려고 만든 땅이에요.',
    hint: '밭의 고랑을 반듯하게 만든 것은 누구일까요?' },
  { id: 'greenhouse', name: '비닐하우스', type: 'human', x: 110, y: 450,
    reason: '비닐하우스는 사람들이 추운 때에도 작물을 기르려고 만들었어요.',
    hint: '비닐을 씌운 집은 누가 지었을까요?' },
  { id: 'orchard', name: '과수원', type: 'human', x: 250, y: 200,
    reason: '과수원은 사람들이 과일나무를 줄 맞춰 심어 가꾸는 곳이에요.',
    hint: '과일나무를 줄 맞춰 심은 것은 누구일까요?' },
  { id: 'apartment', name: '아파트', type: 'human', x: 560, y: 220,
    reason: '아파트는 사람들이 살려고 지은 집이에요.',
    hint: '높은 건물은 누가 지었을까요?' },
  { id: 'road', name: '도로', type: 'human', x: 560, y: 400,
    reason: '도로는 사람과 차가 편리하게 다니려고 만들었어요.',
    hint: '자동차가 다니는 길은 누가 만들었을까요?' },
  { id: 'bridge', name: '다리', type: 'human', x: 880, y: 380,
    reason: '다리는 사람들이 하천을 쉽게 건너려고 만들었어요.',
    hint: '하천 위를 건너는 길은 누가 만들었을까요?' },
  { id: 'port', name: '항구', type: 'human', x: 700, y: 560,
    reason: '항구는 배가 안전하게 드나들고 머물 수 있게 사람들이 만들었어요.',
    hint: '배가 머무는 곳은 누가 만들었을까요?' }
];
if (typeof module !== 'undefined') module.exports = window.PLACES;

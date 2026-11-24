if (typeof window === 'undefined') global.window = global;
/*
 * 카드 나누기 카드 (4-2 활동)
 * type: natural(자연환경 ○) | human(인문환경 △)
 * emoji: 그림(사진이 없을 때), image: 사진 주소(비워 두면 emoji를 보여 줍니다)
 */
window.CARDS = [
  // 자연환경
  { id: 'forest', name: '숲', type: 'natural', emoji: '🌳', image: '', reason: '숲은 나무가 저절로 자라 이룬 자연 그대로의 환경이에요.' },
  { id: 'island', name: '섬', type: 'natural', emoji: '🏝️', image: '', reason: '섬은 바다로 둘러싸인 자연 그대로의 땅이에요.' },
  { id: 'mudflat', name: '갯벌', type: 'natural', emoji: '🦀', image: '', reason: '갯벌은 바닷물이 드나들며 자연이 만든 땅이에요.' },
  { id: 'waterfall', name: '폭포', type: 'natural', emoji: '💦', image: '', reason: '폭포는 물이 절벽에서 떨어지며 자연이 만든 곳이에요.' },
  { id: 'cave', name: '동굴', type: 'natural', emoji: '🕳️', image: '', reason: '동굴은 오랜 시간 동안 자연이 만든 굴이에요.' },
  { id: 'valley', name: '계곡', type: 'natural', emoji: '🏞️', image: '', reason: '계곡은 산과 산 사이로 물이 흐르는 자연 그대로의 곳이에요.' },
  { id: 'snow', name: '눈', type: 'natural', emoji: '❄️', image: '', reason: '눈은 날씨예요. 날씨도 자연환경이에요.' },
  { id: 'fog', name: '안개', type: 'natural', emoji: '🌫️', image: '', reason: '안개는 날씨예요. 날씨도 자연환경이에요.' },
  { id: 'temperature', name: '기온', type: 'natural', emoji: '🌡️', image: '', reason: '기온은 공기의 따뜻하고 차가운 정도예요. 날씨도 자연환경이에요.' },
  { id: 'sunlight', name: '햇빛', type: 'natural', emoji: '☀️', image: '', reason: '햇빛은 해가 비추는 빛으로 자연환경이에요.' },
  { id: 'beach', name: '모래사장', type: 'natural', emoji: '🏖️', image: '', reason: '모래사장은 파도가 모래를 쌓아 자연이 만든 곳이에요.' },
  { id: 'rockpeak', name: '바위산', type: 'natural', emoji: '⛰️', image: '', reason: '바위산은 자연 그대로의 땅이에요.' },
  { id: 'volcano', name: '화산', type: 'natural', emoji: '🌋', image: '', reason: '화산은 땅속의 힘으로 자연이 만든 산이에요.' },
  { id: 'cliff', name: '절벽', type: 'natural', emoji: '🪨', image: '', reason: '절벽은 자연이 깎아 만든 가파른 땅이에요.' },
  { id: 'typhoon', name: '태풍', type: 'natural', emoji: '🌀', image: '', reason: '태풍은 강한 비바람을 몰고 오는 날씨예요. 날씨도 자연환경이에요.' },
  // 인문환경
  { id: 'school', name: '학교', type: 'human', emoji: '🏫', image: '', reason: '학교는 사람들이 공부하려고 지은 곳이에요.' },
  { id: 'market', name: '시장', type: 'human', emoji: '🏪', image: '', reason: '시장은 사람들이 물건을 사고팔려고 만든 곳이에요.' },
  { id: 'hospital', name: '병원', type: 'human', emoji: '🏥', image: '', reason: '병원은 아픈 사람을 치료하려고 지은 곳이에요.' },
  { id: 'playground', name: '놀이터', type: 'human', emoji: '🛝', image: '', reason: '놀이터는 사람들이 놀 수 있게 만든 곳이에요.' },
  { id: 'tunnel', name: '터널', type: 'human', emoji: '🚇', image: '', reason: '터널은 산을 뚫어 쉽게 지나가려고 사람들이 만들었어요.' },
  { id: 'dam', name: '댐', type: 'human', emoji: '🧱', image: '', reason: '댐은 물을 모아 두고 쓰려고 사람들이 만들었어요.' },
  { id: 'reservoir', name: '저수지', type: 'human', emoji: '💧', image: '', reason: '저수지는 사람들이 둑을 쌓아 물을 모아 둔 곳이에요.' },
  { id: 'breakwater', name: '방파제', type: 'human', emoji: '🌊', image: '', reason: '방파제는 파도를 막으려고 사람들이 쌓았어요.' },
  { id: 'lighthouse', name: '등대', type: 'human', emoji: '🗼', image: '', reason: '등대는 밤에 배가 길을 찾도록 사람들이 세웠어요.' },
  { id: 'railway', name: '기찻길', type: 'human', emoji: '🛤️', image: '', reason: '기찻길은 기차가 다니도록 사람들이 만들었어요.' },
  { id: 'airport', name: '공항', type: 'human', emoji: '✈️', image: '', reason: '공항은 비행기가 뜨고 내리도록 사람들이 만들었어요.' },
  { id: 'saltfarm', name: '염전', type: 'human', emoji: '🧂', image: '', reason: '염전은 바닷물로 소금을 만들려고 사람들이 만든 곳이에요.' },
  { id: 'terrace', name: '계단식 논', type: 'human', emoji: '🌾', image: '', reason: '계단식 논은 산비탈에서도 벼를 기르려고 사람들이 만들었어요.' },
  { id: 'factory', name: '공장', type: 'human', emoji: '🏭', image: '', reason: '공장은 물건을 만들려고 사람들이 지은 곳이에요.' },
  { id: 'busstop', name: '버스 정류장', type: 'human', emoji: '🚏', image: '', reason: '버스 정류장은 버스를 편리하게 타려고 만든 곳이에요.' },
  { id: 'stadium', name: '운동장', type: 'human', emoji: '🏟️', image: '', reason: '운동장은 사람들이 운동하려고 만든 곳이에요.' },
  { id: 'windfarm', name: '풍력 발전기', type: 'human', emoji: '🌬️', image: '', reason: '풍력 발전기는 바람으로 전기를 만들려고 사람들이 세웠어요.' }
];
if (typeof module !== 'undefined') module.exports = window.CARDS;

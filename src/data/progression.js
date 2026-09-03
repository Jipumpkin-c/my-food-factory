/* ============================================================
   progression.js — 장비 / 공장 시설 / 꾸미기 / 연구 트리
   ============================================================ */

/* ---------- 장비 업그레이드 ----------
   levels[0] 은 시작 상태(Lv.1). cost 는 그 레벨로 올릴 때 드는 돈.
   effect 키:
     taste/nutrition/quality/preserve/eco : 결과 점수 보정
     easeKnead/easeHeat/easeDial          : 미니게임 난이도 완화(0~1)
     rp                                   : 제작 시 추가 연구 포인트
     sell                                 : 판매가 배율 가산
*/
FF.DATA.equipment = {
  oven: {
    id: 'oven', name: '오븐', icon: '🔥', about: '굽기와 가열을 담당해요',
    levels: [
      { name: '기본 오븐', cost: 0, effect: {}, note: '기본 성능' },
      { name: '좋은 오븐', cost: 1400, effect: { easeHeat: 0.18, quality: 4 }, note: '가열 판정이 넉넉해지고 품질 +4' },
      { name: '고급 오븐', cost: 3600, effect: { easeHeat: 0.34, quality: 9, taste: 4 }, note: '가열이 아주 쉬워지고 품질 +9, 맛 +4' }
    ]
  },
  mixer: {
    id: 'mixer', name: '반죽기', icon: '🥣', about: '반죽·착즙·교반을 도와줘요',
    levels: [
      { name: '손 반죽', cost: 0, effect: {}, note: '기본 성능' },
      { name: '전동 반죽기', cost: 1200, effect: { easeKnead: 0.2, taste: 4 }, note: '타이밍 칸이 넓어지고 맛 +4' },
      { name: '자동 반죽 라인', cost: 3200, effect: { easeKnead: 0.38, taste: 9 }, note: '타이밍이 아주 쉬워지고 맛 +9' }
    ]
  },
  fermenter: {
    id: 'fermenter', name: '발효기', icon: '🦠', about: '온도를 정밀하게 유지해요',
    levels: [
      { name: '없음', cost: 0, effect: {}, note: '기본 성능' },
      { name: '소형 발효기', cost: 1600, effect: { easeDial: 0.2, taste: 5 }, note: '온도 맞추기가 쉬워지고 맛 +5' },
      { name: '정밀 발효기', cost: 4200, effect: { easeDial: 0.4, taste: 10, nutrition: 5 }, note: '온도 조절이 아주 쉬워지고 맛 +10' }
    ]
  },
  fridge: {
    id: 'fridge', name: '냉장고', icon: '🧊', about: '식품을 신선하게 지켜요',
    levels: [
      { name: '기본 냉장고', cost: 0, effect: {}, note: '기본 성능' },
      { name: '고급 냉장고', cost: 1500, effect: { preserve: 10 }, note: '보존성 +10' },
      { name: '급속 냉각기', cost: 3800, effect: { preserve: 20, quality: 4 }, note: '보존성 +20, 품질 +4' }
    ]
  },
  packer: {
    id: 'packer', name: '포장기', icon: '📦', about: '포장을 깔끔하게 마무리해요',
    levels: [
      { name: '수작업 포장', cost: 0, effect: {}, note: '기본 성능' },
      { name: '자동 포장기', cost: 1800, effect: { preserve: 8, sell: 0.06 }, note: '보존성 +8, 판매가 +6%' },
      { name: '스마트 포장 라인', cost: 4500, effect: { preserve: 16, sell: 0.14, eco: 5 }, note: '보존성 +16, 판매가 +14%' }
    ]
  },
  lab: {
    id: 'lab', name: '분석 장비', icon: '🔬', about: '연구 포인트를 더 모을 수 있어요',
    levels: [
      { name: '기본 현미경', cost: 0, effect: {}, note: '기본 성능' },
      { name: '성분 분석기', cost: 2000, effect: { rp: 1, quality: 3 }, note: '제작마다 연구 포인트 +1' },
      { name: 'AI 품질 분석실', cost: 5000, effect: { rp: 2, quality: 7, nutrition: 5 }, note: '연구 포인트 +2, 품질 +7' }
    ]
  }
};

/* ---------- 공장 시설(확장) ---------- */
FF.DATA.rooms = [
  { id: 'lab',      name: '연구실',     icon: '🧪', cost: 0,     start: true, effect: {}, note: '모든 것이 시작되는 곳' },
  { id: 'smallLab', name: '작은 생산실', icon: '🍞', cost: 0,     start: true, effect: {}, note: '식품을 직접 만드는 공간' },
  { id: 'prod',     name: '생산실',     icon: '🏭', cost: 2600,  effect: { quality: 4 },            note: '모든 식품 품질 +4' },
  { id: 'pack',     name: '포장실',     icon: '📦', cost: 3400,  effect: { packDiscount: 0.4 },     note: '포장 비용 40% 절약' },
  { id: 'store',    name: '보관실',     icon: '🧊', cost: 4200,  effect: { preserve: 8 },           note: '보존성 +8' },
  { id: 'green',    name: '친환경 설비', icon: '🌱', cost: 5800, effect: { eco: 10 },               note: '환경 점수 +10' },
  { id: 'mega',     name: '대형 식품공장', icon: '🏢', cost: 14000, needAll: true, effect: { sell: 0.18, quality: 5 }, note: '판매가 +18%, 품질 +5' }
];

/* ---------- 공장 꾸미기 ---------- */
FF.DATA.decor = [
  { id: 'plant',   name: '화분',        icon: '🪴', cost: 600,  effect: { eco: 2 },     note: '환경 +2' },
  { id: 'sign',    name: '공장 간판',    icon: '🪧', cost: 900,  effect: { sell: 0.03 }, note: '판매가 +3%' },
  { id: 'cat',     name: '공장 고양이',  icon: '🐈', cost: 1200, effect: { combo: 1 },   note: '연속 보너스가 1단계 더 오래감' },
  { id: 'solar',   name: '태양광 패널',  icon: '☀️', cost: 2400, effect: { eco: 6 },     note: '환경 +6' },
  { id: 'trophy',  name: '금빛 트로피',  icon: '🏆', cost: 3000, effect: { sell: 0.08 }, note: '판매가 +8%' },
  { id: 'robot',   name: '도우미 로봇',  icon: '🤖', cost: 4000, effect: { rp: 1 },      note: '제작마다 연구 포인트 +1' }
];

/* ---------- 연구 트리 ----------
   cost   : 연구 포인트(RP)
   req    : 선행 연구 id
   unlock : 해금되는 식품 id
   codex  : 함께 열리는 도감 항목
*/
FF.DATA.research = {
  heating: {
    id: 'heating', name: '가열', icon: '🔥', cost: 0, req: [], owned: true,
    desc: '열로 익히고 살균하는 기술이에요.', codex: 'heating'
  },
  cooling: {
    id: 'cooling', name: '냉장', icon: '❄️', cost: 2, req: [],
    desc: '차갑게 보관하는 방법을 배워요.', codex: 'cooling', unlockStorage: 'fridge'
  },
  fermentation: {
    id: 'fermentation', name: '발효', icon: '🦠', cost: 3, req: ['cooling'],
    desc: '미생물의 힘으로 새로운 식품을 만들어요.', codex: 'fermentation', unlock: 'yogurt'
  },
  packaging: {
    id: 'packaging', name: '포장', icon: '📦', cost: 3, req: [],
    desc: '포장재를 골라 제품을 보호해요.', codex: 'packaging'
  },
  freezing: {
    id: 'freezing', name: '냉동', icon: '🧊', cost: 4, req: ['cooling'],
    desc: '얼려서 아주 오래 보관해요.', codex: 'freezing', unlock: 'icecream', unlockStorage: 'freezer'
  },
  qc: {
    id: 'qc', name: '품질관리', icon: '🧪', cost: 5, req: ['fermentation'],
    desc: '식품을 꼼꼼히 검사하는 기술이에요.', codex: 'qc', unlock: 'cheese'
  },
  eco: {
    id: 'eco', name: '친환경 식품', icon: '🌱', cost: 5, req: ['packaging'],
    desc: '환경을 생각하는 식품을 만들어요.', codex: 'eco', unlockPackage: 'eco'
  },
  functional: {
    id: 'functional', name: '기능성 식품', icon: '🥤', cost: 7, req: ['qc', 'eco'],
    desc: '건강에 도움이 되는 성분을 넣어요.', codex: 'additive', unlock: 'drink'
  }
};

FF.DATA.researchOrder = ['heating', 'cooling', 'packaging', 'fermentation', 'freezing', 'qc', 'eco', 'functional'];

/* ---------- 레벨 ---------- */
FF.DATA.levels = [
  { lv: 1, need: 0,    title: '신입 연구원',   icon: '🧑‍🎓' },
  { lv: 2, need: 120,  title: '주니어 연구원', icon: '🧑‍🔬' },
  { lv: 3, need: 320,  title: '정식 연구원',   icon: '👩‍🔬' },
  { lv: 4, need: 640,  title: '선임 연구원',   icon: '🥼' },
  { lv: 5, need: 1100, title: '책임 연구원',   icon: '🎖️' },
  { lv: 6, need: 1750, title: '공장장',        icon: '👷' },
  { lv: 7, need: 2600, title: '수석 개발자',   icon: '🏅' },
  { lv: 8, need: 3800, title: '식품공학 마스터', icon: '👑' }
];

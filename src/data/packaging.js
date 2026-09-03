/* ============================================================
   packaging.js — 보존(보관) 방법 & 포장재 데이터
   ============================================================ */

/* ---------- 보관 방법 ----------
   need : 해금에 필요한 research id (없으면 처음부터 사용 가능)
   keep : 보존성 기본 점수
   good : 이 방법이 잘 어울리는 식품 id 목록
*/
FF.DATA.storage = {
  room: {
    id: 'room', name: '실온', icon: '☀️', cost: 0, keep: 45,
    desc: '그냥 선반에 둬요. 편하지만 잘 상할 수 있어요.',
    good: []
  },
  sealed: {
    id: 'sealed', name: '밀봉', icon: '📦', cost: 15, keep: 66,
    desc: '공기를 막아 마르거나 상하는 것을 늦춰요.',
    good: ['bread', 'jam']
  },
  fridge: {
    id: 'fridge', name: '냉장', icon: '❄️', cost: 30, keep: 84,
    desc: '차갑게 보관해 미생물이 자라는 속도를 늦춰요.',
    need: 'cooling',
    good: ['yogurt', 'cheese', 'juice', 'jam', 'drink']
  },
  freezer: {
    id: 'freezer', name: '냉동', icon: '🧊', cost: 50, keep: 95,
    desc: '꽁꽁 얼려 아주 오래 보관해요. 대신 식감이 변할 수 있어요.',
    need: 'freezing',
    good: ['icecream']
  }
};

/* ---------- 포장재 ----------
   protect : 보존성 보너스
   eco     : 환경 점수(1~5)
*/
FF.DATA.packages = {
  none: {
    id: 'none', name: '기본 포장', icon: '🫙', cost: 0, protect: 0, eco: 2,
    pros: '돈이 들지 않아요', cons: '보호도 환경 점수도 기대하기 어려워요'
  },
  paper: {
    id: 'paper', name: '종이', icon: '📄', cost: 20, protect: 8, eco: 4,
    pros: '가볍고 저렴하며 재활용이 쉬워요', cons: '물기에는 약해요'
  },
  plastic: {
    id: 'plastic', name: '플라스틱', icon: '🥤', cost: 30, protect: 14, eco: 1,
    pros: '가볍고 사용하기 편리함', cons: '환경 점수가 낮아질 수 있음'
  },
  glass: {
    id: 'glass', name: '유리', icon: '🫗', cost: 65, protect: 20, eco: 3,
    pros: '제품을 잘 보호할 수 있음', cons: '무겁고 깨질 수 있음'
  },
  eco: {
    id: 'eco', name: '친환경 포장', icon: '🌱', cost: 95, protect: 15, eco: 5,
    pros: '환경 점수 상승', cons: '가격이 조금 비쌈'
  }
};

/** 포장 연구 전에는 기본 포장만 사용 */
FF.DATA.freePackages = ['none'];

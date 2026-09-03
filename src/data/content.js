/* ============================================================
   content.js — 도감 / 미션 / 업적 / 랜덤 이벤트 / 소비자
   ============================================================ */

/* ---------- 📚 식품공학 도감 ----------
   설명은 2~5문장, 중학생이 바로 이해할 수 있는 표현만 사용한다.
*/
FF.DATA.codex = {
  heating: {
    id: 'heating', name: '가열', icon: '🔥', how: '가열이 필요한 식품을 만들면 열려요',
    lines: [
      '가열은 열을 가해 식품을 익히고 안전하게 만드는 과정입니다.',
      '해로운 미생물을 없애고, 맛과 향을 좋게 만들어 줍니다.',
      '하지만 온도가 너무 높으면 타거나 영양소가 파괴될 수 있어요.'
    ]
  },
  fermentation: {
    id: 'fermentation', name: '발효', icon: '🦠', how: '발효 과정을 직접 해 보면 열려요',
    lines: [
      '발효는 미생물이 식품의 성분을 변화시키면서 일어나는 과정입니다.',
      '요구르트에서는 유산균이 중요한 역할을 합니다.',
      '온도와 시간에 따라 발효 결과가 달라질 수 있어요.'
    ]
  },
  cooling: {
    id: 'cooling', name: '냉각', icon: '❄️', how: '냉각 과정을 경험하면 열려요',
    lines: [
      '냉각은 식품의 온도를 낮추는 과정입니다.',
      '차가워지면 미생물이 자라는 속도가 크게 느려져요.',
      '발효를 알맞은 순간에 멈추는 데에도 사용합니다.'
    ]
  },
  freezing: {
    id: 'freezing', name: '냉동', icon: '🧊', how: '냉동을 연구하거나 사용하면 열려요',
    lines: [
      '냉동은 식품을 얼려서 아주 오래 보관하는 방법입니다.',
      '천천히 얼리면 큰 얼음 결정이 생겨 식감이 나빠져요.',
      '그래서 아이스크림은 얼리면서 계속 저어 줍니다.'
    ]
  },
  preserve: {
    id: 'preserve', name: '보존', icon: '🥫', how: '보관 방법을 선택하면 열려요',
    lines: [
      '보존은 식품이 상하지 않게 지키는 모든 방법을 말합니다.',
      '온도를 낮추거나, 공기를 막거나, 설탕·소금을 넣는 방법이 있어요.',
      '식품마다 알맞은 보존 방법이 다릅니다.'
    ]
  },
  packaging: {
    id: 'packaging', name: '포장', icon: '📦', how: '포장을 연구하면 열려요',
    lines: [
      '포장은 식품을 담아 보호하고 정보를 알려 주는 역할을 합니다.',
      '햇빛, 공기, 습기, 충격으로부터 제품을 지켜 줍니다.',
      '어떤 포장재를 쓰느냐에 따라 환경에 주는 영향도 달라집니다.'
    ]
  },
  microbe: {
    id: 'microbe', name: '미생물', icon: '🧫', how: '발효나 숙성을 경험하면 열려요',
    lines: [
      '미생물은 눈에 보이지 않을 만큼 작은 생물입니다.',
      '🦠 유용한 미생물은 발효를 도와 맛있는 식품을 만들어 줘요.',
      '⚠️ 주의가 필요한 미생물은 식품을 상하게 하므로 위생 관리가 중요합니다.'
    ]
  },
  nutrition: {
    id: 'nutrition', name: '영양', icon: '🥗', how: '영양이 중요한 식품을 만들면 열려요',
    lines: [
      '영양소는 우리 몸이 자라고 움직이는 데 필요한 성분입니다.',
      '가열 온도가 너무 높으면 비타민 같은 영양소가 줄어들 수 있어요.',
      '그래서 낮은 온도에서 천천히 살균하는 방법을 쓰기도 합니다.'
    ]
  },
  additive: {
    id: 'additive', name: '식품첨가물', icon: '💊', how: '기능성 식품을 연구하면 열려요',
    lines: [
      '식품첨가물은 맛·색·보존성을 좋게 하려고 넣는 재료입니다.',
      '나라에서 정한 안전한 사용량이 정해져 있어요.',
      '정해진 양을 지켜 쓰면 안전하게 사용할 수 있습니다.'
    ]
  },
  eco: {
    id: 'eco', name: '친환경 식품', icon: '🌱', how: '친환경을 연구하면 열려요',
    lines: [
      '친환경 식품은 만들고 버릴 때까지 환경을 적게 해치는 식품입니다.',
      '재활용이 쉬운 포장재를 쓰고, 에너지와 쓰레기를 줄이는 것이 핵심이에요.',
      '작은 선택이 모이면 큰 차이를 만듭니다.'
    ]
  },
  qc: {
    id: 'qc', name: '품질관리', icon: '🧪', how: '품질관리를 연구하면 열려요',
    lines: [
      '품질관리는 만든 식품이 늘 같은 수준인지 확인하는 일입니다.',
      '맛·색·냄새·식감·위생·보존성을 하나씩 검사해요.',
      '문제가 생기면 어느 과정에서 잘못됐는지 되짚어 고칩니다.'
    ]
  }
};
FF.DATA.codexOrder = ['heating', 'fermentation', 'cooling', 'freezing', 'preserve',
                      'packaging', 'microbe', 'nutrition', 'additive', 'eco', 'qc'];

/* ---------- 🎯 미션 ----------
   check.type: make | research | packageMatch | eco | score | room | codex | totalSold
*/
FF.DATA.missions = [
  { id: 'm1',  icon: '🍞', title: '첫 번째 빵을 만들어보세요.',           check: { type: 'make', food: 'bread' },       reward: { money: 500 } },
  { id: 'm2',  icon: '🍯', title: '맛있는 잼을 만들어보세요.',             check: { type: 'make', food: 'jam' },         reward: { money: 700 } },
  { id: 'm3',  icon: '🧃', title: '과일주스를 만들어보세요.',              check: { type: 'make', food: 'juice' },       reward: { money: 600, rp: 1 } },
  { id: 'm4',  icon: '🦠', title: '연구실에서 «발효»를 연구하세요.',        check: { type: 'research', id: 'fermentation' }, reward: { money: 800, rp: 1 } },
  { id: 'm5',  icon: '🥣', title: '요구르트를 만들어보세요.',              check: { type: 'make', food: 'yogurt' },      reward: { money: 1000 } },
  { id: 'm6',  icon: '📦', title: '식품에 알맞은 포장재를 선택하세요.',     check: { type: 'packageMatch' },              reward: { money: 900, unlockPackage: 'eco' }, hint: '먼저 «포장»을 연구해야 해요.' },
  { id: 'm7',  icon: '🌱', title: '환경 점수 80점 이상의 식품을 만드세요.', check: { type: 'eco', min: 80 },              reward: { money: 1200, decor: 'plant' } },
  { id: 'm8',  icon: '⭐', title: '총점 90점 이상의 식품을 만드세요.',      check: { type: 'score', min: 90 },            reward: { money: 1500, rp: 2 } },
  { id: 'm9',  icon: '🏭', title: '공장 시설을 하나 확장하세요.',           check: { type: 'room' },                      reward: { money: 2500 } },
  { id: 'm10', icon: '🧀', title: '치즈를 만들어보세요.',                  check: { type: 'make', food: 'cheese' },      reward: { money: 3000, rp: 2 } },
  { id: 'm11', icon: '📚', title: '식품공학 도감을 8개 이상 채우세요.',     check: { type: 'codex', count: 8 },           reward: { money: 2000, rp: 3 } },
  { id: 'm12', icon: '👑', title: '누적 판매 30,000G를 달성하세요.',        check: { type: 'totalSold', amount: 30000 },  reward: { money: 5000, decor: 'trophy' } }
];

/* ---------- 🏅 업적 ----------
   stat 기반으로 판정 (Progress.checkAchievements)
*/
FF.DATA.achievements = [
  { id: 'a_first',  icon: '👶', name: '첫 걸음',       desc: '식품을 처음 만들었다',            test: s => s.stats.made >= 1 },
  { id: 'a_ten',    icon: '🍽️', name: '단골 생겼다',   desc: '식품을 10개 만들었다',            test: s => s.stats.made >= 10 },
  { id: 'a_fifty',  icon: '🏭', name: '베테랑',         desc: '식품을 50개 만들었다',            test: s => s.stats.made >= 50 },
  { id: 'a_sgrade', icon: '🌟', name: '완벽주의자',     desc: 'S등급 제품을 만들었다',           test: s => s.stats.sGrade >= 1 },
  { id: 'a_combo',  icon: '🔥', name: '손맛 폭발',      desc: '연속 성공 5회를 달성했다',        test: s => s.stats.bestCombo >= 5 },
  { id: 'a_rare',   icon: '✨', name: '귀한 손님',      desc: '희귀 재료를 사용했다',            test: s => s.stats.rareUsed >= 1 },
  { id: 'a_eco',    icon: '🌍', name: '지구를 지켜요',  desc: '환경 점수 90 이상 제품을 만들었다', test: s => s.stats.bestEco >= 90 },
  { id: 'a_rich',   icon: '💰', name: '부자 연구원',    desc: '누적 50,000G를 벌었다',           test: s => s.stats.totalSold >= 50000 },
  { id: 'a_allfood',icon: '🍱', name: '못 만드는 게 없어', desc: '모든 식품을 한 번씩 만들었다',  test: s => FF.DATA.foodOrder.every(f => (s.stats.byFood[f] || 0) > 0) },
  { id: 'a_codex',  icon: '📖', name: '도감 완성',      desc: '식품공학 도감을 모두 채웠다',     test: s => FF.DATA.codexOrder.every(c => s.codex[c]) },
  { id: 'a_lv5',    icon: '🎖️', name: '책임 연구원',    desc: '레벨 5에 도달했다',               test: s => s.level >= 5 },
  { id: 'a_mega',   icon: '🏢', name: '대형 식품공장',  desc: '공장을 최대로 확장했다',          test: s => s.rooms.indexOf('mega') >= 0 }
];

/* ---------- 🎲 랜덤 이벤트 ----------
   effect 로 처리되는 값:
     money, rp, exp, eco, hygiene, item:{id,qty}, buff:{type,mult,turns}
*/
FF.DATA.events = [
  {
    id: 'e_price', icon: '🚨', title: '원료 가격 상승!',
    text: '우유 가격이 갑자기 올랐습니다. 어떻게 할까요?',
    options: [
      { label: '그냥 구매한다', sub: '우유 2개를 비싸게 사 둔다',
        effect: { money: -260, item: { id: 'milk', qty: 2 } }, msg: '비싸지만 재료를 확보했어요.' },
      { label: '다른 재료를 쓴다', sub: '이번엔 우유를 쓰지 않는다',
        effect: {}, msg: '지출을 아꼈어요. 다음 기회를 노려봐요!' },
      { label: '생산을 잠시 줄인다', sub: '설비를 점검한다',
        effect: { hygiene: 8, rp: 1 }, msg: '설비를 정비해 위생이 좋아지고 연구도 진전됐어요.' }
    ]
  },
  {
    id: 'e_sns', icon: '⭐', title: '인기 상승!',
    text: '당신의 제품이 SNS에서 화제가 되었습니다!',
    options: [
      { label: '기회를 살린다!', sub: '다음 판매 가격 +20%',
        effect: { buff: { type: 'sell', mult: 0.2, turns: 3 } }, msg: '다음 3번의 판매가 20% 더 비싸게 팔려요!' }
    ]
  },
  {
    id: 'e_fresh', icon: '🚚', title: '신선 재료 도착!',
    text: '거래처에서 남은 재료를 무료로 나눠 주었습니다.',
    options: [
      { label: '고맙게 받는다', sub: '재료를 무료로 얻는다',
        effect: { randomItems: 3 }, msg: '재료 창고가 든든해졌어요!' }
    ]
  },
  {
    id: 'e_inspect', icon: '🕵️', title: '위생 점검 나왔습니다',
    text: '식품위생 감독관이 공장을 찾아왔어요.',
    options: [
      { label: '깨끗이 청소한다', sub: '200G 지출, 위생 크게 회복',
        effect: { money: -200, hygiene: 25 }, msg: '반짝반짝! 합격을 받았어요.' },
      { label: '그냥 보여준다', sub: '운에 맡긴다',
        effect: { hygiene: -10 }, msg: '주의를 받았어요. 위생 관리를 신경 써야겠어요.' }
    ]
  },
  {
    id: 'e_discover', icon: '💡', title: '새로운 연구 발견!',
    text: '실험 중 우연히 흥미로운 결과를 얻었습니다!',
    options: [
      { label: '기록해 둔다', sub: '연구 포인트 +2',
        effect: { rp: 2, exp: 30 }, msg: '연구 노트가 두꺼워졌어요!' }
    ]
  },
  {
    id: 'e_order', icon: '📞', title: '단체 주문!',
    text: '근처 학교에서 급식용 제품을 대량 주문했어요.',
    options: [
      { label: '주문을 받는다', sub: '큰 수익, 위생 부담 조금',
        effect: { money: 1400, hygiene: -8, exp: 40 }, msg: '납품 완료! 통장이 두둑해졌어요.' },
      { label: '정중히 거절한다', sub: '품질에 집중한다',
        effect: { rp: 1 }, msg: '무리하지 않고 연구에 집중했어요.' }
    ]
  },
  {
    id: 'e_visit', icon: '🎒', title: '견학 온 학생들',
    text: '중학생들이 공장 견학을 왔습니다. 설명해 줄까요?',
    options: [
      { label: '신나게 설명한다', sub: '경험치와 환경 인식 상승',
        effect: { exp: 50, eco: 3 }, msg: '학생들이 눈을 반짝이며 들었어요!' },
      { label: '견본을 나눠 준다', sub: '재료 조금 소모, 인기 상승',
        effect: { money: -150, buff: { type: 'sell', mult: 0.12, turns: 2 } }, msg: '입소문이 나기 시작했어요!' }
    ]
  },
  {
    id: 'e_power', icon: '⚡', title: '정전 발생!',
    text: '갑자기 전기가 나갔어요. 냉장고 안의 재료가 걱정입니다.',
    options: [
      { label: '비상 발전기를 돌린다', sub: '300G 지출',
        effect: { money: -300 }, msg: '재료를 무사히 지켰어요!' },
      { label: '문을 꼭 닫고 기다린다', sub: '운에 맡긴다',
        effect: { hygiene: -12 }, msg: '조금 상했지만 큰 피해는 없었어요.' }
    ]
  }
];

/* ---------- 🙋 소비자 반응 ---------- */
FF.DATA.customers = [
  { icon: '🧒', name: '초등학생 손님' },
  { icon: '👩', name: '동네 단골' },
  { icon: '🧑‍🍳', name: '옆집 요리사' },
  { icon: '👵', name: '깐깐한 할머니' },
  { icon: '🧑‍💼', name: '유통 담당자' },
  { icon: '🏃', name: '운동하는 손님' },
  { icon: '👨‍👩‍👧', name: '가족 손님' },
  { icon: '🎓', name: '식품공학과 학생' }
];

FF.DATA.reactions = {
  S: ['인생 제품을 만났어요! 매일 사 먹을게요!', '이건 반칙이죠… 완벽합니다!', '친구들한테 자랑했어요. 최고예요!'],
  A: ['정말 맛있어요! 또 사러 올게요.', '품질이 아주 좋네요. 만족합니다!', '이 가격에 이 정도면 훌륭해요.'],
  B: ['무난하게 맛있어요.', '나쁘지 않아요. 조금만 더 신경 쓰면 좋겠어요.', '괜찮은데 뭔가 아쉬운 느낌?'],
  C: ['음… 다음엔 더 잘 만들어 주세요.', '조금 아쉬웠어요. 응원할게요!', '괜찮아요, 처음엔 다 그렇죠!']
};

/** 항목별 특별 코멘트 (가장 낮은 점수 항목에 대해) */
FF.DATA.weakComments = {
  taste:     '맛이 조금 밋밋했어요.',
  nutrition: '영양이 조금 아쉬웠어요.',
  quality:   '만듦새가 살짝 거칠었어요.',
  preserve:  '금방 상할 것 같아 걱정돼요.',
  eco:       '포장 쓰레기가 좀 많았어요.'
};

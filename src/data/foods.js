/* ============================================================
   foods.js — 식품 데이터 (제작 단계까지 데이터로 기술)
   ------------------------------------------------------------
   새 식품을 추가하려면 이 객체에 항목 하나만 추가하면 된다.
   시스템 코드는 전혀 고치지 않아도 된다.

   steps[] 의 type 은 4가지 미니게임 중 하나:
     'knead'  타이밍 게이지 (반죽 / 착즙 / 교반 / 커드)
     'heat'   길게 눌러 온도 유지 (굽기 / 살균 / 졸이기)
     'dial'   슬라이더로 값 맞추기 (온도 / 비율 / 당도)
     'choice' 보기 중에서 고르기 (발효 시간 / 숙성)

   affects  : 점수가 반영될 항목 taste|nutrition|quality|preserve
   concept  : 이 단계를 처음 수행하면 해금되는 도감 항목 id
   ============================================================ */
FF.DATA.foods = {

  /* ================= 빵 ================= */
  bread: {
    id: 'bread', name: '빵', icon: '🍞', basePrice: 320, difficulty: 1,
    tagline: '가장 기본이면서 가장 깊은 식품',
    recipe: [
      { id: 'flour', qty: 2 }, { id: 'water', qty: 1 },
      { id: 'yeast', qty: 1 }, { id: 'salt', qty: 1 }
    ],
    best: { storage: 'sealed', pack: 'paper' },
    steps: [
      {
        type: 'knead', key: 'knead', icon: '🤲', title: '반죽하기',
        desc: '리듬에 맞춰 반죽을 치대요. 초록 칸에서 딱 멈추면 성공!',
        vessel: '🥣', rounds: 3, sweep: 2200, zone: 26,
        affects: ['taste', 'quality']
      },
      {
        type: 'choice', key: 'proof', icon: '⏳', title: '발효 시간',
        desc: '효모가 빵을 부풀릴 시간을 줘야 해요. 얼마나 기다릴까요?',
        vessel: '🫙', concept: 'microbe',
        tip: '효모가 일할 시간이 너무 짧아도, 너무 길어도 좋지 않아요.',
        options: [
          { icon: '⏱️', label: '너무 짧게', sub: '30분', score: 48, feedback: '조금 더 기다렸다면 더 폭신했을 거예요.' },
          { icon: '✅', label: '적당하게', sub: '1시간', score: 95, feedback: '완벽한 발효! 반죽이 두 배로 부풀었어요.' },
          { icon: '💤', label: '너무 길게', sub: '3시간', score: 52, feedback: '너무 오래 뒀더니 시큼한 냄새가 나요.' }
        ],
        affects: ['taste', 'quality']
      },
      {
        type: 'heat', key: 'bake', icon: '🔥', title: '굽기',
        desc: '버튼을 꾹 눌러 오븐을 데우고, 초록 구간을 유지하세요!',
        vessel: '🍞', concept: 'heating',
        tempRange: [0, 250], target: [68, 90], hold: 2600, rise: 30, fall: 18, burn: 96,
        affects: ['taste', 'quality', 'preserve']
      }
    ],
    learn: '빵은 효모의 발효로 부풀고, 열로 구워져 완성돼요.'
  },

  /* ================= 잼 ================= */
  jam: {
    id: 'jam', name: '딸기잼', icon: '🍯', basePrice: 380, difficulty: 1,
    tagline: '설탕의 힘으로 오래 보관하는 식품',
    recipe: [{ id: 'fruit', qty: 2 }, { id: 'sugar', qty: 2 }],
    best: { storage: 'fridge', pack: 'glass' },
    steps: [
      {
        type: 'dial', key: 'sugarRatio', icon: '🍬', title: '설탕 넣기',
        desc: '설탕을 얼마나 넣을까요? 잼이 상하지 않게 하는 비밀이에요.',
        vessel: '🍓', concept: 'preserve',
        tip: '설탕이 많으면 미생물이 자라기 어려워져 오래 보관할 수 있어요.',
        valueRange: [0, 100], unit: '%', target: [50, 72],
        labels: ['적게', '알맞게', '많이'],
        affects: ['taste', 'preserve']
      },
      {
        type: 'heat', key: 'boil', icon: '🔥', title: '졸이기',
        desc: '냄비를 데워 수분을 날려요. 너무 태우면 안 돼요!',
        vessel: '🍲', concept: 'heating',
        tempRange: [60, 140], target: [52, 80], hold: 2800, rise: 26, fall: 16, burn: 93,
        affects: ['taste', 'quality', 'preserve']
      }
    ],
    learn: '설탕을 많이 넣고 가열하면 미생물이 자라기 어려워 오래 보관할 수 있어요.'
  },

  /* ================= 주스 ================= */
  juice: {
    id: 'juice', name: '과일주스', icon: '🧃', basePrice: 260, difficulty: 1,
    tagline: '영양을 지키면서 안전하게',
    recipe: [{ id: 'fruit', qty: 2 }, { id: 'water', qty: 1 }, { id: 'sugar', qty: 1 }],
    best: { storage: 'fridge', pack: 'glass' },
    steps: [
      {
        type: 'knead', key: 'press', icon: '🫗', title: '착즙하기',
        desc: '과일을 눌러 즙을 짜내요. 초록 칸 타이밍에 맞춰 누르세요!',
        vessel: '🍓', verb: '짜기', rounds: 3, sweep: 1900, zone: 24,
        affects: ['taste', 'nutrition']
      },
      {
        type: 'dial', key: 'pasteur', icon: '🌡️', title: '살균 온도',
        desc: '해로운 미생물만 없앨 수 있는 온도를 찾아보세요.',
        vessel: '🧃', concept: 'nutrition',
        tip: '온도가 너무 높으면 비타민 같은 영양소가 파괴될 수 있어요.',
        valueRange: [40, 100], unit: '°C', target: [52, 78],
        labels: ['미지근', '알맞음', '펄펄'],
        overPenalty: { key: 'nutrition', amount: 22 },
        affects: ['quality', 'preserve']
      }
    ],
    learn: '살균은 필요하지만 너무 뜨거우면 영양소가 손상돼요.'
  },

  /* ================= 요구르트 ================= */
  yogurt: {
    id: 'yogurt', name: '요구르트', icon: '🥣', basePrice: 520, difficulty: 2,
    need: 'fermentation',
    tagline: '유산균이 우유를 바꾸는 마법',
    recipe: [{ id: 'milk', qty: 3 }, { id: 'culture', qty: 1 }, { id: 'sugar', qty: 1 }],
    best: { storage: 'fridge', pack: 'plastic' },
    steps: [
      {
        type: 'heat', key: 'warm', icon: '🔥', title: '우유 데우기',
        desc: '유산균을 넣기 전에 우유를 알맞게 데워요.',
        vessel: '🥛', tempRange: [0, 100], target: [55, 80], hold: 2200, rise: 30, fall: 18, burn: 95,
        affects: ['quality']
      },
      {
        type: 'dial', key: 'fermTemp', icon: '🌡️', title: '발효 온도',
        desc: '유산균이 가장 활발하게 일하는 온도를 맞춰 주세요.',
        vessel: '🦠', concept: 'fermentation',
        tip: '유산균이 활동하기 적절한 조건을 선택해 보세요.',
        valueRange: [20, 60], unit: '°C', target: [52, 74],
        labels: ['차가움', '알맞음', '뜨거움'],
        affects: ['taste', 'nutrition', 'quality']
      },
      {
        type: 'choice', key: 'fermTime', icon: '⏳', title: '발효 시간',
        desc: '얼마나 오래 발효할까요?',
        vessel: '🥣',
        options: [
          { icon: '⏱️', label: '짧음', sub: '2시간', score: 50, feedback: '아직 묽어요. 조금 더 기다려 볼까요?' },
          { icon: '✅', label: '적당함', sub: '6시간', score: 95, feedback: '되직하고 새콤한 완벽한 요구르트!' },
          { icon: '💤', label: '김', sub: '15시간', score: 55, feedback: '너무 오래 발효해서 많이 시어졌어요.' }
        ],
        affects: ['taste', 'quality']
      },
      {
        type: 'choice', key: 'chill', icon: '❄️', title: '냉각하기',
        desc: '발효를 멈추려면 어떻게 해야 할까요?',
        vessel: '🧊', concept: 'cooling',
        options: [
          { icon: '☀️', label: '그냥 둔다', sub: '실온', score: 42, feedback: '발효가 계속돼서 너무 시어졌어요.' },
          { icon: '❄️', label: '냉장고에 넣는다', sub: '4°C', score: 96, feedback: '차갑게 식혀 발효를 멈췄어요. 완벽!' },
          { icon: '🧊', label: '얼려 버린다', sub: '-18°C', score: 55, feedback: '얼었다 녹으니 식감이 부서졌어요.' }
        ],
        affects: ['quality', 'preserve']
      }
    ],
    learn: '유산균은 알맞은 온도에서 우유를 요구르트로 바꿔요. 다 되면 차게 식혀 발효를 멈춰요.'
  },

  /* ================= 치즈 ================= */
  cheese: {
    id: 'cheese', name: '치즈', icon: '🧀', basePrice: 780, difficulty: 3,
    need: 'qc',
    tagline: '우유를 굳히고 시간으로 완성한다',
    recipe: [{ id: 'milk', qty: 4 }, { id: 'rennet', qty: 1 }, { id: 'salt', qty: 1 }],
    best: { storage: 'fridge', pack: 'paper' },
    steps: [
      {
        type: 'dial', key: 'curdTemp', icon: '🌡️', title: '응고 온도',
        desc: '응고제가 우유를 굳히기 좋은 온도를 맞춰 주세요.',
        vessel: '🥛', valueRange: [20, 60], unit: '°C', target: [24, 42],
        labels: ['차가움', '알맞음', '뜨거움'],
        tip: '너무 뜨거우면 응고제가 제 역할을 못해요.',
        affects: ['quality']
      },
      {
        type: 'knead', key: 'cut', icon: '🔪', title: '커드 자르기',
        desc: '몽글몽글 굳은 덩어리를 알맞은 크기로 잘라요.',
        vessel: '🧀', verb: '자르기', rounds: 4, sweep: 1600, zone: 18,
        affects: ['taste', 'quality']
      },
      {
        type: 'choice', key: 'age', icon: '📅', title: '숙성 기간',
        desc: '치즈는 기다릴수록 풍미가 깊어져요. 얼마나 숙성할까요?',
        vessel: '🧀', concept: 'microbe',
        options: [
          { icon: '🌱', label: '생치즈', sub: '숙성 안 함', score: 62, feedback: '부드럽지만 풍미는 조금 밋밋해요.' },
          { icon: '✅', label: '중간 숙성', sub: '3개월', score: 94, feedback: '고소하고 깊은 맛! 균형이 아주 좋아요.' },
          { icon: '🏆', label: '장기 숙성', sub: '2년', score: 78, feedback: '향은 강렬한데 호불호가 갈릴 것 같아요.' }
        ],
        affects: ['taste', 'preserve']
      }
    ],
    learn: '치즈는 우유를 굳혀 물기를 빼고, 미생물과 시간이 풍미를 만들어요.'
  },

  /* ================= 아이스크림 ================= */
  icecream: {
    id: 'icecream', name: '아이스크림', icon: '🍨', basePrice: 690, difficulty: 3,
    need: 'freezing',
    tagline: '차갑게, 그리고 부드럽게',
    recipe: [{ id: 'milk', qty: 2 }, { id: 'cream', qty: 2 }, { id: 'sugar', qty: 2 }, { id: 'egg', qty: 1 }],
    best: { storage: 'freezer', pack: 'plastic' },
    steps: [
      {
        type: 'dial', key: 'fat', icon: '🥛', title: '유지방 비율',
        desc: '지방이 많을수록 부드럽지만, 너무 많으면 느끼해져요.',
        vessel: '🍦', valueRange: [0, 20], unit: '%', target: [38, 66],
        labels: ['담백', '알맞음', '진함'],
        affects: ['taste', 'nutrition']
      },
      {
        type: 'heat', key: 'pasteur', icon: '🔥', title: '살균하기',
        desc: '달걀과 우유를 안전하게 살균해요.',
        vessel: '🍶', tempRange: [40, 100], target: [52, 78], hold: 2400, rise: 28, fall: 17, burn: 94,
        affects: ['quality', 'preserve']
      },
      {
        type: 'knead', key: 'churn', icon: '🌀', title: '얼리며 젓기',
        desc: '얼면서 계속 저어야 얼음 알갱이가 크게 생기지 않아요!',
        vessel: '🍨', verb: '젓기', rounds: 4, sweep: 1500, zone: 20,
        concept: 'freezing',
        affects: ['taste', 'quality']
      }
    ],
    learn: '얼리면서 계속 저으면 얼음 결정이 작아져 부드러운 아이스크림이 돼요.'
  },

  /* ================= 기능성 음료 ================= */
  drink: {
    id: 'drink', name: '기능성 음료', icon: '🥤', basePrice: 950, difficulty: 4,
    need: 'functional',
    tagline: '맛과 건강을 함께 설계한다',
    recipe: [{ id: 'water', qty: 2 }, { id: 'fruit', qty: 1 }, { id: 'vitamin', qty: 1 }, { id: 'sugar', qty: 1 }],
    best: { storage: 'fridge', pack: 'eco' },
    steps: [
      {
        type: 'dial', key: 'juiceRatio', icon: '🍹', title: '과즙 배합 비율',
        desc: '과즙을 얼마나 넣을지 정해요. 맛과 원가의 줄다리기!',
        vessel: '🍓', valueRange: [0, 100], unit: '%', target: [44, 72],
        labels: ['묽게', '알맞게', '진하게'],
        affects: ['taste', 'nutrition']
      },
      {
        type: 'heat', key: 'ltPasteur', icon: '🔥', title: '저온 살균',
        desc: '영양이 상하지 않도록 낮은 온도에서 천천히 살균해요.',
        vessel: '🥤', tempRange: [40, 100], target: [48, 70], hold: 3000, rise: 24, fall: 16, burn: 88,
        overPenalty: { key: 'nutrition', amount: 25 },
        affects: ['quality', 'preserve']
      },
      {
        type: 'dial', key: 'additive', icon: '💊', title: '기능성 성분 넣기',
        desc: '비타민을 얼마나 넣을까요? 많다고 무조건 좋은 건 아니에요.',
        vessel: '💊', concept: 'additive',
        tip: '식품첨가물은 정해진 양을 지켜야 안전하고 맛도 좋아요.',
        valueRange: [0, 100], unit: '%', target: [42, 66],
        labels: ['조금', '알맞게', '많이'],
        affects: ['nutrition', 'quality']
      }
    ],
    learn: '기능성 성분은 정해진 양을 지켜야 하고, 저온 살균으로 영양을 지켜요.'
  }
};

/** 식품 목록 배열 (표시 순서) */
FF.DATA.foodOrder = ['bread', 'jam', 'juice', 'yogurt', 'cheese', 'icecream', 'drink'];

/** 처음부터 만들 수 있는 식품 */
FF.DATA.startingFoods = ['bread', 'jam', 'juice'];

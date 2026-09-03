/* ============================================================
   ingredients.js — 재료 데이터
   새 재료를 추가하려면 이 객체에 항목만 추가하면 된다.
   ------------------------------------------------------------
   id        고유 키
   name      표시 이름
   icon      이모지
   price     1개당 가격(G)
   quality   품질 1~5 (별)
   freshness 신선도 0~100
   desc      플레이어에게 보여줄 쉬운 설명
   usedIn    사용되는 식품 id 목록(안내용)
   rare      희귀 재료 여부
   replaces  이 재료가 대신할 수 있는 기본 재료 id (희귀 재료용)
   need      해금 조건 research id (없으면 처음부터 구매 가능)
   ============================================================ */
FF.DATA.ingredients = {

  /* ---------- 기본 재료 ---------- */
  flour: {
    id: 'flour', name: '밀가루', icon: '🌾', price: 50, quality: 4, freshness: 95,
    desc: '빵과 같은 다양한 식품을 만드는 데 사용되는 기본 재료입니다.',
    usedIn: ['bread']
  },
  water: {
    id: 'water', name: '물', icon: '💧', price: 5, quality: 5, freshness: 100,
    desc: '반죽을 뭉치게 하고 재료를 골고루 섞이게 해 줍니다.',
    usedIn: ['bread', 'juice', 'drink']
  },
  milk: {
    id: 'milk', name: '우유', icon: '🥛', price: 80, quality: 4, freshness: 88,
    desc: '단백질과 칼슘이 풍부해요. 발효하면 요구르트나 치즈가 됩니다.',
    usedIn: ['yogurt', 'cheese', 'icecream']
  },
  egg: {
    id: 'egg', name: '달걀', icon: '🥚', price: 60, quality: 4, freshness: 90,
    desc: '재료끼리 잘 섞이게 도와주고 부드러운 식감을 만들어요.',
    usedIn: ['icecream']
  },
  sugar: {
    id: 'sugar', name: '설탕', icon: '🍬', price: 40, quality: 4, freshness: 99,
    desc: '단맛을 내고, 많이 넣으면 식품이 잘 상하지 않게 도와줍니다.',
    usedIn: ['jam', 'juice', 'yogurt', 'icecream', 'drink']
  },
  salt: {
    id: 'salt', name: '소금', icon: '🧂', price: 20, quality: 5, freshness: 99,
    desc: '맛을 잡아주고 미생물이 마구 늘어나는 것을 막아줍니다.',
    usedIn: ['bread', 'cheese']
  },
  fruit: {
    id: 'fruit', name: '딸기', icon: '🍓', price: 120, quality: 4, freshness: 80,
    desc: '향과 색이 좋은 과일이에요. 신선할 때 쓰는 것이 가장 좋습니다.',
    usedIn: ['jam', 'juice', 'drink']
  },
  yeast: {
    id: 'yeast', name: '효모', icon: '🫧', price: 90, quality: 4, freshness: 85,
    desc: '빵을 부풀게 하는 고마운 미생물이에요.',
    usedIn: ['bread']
  },
  culture: {
    id: 'culture', name: '유산균', icon: '🦠', price: 150, quality: 5, freshness: 92,
    desc: '우유를 요구르트로 바꿔 주는 유용한 미생물입니다.',
    usedIn: ['yogurt']
  },

  /* ---------- 연구로 해금되는 재료 ---------- */
  cream: {
    id: 'cream', name: '생크림', icon: '🍦', price: 130, quality: 4, freshness: 82,
    desc: '지방이 많아 아이스크림을 부드럽고 진하게 만들어 줍니다.',
    usedIn: ['icecream'], need: 'freezing'
  },
  rennet: {
    id: 'rennet', name: '응고제', icon: '🧪', price: 180, quality: 5, freshness: 95,
    desc: '우유를 몽글몽글하게 굳혀서 치즈의 덩어리를 만들어요.',
    usedIn: ['cheese'], need: 'qc'
  },
  vitamin: {
    id: 'vitamin', name: '비타민 믹스', icon: '💊', price: 200, quality: 5, freshness: 97,
    desc: '몸에 도움이 되는 영양 성분을 더해 주는 기능성 원료입니다.',
    usedIn: ['drink'], need: 'functional'
  },

  /* ---------- ✨ 희귀 재료 (상점에 가끔 등장) ---------- */
  goldwheat: {
    id: 'goldwheat', name: '황금 밀가루', icon: '🌟', price: 300, quality: 5, freshness: 100,
    desc: '단백질이 아주 풍부한 최고급 밀가루. 빵이 훨씬 잘 부풀어요!',
    usedIn: ['bread'], rare: true, replaces: 'flour'
  },
  richmilk: {
    id: 'richmilk', name: '목장 우유', icon: '🐄', price: 320, quality: 5, freshness: 100,
    desc: '갓 짜낸 진한 우유. 요구르트와 치즈의 맛이 확 살아납니다.',
    usedIn: ['yogurt', 'cheese', 'icecream'], rare: true, replaces: 'milk'
  },
  wildyeast: {
    id: 'wildyeast', name: '천연 발효종', icon: '🍯', price: 340, quality: 5, freshness: 96,
    desc: '오래 길러 낸 발효종이에요. 깊은 풍미의 빵을 만들 수 있어요.',
    usedIn: ['bread'], rare: true, replaces: 'yeast'
  },
  kingfruit: {
    id: 'kingfruit', name: '명품 딸기', icon: '🍒', price: 360, quality: 5, freshness: 100,
    desc: '향이 폭발하는 특상품 과일. 잼과 주스의 등급이 달라집니다.',
    usedIn: ['jam', 'juice', 'drink'], rare: true, replaces: 'fruit'
  },
  probio: {
    id: 'probio', name: '프리미엄 유산균', icon: '💎', price: 420, quality: 5, freshness: 100,
    desc: '아주 건강한 유산균 덩어리. 발효가 안정적으로 잘 됩니다.',
    usedIn: ['yogurt'], rare: true, replaces: 'culture'
  }
};

/** 희귀 재료 id 목록 */
FF.DATA.rareIngredients = Object.keys(FF.DATA.ingredients).filter(k => FF.DATA.ingredients[k].rare);

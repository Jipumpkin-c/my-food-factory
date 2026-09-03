/* ============================================================
   state.js — 게임 상태 + 로컬 저장/불러오기
   ============================================================ */
FF.State = (function () {

  const KEY = 'ff_myfoodfactory_v1';
  const U = FF.util;

  function makeDefault() {
    return {
      version: 1,
      money: 1500,
      rp: 2,
      level: 1,
      exp: 0,
      eco: 50,
      hygiene: 100,
      combo: 0,

      /* 재료 보유량 — 튜토리얼용 빵 재료를 미리 조금 준다 */
      inv: { flour: 4, water: 6, yeast: 2, salt: 3, sugar: 3, fruit: 2 },

      foods: FF.DATA.startingFoods.slice(),
      research: ['heating'],
      storageUnlocked: ['room', 'sealed'],
      packUnlocked: ['none'],

      equip: { oven: 1, mixer: 1, fermenter: 1, fridge: 1, packer: 1, lab: 1 },
      rooms: FF.DATA.rooms.filter(r => r.start).map(r => r.id),
      decor: [],

      codex: {},
      missionIdx: 0,
      missionsDone: [],
      achievements: [],
      buffs: [],

      market: { rareId: null, rareQty: 0, nextRoll: 0 },

      stats: {
        made: 0, sGrade: 0, bestCombo: 0, rareUsed: 0,
        bestEco: 0, bestScore: 0, totalSold: 0, byFood: {}, packMatch: 0
      },

      tutorialDone: false,
      settings: { sound: true, hints: true },
      stock: []
    };
  }

  let S = makeDefault();

  /* ---------- 저장 / 불러오기 ---------- */
  let saveTimer = null;
  function save(immediate) {
    clearTimeout(saveTimer);
    const doSave = () => {
      try { localStorage.setItem(KEY, JSON.stringify(S)); }
      catch (e) { console.warn('[FF] 저장 실패', e); }
    };
    if (immediate) doSave(); else saveTimer = setTimeout(doSave, 400);
  }

  function hasSave() {
    try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') throw new Error('형식 오류');
      S = U.defaults(data, makeDefault());
      // 배열 필드가 손상된 경우 복구
      ['foods', 'research', 'storageUnlocked', 'packUnlocked', 'rooms', 'decor',
       'missionsDone', 'achievements', 'buffs', 'stock'].forEach(k => {
        if (!Array.isArray(S[k])) S[k] = makeDefault()[k];
      });
      if (typeof S.codex !== 'object' || !S.codex) S.codex = {};
      return true;
    } catch (e) {
      console.warn('[FF] 저장 데이터를 읽을 수 없어 새로 시작합니다.', e);
      S = makeDefault();
      return false;
    }
  }

  function reset() {
    S = makeDefault();
    save(true);
    FF.bus.emit('state:changed');
  }

  function wipe() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    S = makeDefault();
  }

  function touch() { save(); FF.bus.emit('state:changed'); }

  /* ---------- 돈 / 자원 ---------- */
  function addMoney(n) {
    S.money = Math.max(0, Math.round(S.money + n));
    touch();
  }
  function canPay(n) { return S.money >= n; }
  function pay(n) {
    if (S.money < n) return false;
    S.money = Math.round(S.money - n);
    touch();
    return true;
  }
  function addRP(n) { S.rp = Math.max(0, S.rp + n); touch(); }

  /* ---------- 재료 ---------- */
  function itemCount(id) { return S.inv[id] || 0; }
  function addItem(id, n) {
    if (!FF.DATA.ingredients[id]) return;
    S.inv[id] = Math.max(0, (S.inv[id] || 0) + n);
    touch();
  }
  /** 레시피(대체 재료 지정 포함) 보유 여부 */
  function hasRecipe(recipe, subs) {
    return recipe.every(r => {
      const useId = (subs && subs[r.id]) || r.id;
      return itemCount(useId) >= r.qty;
    });
  }
  function consume(recipe, subs) {
    if (!hasRecipe(recipe, subs)) return false;
    recipe.forEach(r => {
      const useId = (subs && subs[r.id]) || r.id;
      S.inv[useId] = (S.inv[useId] || 0) - r.qty;
    });
    touch();
    return true;
  }

  /* ---------- 레벨 ---------- */
  function levelInfo(lv) {
    const L = FF.DATA.levels;
    return L[U.clamp((lv || S.level) - 1, 0, L.length - 1)];
  }
  function nextLevelNeed() {
    const L = FF.DATA.levels;
    const nx = L[S.level]; // 다음 레벨 항목
    return nx ? nx.need : null;
  }
  /** 경험치 추가 → 오른 레벨 수 반환 */
  function addExp(n) {
    S.exp += Math.max(0, Math.round(n));
    let gained = 0;
    const L = FF.DATA.levels;
    while (S.level < L.length && S.exp >= L[S.level].need) {
      S.level++; gained++;
    }
    touch();
    return gained;
  }

  /* ---------- 해금 상태 ---------- */
  const hasResearch = id => S.research.indexOf(id) >= 0;
  const foodUnlocked = id => S.foods.indexOf(id) >= 0;
  const equipLevel = id => S.equip[id] || 1;
  const hasRoom = id => S.rooms.indexOf(id) >= 0;
  const hasDecor = id => S.decor.indexOf(id) >= 0;

  function unlockFood(id) {
    if (!FF.DATA.foods[id] || foodUnlocked(id)) return false;
    S.foods.push(id); touch(); return true;
  }
  function unlockStorage(id) {
    if (!FF.DATA.storage[id] || S.storageUnlocked.indexOf(id) >= 0) return false;
    S.storageUnlocked.push(id); touch(); return true;
  }
  function unlockPackage(id) {
    if (!FF.DATA.packages[id] || S.packUnlocked.indexOf(id) >= 0) return false;
    S.packUnlocked.push(id); touch(); return true;
  }
  /** 재료 구매 가능 여부 (연구 조건) */
  function ingredientAvailable(id) {
    const ing = FF.DATA.ingredients[id];
    if (!ing) return false;
    if (ing.rare) return S.market.rareId === id;
    return !ing.need || hasResearch(ing.need);
  }

  /* ---------- 장비/시설 보너스 합산 ---------- */
  function bonus(key) {
    let v = 0;
    for (const id in FF.DATA.equipment) {
      const eq = FF.DATA.equipment[id];
      const lv = equipLevel(id);
      const e = (eq.levels[lv - 1] || {}).effect || {};
      if (e[key]) v += e[key];
    }
    FF.DATA.rooms.forEach(r => { if (hasRoom(r.id) && r.effect && r.effect[key]) v += r.effect[key]; });
    FF.DATA.decor.forEach(d => { if (hasDecor(d.id) && d.effect && d.effect[key]) v += d.effect[key]; });
    return v;
  }

  /* ---------- 위생 ---------- */
  function addHygiene(n) {
    S.hygiene = U.clamp(Math.round(S.hygiene + n), 0, 100);
    touch();
  }
  function addEco(n) {
    S.eco = U.clamp(Math.round(S.eco + n), 0, 100);
    touch();
  }

  /* ---------- 버프 ---------- */
  function addBuff(type, mult, turns) {
    S.buffs.push({ type, mult, turns });
    touch();
  }
  function buffMult(type) {
    let m = 1;
    S.buffs.forEach(b => { if (b.type === type) m += b.mult; });
    return m;
  }
  function tickBuffs(type) {
    S.buffs = S.buffs.filter(b => {
      if (b.type !== type) return true;
      b.turns--;
      return b.turns > 0;
    });
    touch();
  }

  /* ---------- 콤보 ---------- */
  function comboBonusSlots() { return 5 + bonus('combo'); }
  function pushCombo(success) {
    if (success) {
      S.combo = Math.min(S.combo + 1, comboBonusSlots() + 3);
      S.stats.bestCombo = Math.max(S.stats.bestCombo, S.combo);
    } else {
      S.combo = 0;
    }
    touch();
    return S.combo;
  }
  function comboMult() {
    return 1 + Math.min(S.combo, comboBonusSlots()) * 0.06;
  }

  return {
    get s() { return S; },
    makeDefault, save, load, hasSave, reset, wipe, touch,
    addMoney, canPay, pay, addRP,
    itemCount, addItem, hasRecipe, consume,
    levelInfo, nextLevelNeed, addExp,
    hasResearch, foodUnlocked, equipLevel, hasRoom, hasDecor,
    unlockFood, unlockStorage, unlockPackage, ingredientAvailable,
    bonus, addHygiene, addEco,
    addBuff, buffMult, tickBuffs,
    pushCombo, comboMult, comboBonusSlots
  };
})();

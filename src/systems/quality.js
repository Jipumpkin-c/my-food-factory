/* ============================================================
   quality.js — 품질 평가 계산
   미니게임 결과 + 재료 + 장비 + 보관/포장 → 별점·점수·판매가
   ============================================================ */
FF.Quality = (function () {

  const U = FF.util;
  const CATS = ['taste', 'nutrition', 'quality', 'preserve', 'eco'];
  const CAT_NAME = { taste: '맛', nutrition: '영양', quality: '품질', preserve: '보존성', eco: '환경' };

  const avg = a => (a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : 70);

  /**
   * batch = {
   *   foodId, results:[{key,score,affects}], ingQuality, ingFresh,
   *   storage, pack, overheat, penalties:{nutrition:n}, usedRare
   * }
   */
  function evaluate(batch) {
    const S = FF.State.s;
    const food = FF.DATA.foods[batch.foodId];
    const B = k => FF.State.bonus(k);

    const all = batch.results.map(r => r.score);
    const pool = k => {
      const a = batch.results.filter(r => (r.affects || []).indexOf(k) >= 0).map(r => r.score);
      return a.length ? avg(a) : avg(all);
    };

    const st = FF.DATA.storage[batch.storage] || FF.DATA.storage.room;
    const pk = FF.DATA.packages[batch.pack] || FF.DATA.packages.none;

    /* 보관 적합도 */
    let fit = st.keep;
    const bestSt = (food.best && food.best.storage) || null;
    if ((st.good || []).indexOf(batch.foodId) >= 0) fit += 14;
    else if (bestSt === st.id) fit += 12;
    else if (bestSt && bestSt !== st.id) fit -= 14;
    fit = U.clamp(fit, 0, 100);

    /* 위생 / 에너지 */
    const hygEff = (S.hygiene - 85) * 0.25;
    const energyPenalty = (batch.overheat || 0) * 6;
    const nutriPenalty = (batch.penalties && batch.penalties.nutrition) || 0;

    const cats = {};
    cats.taste = pool('taste') * 0.68 + batch.ingQuality * 0.32 + B('taste');
    cats.nutrition = pool('nutrition') * 0.50 + batch.ingFresh * 0.28 + batch.ingQuality * 0.22
                     + B('nutrition') - nutriPenalty;
    cats.quality = avg(all) * 0.70 + batch.ingQuality * 0.30 + B('quality') + hygEff;
    cats.preserve = pool('preserve') * 0.36 + fit * 0.50 + pk.protect + B('preserve');
    cats.eco = 38 + pk.eco * 8 + B('eco') + (S.eco - 50) * 0.22 - energyPenalty;

    CATS.forEach(k => { cats[k] = U.clamp(Math.round(cats[k]), 0, 100); });

    const total = Math.round(
      cats.taste * 0.30 + cats.nutrition * 0.18 + cats.quality * 0.26 +
      cats.preserve * 0.16 + cats.eco * 0.10
    );

    const grade = total >= 92 ? 'S' : total >= 80 ? 'A' : total >= 65 ? 'B' : 'C';

    /* 품질검사 카드 6항목 */
    const j = () => U.rndInt(-3, 3);
    const metrics = {
      taste:   U.clamp(Math.round(cats.taste + j()), 0, 100),
      color:   U.clamp(Math.round((cats.taste * 0.45 + cats.quality * 0.55) + j()), 0, 100),
      smell:   U.clamp(Math.round((cats.taste * 0.62 + cats.quality * 0.38) + j()), 0, 100),
      texture: U.clamp(Math.round((cats.quality * 0.62 + cats.taste * 0.38) + j()), 0, 100),
      hygiene: U.clamp(Math.round(S.hygiene * 0.68 + cats.quality * 0.32), 0, 100),
      preserve: cats.preserve
    };

    /* 별점 */
    const stars = {};
    CATS.forEach(k => { stars[k] = U.scoreToStar(cats[k]); });

    /* 가격 */
    const comboMult = FF.State.comboMult();
    const buff = FF.State.buffMult('sell');
    const price = Math.max(10, Math.round(
      food.basePrice * (0.5 + total / 100 * 1.15) * (1 + B('sell')) * comboMult * buff / 10
    ) * 10);

    /* 가장 약한 항목 */
    let weak = 'taste', wv = 999;
    CATS.forEach(k => { if (cats[k] < wv) { wv = cats[k]; weak = k; } });

    return {
      foodId: batch.foodId, name: food.name, icon: food.icon,
      cats, stars, metrics, total, grade, price, weak,
      comboMult, buffMult: buff,
      storage: batch.storage, pack: batch.pack,
      packMatch: (food.best && food.best.pack) === batch.pack,
      usedRare: !!batch.usedRare
    };
  }

  /** 재료 품질/신선도 요약 (0~100) */
  function ingredientScore(recipe, subs) {
    let q = 0, f = 0, n = 0, rare = false;
    recipe.forEach(r => {
      const id = (subs && subs[r.id]) || r.id;
      const ing = FF.DATA.ingredients[id];
      if (!ing) return;
      q += (ing.quality / 5) * 100 * r.qty;
      f += ing.freshness * r.qty;
      n += r.qty;
      if (ing.rare) rare = true;
    });
    if (!n) return { quality: 70, fresh: 80, rare: false };
    return { quality: Math.round(q / n), fresh: Math.round(f / n), rare };
  }

  return { evaluate, ingredientScore, CATS, CAT_NAME };
})();

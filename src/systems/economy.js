/* ============================================================
   economy.js — 돈의 흐름 (재료 구매 / 판매 / 업그레이드 / 확장)
   ============================================================ */
FF.Economy = (function () {

  const U = FF.util;

  /* ---------- 상점 갱신 (희귀 재료 입고) ---------- */
  function refreshMarket(force) {
    const S = FF.State.s;
    if (!force && S.market.rareId && S.stats.made < S.market.nextRoll) return false;

    const pool = FF.DATA.rareIngredients.filter(id => {
      const ing = FF.DATA.ingredients[id];
      return (ing.usedIn || []).some(f => FF.State.foodUnlocked(f));
    });

    if (pool.length && U.chance(0.6)) {
      S.market.rareId = U.pick(pool);
      S.market.rareQty = U.rndInt(1, 2);
    } else {
      S.market.rareId = null;
      S.market.rareQty = 0;
    }
    S.market.nextRoll = S.stats.made + 3;
    FF.State.touch();
    return true;
  }

  /* ---------- 재료 구매 ---------- */
  function buyIngredient(id, qty, ev) {
    const ing = FF.DATA.ingredients[id];
    if (!ing) return false;
    const S = FF.State.s;

    if (!FF.State.ingredientAvailable(id)) {
      FF.UI.toast('🔒 아직 구매할 수 없는 재료입니다.', 'warn');
      return false;
    }
    if (ing.rare) {
      qty = Math.min(qty, S.market.rareQty);
      if (qty <= 0) { FF.UI.toast('✨ 이번 입고분은 다 팔렸어요.', 'warn'); return false; }
    }

    const cost = ing.price * qty;
    if (!FF.State.canPay(cost)) {
      FF.UI.toast('💰 돈이 부족합니다.', 'bad');
      FF.Audio.play('bad');
      return false;
    }

    FF.State.pay(cost);
    FF.State.addItem(id, qty);
    if (ing.rare) { S.market.rareQty -= qty; FF.State.touch(); }

    FF.Audio.play('coin');
    FF.UI.fxFloat(ev, '-' + U.fmt(cost) + 'G', 'minus');
    FF.UI.toast(`${ing.icon} ${ing.name} ${qty}개 구매!`, 'good');
    FF.UI.bumpStat('money');
    return true;
  }

  /* ---------- 제품 판매 ---------- */
  function sellProduct(product, ev) {
    const S = FF.State.s;
    const price = product.price;

    FF.State.addMoney(price);
    S.stats.totalSold += price;
    S.stats.bestScore = Math.max(S.stats.bestScore, product.total);
    if (product.grade === 'S') S.stats.sGrade++;
    S.stats.bestEco = Math.max(S.stats.bestEco, product.cats.eco);
    FF.State.tickBuffs('sell');
    FF.State.touch();

    FF.Audio.play('coin');
    FF.UI.fxFloat(ev, '+' + U.fmt(price) + 'G');
    FF.UI.bumpStat('money');

    const lv = FF.State.addExp(Math.round(product.total * 0.7 + 10));
    FF.bus.emit('product:sold', { product, levelsGained: lv });
    return price;
  }

  /* ---------- 창고 ---------- */
  function storeProduct(product) {
    const S = FF.State.s;
    S.stock.push({
      foodId: product.foodId, name: product.name, icon: product.icon,
      price: product.price, total: product.total, grade: product.grade
    });
    if (S.stock.length > 12) S.stock.shift();
    FF.State.touch();
    FF.UI.toast('📦 창고에 보관했어요. 공장 화면에서 팔 수 있어요.', 'good');
  }

  function sellStock(index, ev) {
    const S = FF.State.s;
    const it = S.stock[index];
    if (!it) return;
    S.stock.splice(index, 1);
    sellProduct({
      foodId: it.foodId, name: it.name, icon: it.icon, price: it.price,
      total: it.total, grade: it.grade, cats: { eco: 0 }
    }, ev);
    FF.UI.toast(`${it.icon} ${it.name} 판매! +${U.fmt(it.price)}G`, 'good');
  }

  /* ---------- 장비 업그레이드 ---------- */
  function upgradeEquipment(id, ev) {
    const eq = FF.DATA.equipment[id];
    if (!eq) return false;
    const lv = FF.State.equipLevel(id);
    const next = eq.levels[lv];
    if (!next) { FF.UI.toast('이미 최고 등급이에요!', 'warn'); return false; }
    if (!FF.State.canPay(next.cost)) {
      FF.UI.toast('💰 돈이 부족합니다.', 'bad'); FF.Audio.play('bad'); return false;
    }
    FF.State.pay(next.cost);
    FF.State.s.equip[id] = lv + 1;
    FF.State.touch();
    FF.Audio.play('unlock');
    FF.UI.fxFloat(ev, '-' + U.fmt(next.cost) + 'G', 'minus');
    FF.UI.toast(`${eq.icon} ${next.name} 완성! ${next.note}`, 'good');
    FF.UI.confetti();
    FF.bus.emit('equip:upgraded', { id, level: lv + 1 });
    return true;
  }

  /* ---------- 공장 확장 ---------- */
  function buildRoom(id, ev) {
    const room = FF.DATA.rooms.find(r => r.id === id);
    if (!room || FF.State.hasRoom(id)) return false;

    if (room.needAll) {
      const rest = FF.DATA.rooms.filter(r => !r.start && !r.needAll);
      if (!rest.every(r => FF.State.hasRoom(r.id))) {
        FF.UI.toast('🔒 다른 시설을 모두 지어야 해요.', 'warn');
        return false;
      }
    }
    if (!FF.State.canPay(room.cost)) {
      FF.UI.toast('💰 돈이 부족합니다.', 'bad'); FF.Audio.play('bad'); return false;
    }
    FF.State.pay(room.cost);
    FF.State.s.rooms.push(id);
    FF.State.touch();
    FF.Audio.play('unlock');
    FF.UI.fxFloat(ev, '-' + U.fmt(room.cost) + 'G', 'minus');
    FF.UI.confetti();
    FF.UI.unlockBurst({ icon: room.icon, label: '공장 확장', title: room.name, desc: room.note });
    FF.bus.emit('room:built', { id });
    return true;
  }

  /* ---------- 공장 꾸미기 ---------- */
  function buyDecor(id, ev) {
    const d = FF.DATA.decor.find(x => x.id === id);
    if (!d || FF.State.hasDecor(id)) return false;
    if (!FF.State.canPay(d.cost)) {
      FF.UI.toast('💰 돈이 부족합니다.', 'bad'); FF.Audio.play('bad'); return false;
    }
    FF.State.pay(d.cost);
    FF.State.s.decor.push(id);
    FF.State.touch();
    FF.Audio.play('pop');
    FF.UI.fxFloat(ev, '-' + U.fmt(d.cost) + 'G', 'minus');
    FF.UI.toast(`${d.icon} ${d.name}을(를) 놓았어요! ${d.note}`, 'good');
    return true;
  }

  /** 포장 비용(시설 할인 반영) */
  function packCost(packId) {
    const pk = FF.DATA.packages[packId];
    if (!pk) return 0;
    const disc = Math.min(0.8, FF.State.bonus('packDiscount'));
    return Math.round(pk.cost * (1 - disc));
  }

  return {
    refreshMarket, buyIngredient, sellProduct, storeProduct, sellStock,
    upgradeEquipment, buildRoom, buyDecor, packCost
  };
})();

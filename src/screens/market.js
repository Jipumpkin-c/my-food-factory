/* ============================================================
   market.js — 재료 상점
   ============================================================ */
FF.Screens.market = (function () {

  const U = FF.util;

  function ingCard(id) {
    const ing = FF.DATA.ingredients[id];
    const S = FF.State.s;
    const own = FF.State.itemCount(id);
    const canBuy = FF.State.canPay(ing.price);
    const rareLeft = ing.rare ? S.market.rareQty : null;

    const usedIn = (ing.usedIn || [])
      .filter(f => FF.DATA.foods[f])
      .map(f => FF.DATA.foods[f].icon).join(' ');

    return `
      <div class="card ing-card ${ing.rare ? 'rare-card' : ''}">
        ${ing.rare ? '<span class="badge rare rare-tag">✨ 희귀</span>' : ''}
        ${own ? `<span class="own">×${own}</span>` : ''}
        <span class="iic">${ing.icon}</span>
        <div class="inm">${ing.name}</div>
        <div class="ipr">${U.fmt(ing.price)}G</div>
        <div class="tiny">${U.stars(ing.quality)}</div>
        <div class="idesc">${ing.desc}</div>
        <div class="tiny muted" style="margin-bottom:6px">신선도 ${ing.freshness}% ${usedIn ? '· ' + usedIn : ''}</div>
        ${ing.rare
          ? `<button class="btn small wide ${rareLeft > 0 && canBuy ? 'purple' : ''}" data-buy="${id}" data-q="1" ${rareLeft > 0 ? '' : 'disabled'}>
               ${rareLeft > 0 ? '✨ 1개 구매 (남은 ' + rareLeft + ')' : '품절'}
             </button>`
          : `<div class="btn-row" style="justify-content:center">
               <button class="btn small ${canBuy ? 'primary' : ''}" data-buy="${id}" data-q="1">+1</button>
               <button class="btn small" data-buy="${id}" data-q="5">+5</button>
             </div>`}
      </div>`;
  }

  function render(root) {
    const S = FF.State.s;
    const ids = Object.keys(FF.DATA.ingredients)
      .filter(id => FF.State.ingredientAvailable(id));

    const normal = ids.filter(id => !FF.DATA.ingredients[id].rare);
    const rare = ids.filter(id => FF.DATA.ingredients[id].rare);

    const lockedCount = Object.keys(FF.DATA.ingredients)
      .filter(id => !FF.DATA.ingredients[id].rare && !FF.State.ingredientAvailable(id)).length;

    root.innerHTML = `
      <div class="h-sec">🛒 재료 상점</div>
      <p class="sub-line">식품을 만들려면 먼저 재료가 필요해요. 보유량은 카드 오른쪽 위에 표시됩니다.</p>

      ${rare.length ? `
        <div class="panel" style="border-color:#e3c6ff;background:linear-gradient(100deg,#fdf7ff,#fff)">
          <div class="panel-title">✨ 오늘의 희귀 재료 <span class="sub">품질이 최고! 수량 한정</span></div>
          <div class="grid auto">${rare.map(ingCard).join('')}</div>
        </div>` : `
        <div class="note" style="margin-bottom:14px">✨ 희귀 재료는 가끔 입고돼요. 식품을 몇 번 더 만들면 새 물건이 들어옵니다!</div>`}

      <div class="panel">
        <div class="panel-title">🧺 기본 재료</div>
        <div class="grid auto">${normal.map(ingCard).join('')}</div>
      </div>

      ${lockedCount ? `<p class="tiny muted center" style="margin-top:12px">🔒 연구를 하면 ${lockedCount}종류의 재료를 더 살 수 있어요.</p>` : ''}

      <div class="btn-row" style="margin-top:14px">
        <button class="btn wide primary" data-go="cook">🍎 재료를 샀다면 식품 만들러 가기</button>
      </div>`;

    U.on(root, 'click', '[data-buy]', (e, t) => {
      FF.Economy.buyIngredient(t.dataset.buy, +t.dataset.q, e);
      FF.UI.refresh();
    });
  }

  return { render };
})();

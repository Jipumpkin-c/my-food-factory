/* ============================================================
   factory.js — 공장(홈) 화면
   미션 배너 / 공장 전경 / 창고 / 장비 / 확장 / 꾸미기 / 업적
   ============================================================ */
FF.Screens.factory = (function () {

  const U = FF.util;

  /* ---------- 미션 배너 ---------- */
  function missionBanner() {
    const m = FF.Progress.currentMission();
    if (!m) {
      return `<div class="mission-banner">
                <span class="mic">👑</span>
                <div class="grow"><div class="mt">ALL CLEAR</div>
                  <h4>모든 미션을 완료했어요!</h4>
                  <div class="mr">이제 최고의 공장을 자유롭게 키워 보세요.</div></div>
              </div>`;
    }
    return `<div class="mission-banner">
              <span class="mic">${m.icon}</span>
              <div class="grow">
                <div class="mt">지금 할 일</div>
                <h4>${m.title}</h4>
                <div class="mr">보상 ${FF.Progress.rewardText(m.reward)}${m.hint ? ' · <span class="muted">' + m.hint + '</span>' : ''}</div>
              </div>
              <button class="btn small" data-go="missions">전체 보기</button>
            </div>`;
  }

  /* ---------- 공장 전경 ---------- */
  function factoryView() {
    const S = FF.State.s;
    const rooms = FF.DATA.rooms.map(r => {
      const has = FF.State.hasRoom(r.id);
      const can = !has && FF.State.canPay(r.cost);
      return `<div class="room ${has ? 'built' : 'locked'} ${can ? 'buyable' : ''}">
                <span class="ric">${has ? r.icon : '🔒'}</span>
                <span class="rn">${r.name}</span>
                ${has
                  ? `<span class="re">${r.note}</span>`
                  : `<button class="btn small ${can ? 'primary' : ''}" data-build="${r.id}" style="margin-top:5px">${U.fmt(r.cost)}G</button>`}
              </div>`;
    }).join('');

    const decor = S.decor.length
      ? `<div class="decor-strip">${S.decor.map(id => {
          const d = FF.DATA.decor.find(x => x.id === id);
          return d ? `<span class="decor-item" title="${d.name} · ${d.note}">${d.icon}</span>` : '';
        }).join('')}</div>`
      : '';

    const hygColor = S.hygiene >= 70 ? 'green' : (S.hygiene >= 40 ? '' : 'bad');
    return `
      <div class="panel">
        <div class="panel-title">🏭 내 공장
          <span class="sub">${S.rooms.length} / ${FF.DATA.rooms.length} 시설</span>
        </div>
        <div class="factory-view">
          <span class="sky-deco" style="left:14px">☁️</span>
          <span class="sky-deco" style="right:20px;animation-delay:1.2s">☁️</span>
          <div class="rooms">${rooms}</div>
          ${decor}
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:150px">
            <div class="tiny" style="font-weight:800;display:flex;justify-content:space-between">
              <span>🧼 공장 위생</span><span>${S.hygiene}%</span></div>
            <div class="bar ${hygColor === 'green' ? 'green' : ''}"><i style="width:${S.hygiene}%"></i></div>
          </div>
          <button class="btn small" data-clean ${S.hygiene >= 100 ? 'disabled' : ''}>🧽 청소하기 (200G)</button>
        </div>
      </div>`;
  }

  /* ---------- 창고 ---------- */
  function stockPanel() {
    const S = FF.State.s;
    if (!S.stock.length) return '';
    const items = S.stock.map((it, i) => `
      <div class="stock-item">
        <span class="sic">${it.icon}</span>
        <div class="grow">
          <div class="sn">${it.name} <span class="badge ${it.grade === 'S' ? 'yellow' : it.grade === 'A' ? 'green' : 'gray'}">${it.grade}등급</span></div>
          <div class="tiny muted">총점 ${it.total}점</div>
        </div>
        <button class="btn small primary" data-sell="${i}">💰 ${U.fmt(it.price)}G 판매</button>
      </div>`).join('');
    return `<div class="panel">
              <div class="panel-title">📦 창고 <span class="sub">${S.stock.length}개 보관 중</span></div>
              <div class="grid" style="gap:8px">${items}</div>
            </div>`;
  }

  /* ---------- 장비 ---------- */
  function equipPanel() {
    const rows = Object.keys(FF.DATA.equipment).map(id => {
      const eq = FF.DATA.equipment[id];
      const lv = FF.State.equipLevel(id);
      const cur = eq.levels[lv - 1];
      const next = eq.levels[lv];
      const pips = eq.levels.map((_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('');
      return `<div class="eq-item">
                <span class="eic">${eq.icon}</span>
                <div class="grow">
                  <div class="en">${eq.name} <span class="lv-pips">${pips}</span></div>
                  <div class="ee">Lv.${lv} ${cur.name} — ${cur.note}</div>
                  ${next ? `<div class="tiny muted">다음: ${next.name} · ${next.note}</div>` : '<div class="tiny" style="color:#2f9b60;font-weight:800">최고 등급!</div>'}
                </div>
                ${next
                  ? `<button class="btn small ${FF.State.canPay(next.cost) ? 'primary' : ''}" data-up="${id}">${U.fmt(next.cost)}G</button>`
                  : '<span class="badge green">MAX</span>'}
              </div>`;
    }).join('');
    return `<div class="panel"><div class="panel-title">🔧 장비 업그레이드</div>${rows}</div>`;
  }

  /* ---------- 꾸미기 ---------- */
  function decorPanel() {
    const cards = FF.DATA.decor.map(d => {
      const has = FF.State.hasDecor(d.id);
      return `<div class="card pad-s center">
                <div style="font-size:32px">${d.icon}</div>
                <div style="font-weight:900;font-size:13.5px">${d.name}</div>
                <div class="tiny" style="color:#2f9b60;font-weight:800">${d.note}</div>
                ${has ? '<span class="badge green" style="margin-top:6px">보유 중</span>'
                      : `<button class="btn small ${FF.State.canPay(d.cost) ? 'primary' : ''} wide" data-decor="${d.id}" style="margin-top:6px">${U.fmt(d.cost)}G</button>`}
              </div>`;
    }).join('');
    return `<div class="panel">
              <div class="panel-title">🎨 공장 꾸미기 <span class="sub">작은 보너스도 함께!</span></div>
              <div class="grid auto">${cards}</div>
            </div>`;
  }

  /* ---------- 업적 ---------- */
  function achPanel() {
    const S = FF.State.s;
    const got = S.achievements.length;
    const items = FF.DATA.achievements.map(a => {
      const has = S.achievements.indexOf(a.id) >= 0;
      return `<div class="ach-item ${has ? '' : 'locked'}">
                <span class="ai">${has ? a.icon : '🔒'}</span>
                <div><div class="an">${has ? a.name : '???'}</div><div class="ad">${a.desc}</div></div>
              </div>`;
    }).join('');
    return `<div class="panel">
              <div class="panel-title">🏅 업적 <span class="sub">${got} / ${FF.DATA.achievements.length}</span></div>
              <div class="grid auto-lg">${items}</div>
            </div>`;
  }

  /* ---------- 렌더 ---------- */
  function render(root) {
    const S = FF.State.s;
    root.innerHTML = `
      ${missionBanner()}

      <div class="btn-row" style="margin-bottom:14px">
        <button class="btn primary big attn" data-go="cook" style="flex:2 1 220px">🍎 식품 만들기</button>
        <button class="btn big" data-go="market" style="flex:1 1 140px">🛒 재료 사기</button>
      </div>

      <div class="split">
        <div>
          ${factoryView()}
          ${stockPanel()}
        </div>
        <div>
          ${equipPanel()}
          ${decorPanel()}
        </div>
      </div>
      ${achPanel()}
      <p class="tiny muted center" style="margin:16px 0 6px">
        총 ${U.fmt(S.stats.made)}개 제작 · 누적 판매 ${U.fmt(S.stats.totalSold)}G · 최고 점수 ${S.stats.bestScore}점
      </p>`;

    /* 이벤트 연결 */
    U.on(root, 'click', '[data-build]', (e, t) => { FF.Economy.buildRoom(t.dataset.build, e); FF.UI.refresh(); });
    U.on(root, 'click', '[data-up]', (e, t) => { FF.Economy.upgradeEquipment(t.dataset.up, e); FF.UI.refresh(); });
    U.on(root, 'click', '[data-decor]', (e, t) => { FF.Economy.buyDecor(t.dataset.decor, e); FF.UI.refresh(); });
    U.on(root, 'click', '[data-sell]', (e, t) => { FF.Economy.sellStock(+t.dataset.sell, e); FF.UI.refresh(); });
    U.on(root, 'click', '[data-clean]', (e) => {
      if (!FF.State.canPay(200)) { FF.UI.toast('💰 돈이 부족합니다.', 'bad'); return; }
      FF.State.pay(200); FF.State.addHygiene(25);
      FF.Audio.play('pop');
      FF.UI.toast('🧽 공장이 반짝반짝해졌어요!', 'good');
      FF.UI.refresh();
    });
  }

  return { render };
})();

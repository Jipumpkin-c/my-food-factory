/* ============================================================
   menus.js — 연구 / 도감 / 미션 화면
   ============================================================ */

/* ============================================================
   🔬 연구
   ============================================================ */
FF.Screens.research = (function () {
  const U = FF.util;

  function card(id) {
    const r = FF.DATA.research[id];
    const st = FF.Progress.researchState(id);
    const unlockFood = r.unlock ? FF.DATA.foods[r.unlock] : null;

    /* 데이터가 비어 있어도 화면이 죽지 않도록 항상 존재 확인 후 추가 */
    const extras = [];
    const stg = r.unlockStorage && FF.DATA.storage[r.unlockStorage];
    const pk = r.unlockPackage && FF.DATA.packages[r.unlockPackage];
    const cx = r.codex && FF.DATA.codex[r.codex];
    if (unlockFood) extras.push(`${unlockFood.icon} ${unlockFood.name} 해금`);
    if (stg) extras.push(`${stg.icon} ${stg.name} 보관`);
    if (r.id === 'packaging') extras.push('📄🥤🫗 포장재 3종');
    if (pk) extras.push(`${pk.icon} ${pk.name}`);
    if (cx) extras.push(`📚 ${cx.name} 도감`);

    const reqTxt = (r.req || []).length
      ? '선행: ' + r.req.map(q => FF.DATA.research[q].name).join(', ')
      : '';

    let btn;
    if (st === 'owned') btn = '<span class="badge green">✅ 연구 완료</span>';
    else if (st === 'req') btn = `<button class="btn small wide" disabled>🔒 ${reqTxt}</button>`;
    else if (st === 'poor') btn = `<button class="btn small wide" data-res="${id}">🔬 ${r.cost} RP 필요</button>`;
    else btn = `<button class="btn small wide primary" data-res="${id}">🔬 ${r.cost} RP로 연구!</button>`;

    return `<div class="card res-card ${st === 'owned' ? 'owned' : ''} ${st === 'req' ? 'locked-req' : ''}">
              <span class="rc">${r.icon}</span>
              <div class="rn">${r.name}</div>
              <div class="rd">${r.desc}</div>
              ${extras.length ? `<div class="tiny" style="color:#6b4bc4;font-weight:800;margin-bottom:7px">${extras.join('<br>')}</div>` : ''}
              ${btn}
            </div>`;
  }

  function render(root) {
    const S = FF.State.s;
    root.innerHTML = `
      <div class="h-sec">🔬 연구실</div>
      <p class="sub-line">연구 포인트(RP)로 새로운 기술과 식품을 열 수 있어요. RP는 식품을 만들고 레벨이 오를 때 모입니다.</p>

      <div class="panel" style="text-align:center;background:linear-gradient(180deg,#f3ecff,#fff);border-color:#dccdfb">
        <div style="font-size:34px;font-weight:900;color:#6b4bc4">🔬 ${S.rp} RP</div>
        <div class="tiny muted">보유 연구 포인트</div>
      </div>

      <div class="grid auto">${FF.DATA.researchOrder.map(card).join('')}</div>

      <div class="tip" style="margin-top:14px"><span class="ic">💡</span>
        <span>총점 <b>60점 이상</b>으로 식품을 만들면 RP를 얻어요. 레벨이 오르면 +2 RP!</span></div>`;

    U.on(root, 'click', '[data-res]', (e, t) => {
      FF.Progress.buyResearch(t.dataset.res, e);
      FF.UI.refresh();
    });
  }

  return { render };
})();

/* ============================================================
   📚 식품공학 도감
   ============================================================ */
FF.Screens.codex = (function () {
  const U = FF.util;

  function render(root) {
    const S = FF.State.s;
    const n = FF.Progress.codexCount();
    const total = FF.DATA.codexOrder.length;

    const cards = FF.DATA.codexOrder.map(id => {
      const c = FF.DATA.codex[id];
      const open = !!S.codex[id];
      return `<div class="card codex-card ${open ? '' : 'locked'}" ${open ? `data-codex="${id}"` : ''}>
                <span class="cc">${open ? c.icon : '🔒'}</span>
                <span class="cn">${open ? c.name : '???'}</span>
                ${open ? '' : `<div class="tiny muted" style="margin-top:4px">${c.how}</div>`}
              </div>`;
    }).join('');

    root.innerHTML = `
      <div class="h-sec">📚 식품공학 도감</div>
      <p class="sub-line">게임에서 직접 경험한 개념이 하나씩 열려요. 카드를 눌러 다시 읽어 보세요.</p>

      <div class="panel">
        <div class="panel-title">진행도 <span class="sub">${n} / ${total}</span></div>
        <div class="bar tall green"><i style="width:${n / total * 100}%"></i></div>
      </div>

      <div class="grid auto">${cards}</div>`;

    U.on(root, 'click', '[data-codex]', (e, t) => {
      const c = FF.DATA.codex[t.dataset.codex];
      FF.Audio.play('click');
      FF.UI.modal({
        icon: c.icon, title: c.name,
        body: `<div class="concept-card"><div class="lines">${c.lines.map(l => `<p>${l}</p>`).join('')}</div></div>`,
        buttons: [{ label: '닫기', cls: 'primary' }]
      });
    });
  }

  return { render };
})();

/* ============================================================
   🎯 미션 & 업적
   ============================================================ */
FF.Screens.missions = (function () {
  const U = FF.util;

  function render(root) {
    const S = FF.State.s;
    const cur = S.missionIdx;

    const items = FF.DATA.missions.map((m, i) => {
      const done = i < cur;
      const isCur = i === cur;
      const locked = i > cur;
      return `<div class="mission-item ${done ? 'done' : ''}" ${locked ? 'style="opacity:.55"' : ''}>
                <span class="mi">${done ? '✅' : (locked ? '🔒' : m.icon)}</span>
                <div class="grow">
                  <div class="mn">${m.title}</div>
                  <div class="mrw">보상 ${FF.Progress.rewardText(m.reward)}</div>
                  ${isCur && m.hint ? `<div class="tiny muted">💡 ${m.hint}</div>` : ''}
                </div>
                ${isCur ? '<span class="badge">진행 중</span>' : ''}
              </div>`;
    }).join('');

    const achs = FF.DATA.achievements.map(a => {
      const has = S.achievements.indexOf(a.id) >= 0;
      return `<div class="ach-item ${has ? '' : 'locked'}">
                <span class="ai">${has ? a.icon : '🔒'}</span>
                <div><div class="an">${has ? a.name : '???'}</div><div class="ad">${a.desc}</div></div>
              </div>`;
    }).join('');

    root.innerHTML = `
      <div class="h-sec">🎯 미션</div>
      <p class="sub-line">미션을 따라가면 게임을 자연스럽게 익힐 수 있어요.</p>

      <div class="panel">
        <div class="panel-title">진행도 <span class="sub">${Math.min(cur, FF.DATA.missions.length)} / ${FF.DATA.missions.length}</span></div>
        <div class="bar tall"><i style="width:${Math.min(cur, FF.DATA.missions.length) / FF.DATA.missions.length * 100}%"></i></div>
      </div>

      <div class="panel">${items}</div>

      <div class="panel">
        <div class="panel-title">🏅 업적 <span class="sub">${S.achievements.length} / ${FF.DATA.achievements.length}</span></div>
        <div class="grid auto-lg">${achs}</div>
      </div>`;
  }

  return { render };
})();

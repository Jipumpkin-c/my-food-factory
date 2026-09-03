/* ============================================================
   ui.js — 공용 UI (상단바 / 하단메뉴 / 라우터 / 모달 / 토스트 / 이펙트)
   ============================================================ */
FF.Screens = FF.Screens || {};

FF.UI = (function () {

  const U = FF.util;
  const { $, el } = U;

  /* ============================================================
     화면 목록
     ============================================================ */
  const NAV = [
    { id: 'cook',     icon: '🍎', label: '식품 만들기' },
    { id: 'market',   icon: '🛒', label: '재료' },
    { id: 'factory',  icon: '🏭', label: '공장' },
    { id: 'research', icon: '🔬', label: '연구' },
    { id: 'codex',    icon: '📚', label: '도감' },
    { id: 'missions', icon: '🎯', label: '미션' }
  ];

  let current = 'factory';

  /* ============================================================
     토스트
     ============================================================ */
  function toast(msg, type) {
    const root = $('#toast-root');
    if (!root) return;
    const icons = { good: '✅', warn: '⚠️', bad: '❌' };
    const t = el('div', 'toast ' + (type || ''),
      `<span class="ic">${icons[type] || '💬'}</span><span>${msg}</span>`);
    root.appendChild(t);
    // 너무 쌓이지 않게
    while (root.children.length > 4) root.removeChild(root.firstChild);
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => t.remove(), 320);
    }, 2400);
  }

  /* ============================================================
     모달
     ============================================================ */
  function modal(opt) {
    return new Promise(resolve => {
      const root = $('#overlay-root');
      const ov = el('div', 'overlay');
      const dlg = el('div', 'dialog' + (opt.wide ? ' wide' : ''));

      let h = '';
      if (opt.title) {
        h += `<div class="dialog-head"><h3>${opt.icon ? opt.icon + ' ' : ''}${opt.title}</h3>` +
             (opt.sub ? `<div class="dsub">${opt.sub}</div>` : '') + `</div>`;
      }
      h += `<div class="dialog-body">${opt.body || ''}</div>`;
      const btns = opt.buttons || [{ label: '확인', cls: 'primary' }];
      h += `<div class="dialog-foot">` +
        btns.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('') +
        `</div>`;
      dlg.innerHTML = h;
      ov.appendChild(dlg);
      root.appendChild(ov);

      function close(v) {
        ov.classList.add('closing');
        setTimeout(() => { ov.remove(); resolve(v); }, 190);
      }

      dlg.querySelectorAll('.dialog-foot .btn').forEach(b => {
        b.addEventListener('click', () => {
          FF.Audio.play('click');
          const i = +b.dataset.i;
          const def = btns[i];
          close(def && def.value !== undefined ? def.value : i);
        });
      });

      if (opt.closable !== false) {
        ov.addEventListener('click', e => { if (e.target === ov) close(null); });
      }
      if (opt.onOpen) setTimeout(() => opt.onOpen(dlg), 20);
    });
  }

  /* ============================================================
     선임 연구원 대화 (타자기 효과 · 짧게)
     ============================================================ */
  function speech(lines, opt) {
    opt = opt || {};
    return new Promise(resolve => {
      const root = $('#overlay-root');
      const ov = el('div', 'overlay');
      const dlg = el('div', 'dialog');
      dlg.innerHTML =
        `<div class="dialog-body">
           <div class="speech">
             <div class="avatar">${opt.avatar || '🧑‍🔬'}</div>
             <div class="bubble">
               <div class="name">${opt.name || '선임 연구원 하늘'}</div>
               <div class="txt"></div>
             </div>
           </div>
         </div>
         <div class="dialog-foot">
           <button class="btn primary" data-next>▶ 다음</button>
         </div>`;
      ov.appendChild(dlg);
      root.appendChild(ov);

      const txt = dlg.querySelector('.txt');
      const btn = dlg.querySelector('[data-next]');
      let i = 0, timer = null, full = false;

      function type(line) {
        clearInterval(timer);
        txt.textContent = '';
        full = false;
        let k = 0;
        timer = setInterval(() => {
          txt.textContent = line.slice(0, ++k);
          if (k % 3 === 0) FF.Audio.play('tap');
          if (k >= line.length) { clearInterval(timer); full = true; }
        }, 22);
      }

      function step() {
        if (!full) { // 타자 중이면 즉시 완성
          clearInterval(timer); txt.textContent = lines[i]; full = true;
          btn.textContent = (i === lines.length - 1) ? (opt.last || '시작하기 ▶') : '▶ 다음';
          return;
        }
        i++;
        if (i >= lines.length) {
          ov.classList.add('closing');
          setTimeout(() => { ov.remove(); resolve(); }, 190);
          return;
        }
        type(lines[i]);
        btn.textContent = (i === lines.length - 1) ? (opt.last || '시작하기 ▶') : '▶ 다음';
      }

      btn.addEventListener('click', () => { FF.Audio.play('click'); step(); });
      type(lines[0]);
      btn.textContent = (lines.length === 1) ? (opt.last || '시작하기 ▶') : '▶ 다음';
    });
  }

  /* ============================================================
     개념 학습 카드 / 해금 연출 / 이벤트 카드
     ============================================================ */
  function conceptCard(c) {
    FF.Audio.play('unlock');
    return modal({
      icon: '✨', title: '새로운 개념을 배웠습니다!',
      closable: false,
      body: `<div class="concept-card">
               <div class="cic">${c.icon}</div>
               <h4>${c.name}</h4>
               <div class="lines">${c.lines.map(l => `<p>${l}</p>`).join('')}</div>
             </div>`,
      buttons: [{ label: '알겠어요!', cls: 'primary' }]
    });
  }

  function unlockBurst(o) {
    FF.Audio.play('unlock');
    return modal({
      closable: false,
      body: `<div class="unlock-burst">
               <div class="ring"></div>
               <div class="ic">${o.icon}</div>
               <div class="lbl">${o.label || 'UNLOCKED'}</div>
               <h4>${o.title}</h4>
               <p class="muted" style="font-weight:700">${o.desc || ''}</p>
             </div>`,
      buttons: [{ label: '확인!', cls: 'primary' }]
    });
  }

  function eventCard(ev) {
    FF.Audio.play('pop');
    return modal({
      icon: ev.icon, title: ev.title, closable: false,
      body: `<p style="font-weight:700;font-size:15px">${ev.text}</p>`,
      buttons: ev.options.map(o => ({
        label: `${o.label}<br><span style="font-size:11px;opacity:.8;font-weight:600">${o.sub || ''}</span>`,
        cls: ''
      }))
    }).then(i => (i == null ? 0 : i));
  }

  /* ============================================================
     이펙트
     ============================================================ */
  function fxFloat(evOrEl, text, cls) {
    const root = $('#fx-root');
    if (!root) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    try {
      if (evOrEl && evOrEl.clientX != null && evOrEl.clientX !== 0) {
        x = evOrEl.clientX; y = evOrEl.clientY;
      } else if (evOrEl && evOrEl.currentTarget && evOrEl.currentTarget.getBoundingClientRect) {
        const r = evOrEl.currentTarget.getBoundingClientRect();
        x = r.left + r.width / 2; y = r.top;
      } else if (evOrEl && evOrEl.getBoundingClientRect) {
        const r = evOrEl.getBoundingClientRect();
        x = r.left + r.width / 2; y = r.top;
      }
    } catch (e) { /* 기본 좌표 사용 */ }

    const n = el('div', 'fx-float ' + (cls || ''), text);
    n.style.left = x + 'px';
    n.style.top = y + 'px';
    n.style.transform = 'translate(-50%,-50%)';
    root.appendChild(n);
    setTimeout(() => n.remove(), 1200);
  }

  function confetti(count) {
    const root = $('#fx-root');
    if (!root) return;
    const colors = ['#ff8c42', '#ffc23c', '#4cc383', '#4fa3ef', '#ff7eb6', '#9b7bf0'];
    const n = count || 40;
    for (let i = 0; i < n; i++) {
      const p = el('div', 'fx-confetti');
      p.style.left = (window.innerWidth / 2 + U.rnd(-90, 90)) + 'px';
      p.style.top = (window.innerHeight * 0.32) + 'px';
      p.style.background = U.pick(colors);
      p.style.setProperty('--dx', U.rnd(-260, 260) + 'px');
      p.style.setProperty('--dy', U.rnd(180, 520) + 'px');
      p.style.setProperty('--rot', U.rnd(-720, 720) + 'deg');
      p.style.animationDelay = U.rnd(0, 0.25) + 's';
      root.appendChild(p);
      setTimeout(() => p.remove(), 1900);
    }
  }

  function bumpStat(name) {
    const n = $('#topbar .stat.' + name);
    if (!n) return;
    n.classList.remove('bump');
    void n.offsetWidth;
    n.classList.add('bump');
  }

  /* ============================================================
     상단바 / 하단 메뉴
     ============================================================ */
  function renderTop() {
    const S = FF.State.s;
    const info = FF.State.levelInfo();
    const L = FF.DATA.levels;
    const cur = L[S.level - 1], nxt = L[S.level];
    const from = cur ? cur.need : 0;
    const to = nxt ? nxt.need : from + 1;
    const pct = nxt ? U.clamp((S.exp - from) / Math.max(1, to - from) * 100, 0, 100) : 100;

    let comboHtml = '';
    if (S.combo >= 2) {
      comboHtml = `<span class="stat combo" title="연속 성공 보너스"><span class="ic">🔥</span>${S.combo}연속 +${Math.round((FF.State.comboMult() - 1) * 100)}%</span>`;
    }

    $('#topbar').innerHTML = `
      <div class="top-in">
        <span class="top-logo">🏭 <span class="txt">나만의 식품공장</span>
          <span class="lv">${info.icon} Lv.${S.level}</span></span>
        ${comboHtml}
        <span class="stat money"><span class="ic">💰</span>${U.fmt(S.money)}G</span>
        <span class="stat rp"><span class="ic">🔬</span>${S.rp}</span>
        <span class="stat eco"><span class="ic">🌱</span>${S.eco}</span>
        <span class="stat hyg"><span class="ic">🧼</span>${S.hygiene}</span>
        <span class="exp-wrap">
          <span class="lbl"><span>${info.title}</span><span>${nxt ? U.fmt(S.exp) + ' / ' + U.fmt(to) : 'MAX'}</span></span>
          <span class="bar blue"><i style="width:${pct}%"></i></span>
        </span>
      </div>`;
  }

  function renderNav() {
    const m = FF.Progress.currentMission();
    const nav = NAV.map(n => {
      const dot = (n.id === 'missions' && m) ? '<span class="dot"></span>' : '';
      return `<button class="nav-btn ${current === n.id ? 'active' : ''}" data-go="${n.id}">
                ${dot}<span class="ic">${n.icon}</span><span>${n.label}</span>
              </button>`;
    }).join('');
    $('#navbar').innerHTML = `<div class="nav-in">${nav}</div>`;
  }

  /* ============================================================
     라우터
     ============================================================ */
  function go(id, opts) {
    if (!FF.Screens[id]) { console.warn('[FF] 알 수 없는 화면: ' + id); return; }
    current = id;
    U.$$('.screen').forEach(s => s.classList.remove('active'));
    const root = $('#screen-' + id);
    if (!root) return;
    root.classList.add('active');
    U.safe(() => FF.Screens[id].render(root, opts || {}), 'render:' + id);
    renderTop();
    renderNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function refresh() {
    renderTop();
    renderNav();
    const root = $('#screen-' + current);
    if (root && FF.Screens[current] && FF.Screens[current].refresh !== false) {
      U.safe(() => FF.Screens[current].render(root, { keep: true }), 'refresh:' + current);
    }
  }

  function currentScreen() { return current; }

  return {
    NAV, toast, modal, speech, conceptCard, unlockBurst, eventCard,
    fxFloat, confetti, bumpStat,
    renderTop, renderNav, go, refresh, currentScreen
  };
})();

/* 상태가 바뀌면 상단바만 갱신 (화면 전체 리렌더는 하지 않음) */
FF.bus.on('state:changed', () => {
  if (document.getElementById('topbar') && !document.getElementById('game').hidden) {
    FF.util.safe(FF.UI.renderTop, 'renderTop');
  }
});

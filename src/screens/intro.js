/* ============================================================
   intro.js — 타이틀 화면 / 게임 설명 / 설정 / 튜토리얼
   ============================================================ */
FF.Intro = (function () {

  const U = FF.util;
  const { $ } = U;

  /* ---------- 타이틀 배경 장식 ---------- */
  function spawnFloats() {
    const box = $('.title-floats');
    if (!box) return;
    box.innerHTML = '';
    const icons = ['🍞', '🥛', '🍓', '🧀', '🍯', '🥣', '🧃', '🍨', '🌾', '🥚'];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.textContent = U.pick(icons);
      s.style.left = U.rnd(2, 95) + '%';
      s.style.animationDuration = U.rnd(11, 22) + 's';
      s.style.animationDelay = '-' + U.rnd(0, 20) + 's';
      s.style.fontSize = U.rnd(20, 40) + 'px';
      box.appendChild(s);
    }
  }

  /* ---------- 타이틀 표시 ---------- */
  function showTitle() {
    const t = $('#title-screen');
    t.hidden = false;
    t.classList.remove('leaving');
    $('#game').hidden = true;
    spawnFloats();
    $('#title-foot').textContent = FF.State.hasSave()
      ? '저장된 진행 상황이 있어요 · 이어서 할 수 있습니다'
      : '진행 상황은 브라우저에 자동 저장됩니다';
  }

  function hideTitle() {
    const t = $('#title-screen');
    t.classList.add('leaving');
    setTimeout(() => { t.hidden = true; }, 320);
    $('#game').hidden = false;
  }

  /* ---------- 게임 설명 ---------- */
  function howTo() {
    return FF.UI.modal({
      icon: '📖', title: '게임 설명', wide: true,
      body: `
        <div class="grid" style="gap:10px">
          <div class="note">작은 연구실에서 시작해 <b>나만의 식품공장</b>을 키우는 게임이에요.</div>
          <div class="card pad-s"><b>1. 🛒 재료 사기</b><br><span class="tiny muted">돈으로 밀가루·우유 같은 재료를 삽니다.</span></div>
          <div class="card pad-s"><b>2. 🍎 식품 만들기</b><br><span class="tiny muted">반죽·발효·가열 미니게임을 하며 식품을 완성해요.</span></div>
          <div class="card pad-s"><b>3. ⭐ 품질 평가 & 판매</b><br><span class="tiny muted">맛·영양·품질·보존성·환경 점수로 가격이 정해집니다.</span></div>
          <div class="card pad-s"><b>4. 🏭 성장하기</b><br><span class="tiny muted">번 돈으로 장비를 올리고 공장을 넓히세요.</span></div>
          <div class="card pad-s"><b>5. 🔬 연구하기</b><br><span class="tiny muted">연구 포인트로 발효·냉동 같은 기술과 새 식품을 해금해요.</span></div>
          <div class="tip"><span class="ic">💡</span><span>잘 모르겠으면 그냥 눌러 보세요. 실패해도 손해가 크지 않아요!</span></div>
        </div>`,
      buttons: [{ label: '알겠어요!', cls: 'primary' }]
    });
  }

  /* ---------- 설정 ---------- */
  function settings() {
    const S = FF.State.s;
    return FF.UI.modal({
      icon: '⚙️', title: '설정',
      body: `
        <div class="grid" style="gap:12px">
          <label class="card pad-s" style="display:flex;align-items:center;gap:10px;cursor:pointer">
            <input type="checkbox" data-sound ${S.settings.sound ? 'checked' : ''} style="width:20px;height:20px">
            <span><b>🔊 효과음</b><br><span class="tiny muted">버튼·완성·해금 소리를 켭니다</span></span>
          </label>
          <label class="card pad-s" style="display:flex;align-items:center;gap:10px;cursor:pointer">
            <input type="checkbox" data-hints ${S.settings.hints ? 'checked' : ''} style="width:20px;height:20px">
            <span><b>💡 도움말 힌트</b><br><span class="tiny muted">미니게임에서 정답 범위를 살짝 보여줍니다</span></span>
          </label>
          <button class="btn wide" data-reset style="border-color:#ffb4b4;color:#c33">🗑️ 저장 데이터 초기화</button>
        </div>`,
      buttons: [{ label: '닫기', cls: 'primary' }],
      onOpen(dlg) {
        dlg.querySelector('[data-sound]').addEventListener('change', e => {
          S.settings.sound = e.target.checked;
          FF.Audio.setEnabled(e.target.checked);
          FF.State.touch();
          if (e.target.checked) FF.Audio.play('good');
        });
        dlg.querySelector('[data-hints]').addEventListener('change', e => {
          S.settings.hints = e.target.checked;
          FF.State.touch();
        });
        dlg.querySelector('[data-reset]').addEventListener('click', () => {
          FF.UI.modal({
            icon: '⚠️', title: '정말 초기화할까요?',
            body: '<p>모든 진행 상황(돈·레벨·연구·도감)이 사라집니다.<br>이 작업은 되돌릴 수 없어요.</p>',
            buttons: [{ label: '취소', cls: 'ghost', value: 'no' }, { label: '초기화', cls: '', value: 'yes' }]
          }).then(v => {
            if (v === 'yes') {
              FF.State.wipe();
              FF.UI.toast('저장 데이터를 초기화했어요.', 'good');
              setTimeout(() => location.reload(), 700);
            }
          });
        });
      }
    });
  }

  /* ---------- 타이틀에서 여는 도감 ---------- */
  function codexPreview() {
    const S = FF.State.s;
    const cards = FF.DATA.codexOrder.map(id => {
      const c = FF.DATA.codex[id];
      const open = !!S.codex[id];
      return `<div class="codex-card ${open ? '' : 'locked'}">
                <span class="cc">${open ? c.icon : '🔒'}</span>
                <span class="cn">${open ? c.name : '???'}</span>
              </div>`;
    }).join('');
    const n = FF.DATA.codexOrder.filter(id => S.codex[id]).length;
    return FF.UI.modal({
      icon: '📚', title: '식품공학 도감', sub: `${n} / ${FF.DATA.codexOrder.length} 개 해금`, wide: true,
      body: `<div class="grid auto">${cards}</div>
             <p class="tiny muted center" style="margin-top:12px">게임에서 관련된 행동을 하면 하나씩 열려요!</p>`,
      buttons: [{ label: '닫기', cls: 'primary' }]
    });
  }

  /* ---------- 튜토리얼 ---------- */
  function startTutorial() {
    return FF.UI.speech([
      '어서 와! 여기가 네가 일할 식품 연구소야.',
      '식품은 온도·시간·비율에 따라 맛이 확 달라져.',
      '걱정 마. 직접 만들면서 배우면 돼!',
      '먼저 🍞 빵부터 만들어 보자!'
    ], { last: '튜토리얼 시작 ▶' }).then(() => {
      FF.State.s.tutorialDone = true;
      FF.State.touch();
      FF.UI.go('cook', { auto: 'bread', tutorial: true });
    });
  }

  /* ---------- 게임 진입 ---------- */
  function newGame() {
    FF.State.reset();
    FF.Economy.refreshMarket(true);
    hideTitle();
    FF.UI.go('factory');
    setTimeout(startTutorial, 380);
  }

  function continueGame() {
    FF.Economy.refreshMarket(false);
    hideTitle();
    FF.UI.go('factory');
    FF.UI.toast('👋 다시 오신 걸 환영해요!', 'good');
  }

  function pressStart() {
    FF.Audio.unlockContext();
    if (!FF.State.hasSave()) { newGame(); return; }
    FF.UI.modal({
      icon: '💾', title: '저장된 기록이 있어요',
      body: `<p>이어서 하시겠어요?<br><span class="tiny muted">새로 시작하면 지금 기록은 사라집니다.</span></p>`,
      buttons: [
        { label: '▶ 이어하기', cls: 'primary', value: 'cont' },
        { label: '🆕 새로 시작', cls: 'ghost', value: 'new' }
      ]
    }).then(v => {
      if (v === 'cont') { FF.State.load(); continueGame(); }
      else if (v === 'new') newGame();
    });
  }

  /* ---------- 버튼 연결 ---------- */
  function bind() {
    U.on($('#title-screen'), 'click', '[data-act]', (e, t) => {
      FF.Audio.unlockContext();
      FF.Audio.play('click');
      const a = t.dataset.act;
      if (a === 'start') pressStart();
      else if (a === 'how') howTo();
      else if (a === 'codex') codexPreview();
      else if (a === 'settings') settings();
    });
  }

  return { showTitle, hideTitle, bind, howTo, settings, codexPreview, startTutorial };
})();

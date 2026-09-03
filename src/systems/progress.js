/* ============================================================
   progress.js — 연구 / 도감 / 미션 / 업적 / 랜덤 이벤트 / 레벨업
   ============================================================ */
FF.Progress = (function () {

  const U = FF.util;

  /* ============================================================
     📚 도감
     ============================================================ */
  function codexCount() {
    const S = FF.State.s;
    return FF.DATA.codexOrder.filter(id => S.codex[id]).length;
  }

  /** 도감 해금. silent=false 면 "새로운 개념을 배웠습니다!" 카드를 띄운다(Promise). */
  function unlockCodex(id, silent) {
    const S = FF.State.s;
    const c = FF.DATA.codex[id];
    if (!c || S.codex[id]) return Promise.resolve(false);
    S.codex[id] = true;
    FF.State.touch();
    FF.Audio.play('unlock');
    notify('codex', { id });
    if (silent) {
      FF.UI.toast(`📚 도감 해금: ${c.icon} ${c.name}`, 'good');
      return Promise.resolve(true);
    }
    return FF.UI.conceptCard(c).then(() => true);
  }

  /* ============================================================
     🔬 연구
     ============================================================ */
  function researchState(id) {
    const r = FF.DATA.research[id];
    if (!r) return 'none';
    if (FF.State.hasResearch(id)) return 'owned';
    if (!(r.req || []).every(q => FF.State.hasResearch(q))) return 'req';
    if (FF.State.s.rp < r.cost) return 'poor';
    return 'buyable';
  }

  function buyResearch(id, ev) {
    const r = FF.DATA.research[id];
    if (!r) return false;
    const st = researchState(id);

    if (st === 'owned') { FF.UI.toast('이미 완료한 연구예요.', 'warn'); return false; }
    if (st === 'req') {
      const need = (r.req || []).filter(q => !FF.State.hasResearch(q))
        .map(q => FF.DATA.research[q].name).join(', ');
      FF.UI.toast(`🔒 «${need}» 연구가 먼저 필요해요.`, 'warn');
      return false;
    }
    if (st === 'poor') {
      FF.UI.toast(`🔬 연구 포인트가 부족해요. (${FF.State.s.rp}/${r.cost})`, 'bad');
      FF.Audio.play('bad');
      return false;
    }

    FF.State.addRP(-r.cost);
    FF.State.s.research.push(id);
    FF.State.touch();
    FF.Audio.play('unlock');
    FF.UI.fxFloat(ev, '-' + r.cost + ' RP', 'rp');

    const after = [];
    if (r.unlockStorage) { FF.State.unlockStorage(r.unlockStorage); }
    if (r.unlockPackage) { FF.State.unlockPackage(r.unlockPackage); }
    if (r.id === 'packaging') {
      ['paper', 'plastic', 'glass'].forEach(p => FF.State.unlockPackage(p));
    }

    const chain = () => {
      if (r.codex) return unlockCodex(r.codex);
      return Promise.resolve();
    };

    chain().then(() => {
      if (r.unlock && FF.State.unlockFood(r.unlock)) {
        const f = FF.DATA.foods[r.unlock];
        FF.UI.confetti();
        return FF.UI.unlockBurst({
          icon: f.icon, label: 'NEW FOOD', title: f.name + ' 해금!',
          desc: f.tagline + '<br><b>' + f.learn + '</b>'
        });
      }
    }).then(() => {
      FF.UI.toast(`🔬 «${r.name}» 연구 완료!`, 'good');
      notify('research', { id });
      FF.bus.emit('ui:refresh');
    });

    return true;
  }

  /* ============================================================
     🎯 미션
     ============================================================ */
  function currentMission() {
    const S = FF.State.s;
    return FF.DATA.missions[S.missionIdx] || null;
  }

  function testMission(m, evt, data) {
    const S = FF.State.s;
    const c = m.check;
    switch (c.type) {
      case 'make':        return evt === 'made' && data && data.foodId === c.food;
      case 'research':    return evt === 'research' && data && data.id === c.id;
      case 'packageMatch':return evt === 'made' && data && data.packMatch && data.pack !== 'none';
      case 'eco':         return evt === 'made' && data && data.cats.eco >= c.min;
      case 'score':       return evt === 'made' && data && data.total >= c.min;
      case 'room':        return evt === 'room';
      case 'codex':       return codexCount() >= c.count;
      case 'totalSold':   return S.stats.totalSold >= c.amount;
    }
    return false;
  }

  function rewardText(rw) {
    const p = [];
    if (rw.money) p.push('+' + U.fmt(rw.money) + 'G');
    if (rw.rp) p.push('+' + rw.rp + ' 연구 포인트');
    if (rw.unlockPackage) {
      const pk = FF.DATA.packages[rw.unlockPackage];
      if (pk) p.push(pk.icon + ' ' + pk.name);
    }
    if (rw.decor) {
      const d = FF.DATA.decor.find(x => x.id === rw.decor);
      if (d) p.push(d.icon + ' ' + d.name);
    }
    return p.join(' · ') || '축하 인사';
  }

  function giveReward(rw) {
    if (rw.money) FF.State.addMoney(rw.money);
    if (rw.rp) FF.State.addRP(rw.rp);
    if (rw.exp) FF.State.addExp(rw.exp);
    if (rw.unlockPackage) FF.State.unlockPackage(rw.unlockPackage);
    if (rw.decor && !FF.State.hasDecor(rw.decor)) {
      FF.State.s.decor.push(rw.decor);
      FF.State.touch();
    }
  }

  /** 게임 곳곳에서 호출 — 미션/업적 판정 */
  function notify(evt, data) {
    /* 제작 성과에 따른 연구 포인트 지급 */
    if (evt === 'made' && data) {
      const gain = (data.total >= 60 ? 1 : 0) + FF.State.bonus('rp') + (data.grade === 'S' ? 1 : 0);
      if (gain > 0) {
        FF.State.addRP(gain);
        FF.UI.toast(`🔬 연구 포인트 +${gain}`, 'good');
      }
    }

    let guard = 0;
    while (guard++ < 6) {
      const m = currentMission();
      if (!m || !testMission(m, evt, data)) break;

      FF.State.s.missionsDone.push(m.id);
      FF.State.s.missionIdx++;
      giveReward(m.reward);
      FF.State.touch();

      FF.Audio.play('success');
      FF.UI.confetti();
      FF.UI.toast(`🎯 미션 완료! ${rewardText(m.reward)}`, 'good');
      FF.bus.emit('mission:done', { mission: m });
      evt = 'chain'; data = null; // 연쇄 판정은 누적형(도감/판매)만 통과
    }
    checkAchievements();
    FF.bus.emit('ui:refresh');
  }

  /* ============================================================
     🏅 업적
     ============================================================ */
  function checkAchievements() {
    const S = FF.State.s;
    FF.DATA.achievements.forEach(a => {
      if (S.achievements.indexOf(a.id) >= 0) return;
      let ok = false;
      try { ok = a.test(S); } catch (e) { ok = false; }
      if (ok) {
        S.achievements.push(a.id);
        FF.State.touch();
        FF.Audio.play('star');
        FF.UI.toast(`🏅 업적 달성! ${a.icon} ${a.name}`, 'good');
      }
    });
  }

  /* ============================================================
     🎲 랜덤 이벤트
     ============================================================ */
  function applyEventEffect(eff) {
    if (!eff) return;
    if (eff.money) FF.State.addMoney(eff.money);
    if (eff.rp) FF.State.addRP(eff.rp);
    if (eff.exp) FF.State.addExp(eff.exp);
    if (eff.eco) FF.State.addEco(eff.eco);
    if (eff.hygiene) FF.State.addHygiene(eff.hygiene);
    if (eff.item) FF.State.addItem(eff.item.id, eff.item.qty);
    if (eff.buff) FF.State.addBuff(eff.buff.type, eff.buff.mult, eff.buff.turns);
    if (eff.randomItems) {
      const pool = Object.keys(FF.DATA.ingredients)
        .filter(id => !FF.DATA.ingredients[id].rare && FF.State.ingredientAvailable(id));
      for (let i = 0; i < eff.randomItems; i++) {
        if (pool.length) FF.State.addItem(U.pick(pool), U.rndInt(1, 2));
      }
    }
  }

  /** 제작 후 확률적으로 이벤트 발생 (Promise) */
  function maybeEvent() {
    const S = FF.State.s;
    if (S.stats.made < 2) return Promise.resolve(false);
    if (!U.chance(0.3)) return Promise.resolve(false);

    const ev = U.pick(FF.DATA.events);
    return FF.UI.eventCard(ev).then(idx => {
      const opt = ev.options[idx] || ev.options[0];
      applyEventEffect(opt.effect);
      FF.UI.toast(`${ev.icon} ${opt.msg}`, 'good');
      checkAchievements();
      FF.bus.emit('ui:refresh');
      return true;
    });
  }

  /* ============================================================
     ⭐ 레벨업
     ============================================================ */
  FF.bus.on('product:sold', d => {
    if (!d.levelsGained) return;
    FF.State.addRP(2 * d.levelsGained);
    FF.Audio.play('levelup');
    FF.UI.confetti(60);
    const info = FF.State.levelInfo();
    FF.UI.modal({
      icon: '🎉', title: '레벨 업!',
      body: `<div class="unlock-burst">
               <div class="ring"></div>
               <div class="ic">${info.icon}</div>
               <div class="lbl">LEVEL ${FF.State.s.level}</div>
               <h4>${info.title}</h4>
               <p class="muted">연구 포인트 +${2 * d.levelsGained} 획득!</p>
             </div>`,
      buttons: [{ label: '좋아요!', cls: 'primary' }]
    });
    checkAchievements();
  });

  /* 시설 건설 시 미션 판정 */
  FF.bus.on('room:built', () => notify('room'));

  return {
    unlockCodex, codexCount,
    researchState, buyResearch,
    currentMission, notify, rewardText,
    checkAchievements, maybeEvent
  };
})();

/* ============================================================
   knead.js — 타이밍 게이지 미니게임
   반죽 / 착즙 / 커드 자르기 / 교반에 공통으로 쓰인다.
   cfg: { rounds, sweep, zone, ease, verb, icon }
   ============================================================ */
FF.Minigames = FF.Minigames || {};

FF.Minigames.knead = function (box, cfg) {
  const U = FF.util;
  return new Promise(resolve => {

    const rounds = cfg.rounds || 3;
    const sweep = cfg.sweep || 2000;                       // 한 번 왕복하는 시간(ms)
    const ease = U.clamp(cfg.ease || 0, 0, 0.6);
    const zoneW = U.clamp((cfg.zone || 24) * (1 + ease), 8, 62);  // 초록 칸 너비(%)
    const verb = cfg.verb || '치대기';

    let round = 0, scores = [], zoneCenter = 50, running = true, raf = null, t0 = 0;

    /** 정리 후 결과 반환 */
    function finish(result) {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      resolve(result);
    }
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); hit(); }
    }

    box.innerHTML = `
      <div class="mini">
        <div class="round-pips">${Array.from({ length: rounds }, () => '<i></i>').join('')}</div>
        <div class="gauge">
          <div class="gauge-zone"></div>
          <div class="gauge-zone perfect"></div>
          <div class="gauge-marker"></div>
        </div>
        <div class="mini-hint">초록 칸에서 <b>스페이스</b> 또는 아래 버튼을 누르세요!</div>
        <button class="btn primary big wide" data-hit style="max-width:340px">${cfg.icon || '🤲'} ${verb}!</button>
      </div>`;

    const gauge = box.querySelector('.gauge');
    const zone = box.querySelector('.gauge-zone');
    const perfect = box.querySelector('.gauge-zone.perfect');
    const marker = box.querySelector('.gauge-marker');
    const hint = box.querySelector('.mini-hint');
    const btn = box.querySelector('[data-hit]');
    const pips = Array.from(box.querySelectorAll('.round-pips i'));

    function placeZone() {
      zoneCenter = U.rnd(zoneW / 2 + 6, 100 - zoneW / 2 - 6);
      zone.style.left = (zoneCenter - zoneW / 2) + '%';
      zone.style.width = zoneW + '%';
      const pw = zoneW * 0.34;
      perfect.style.left = (zoneCenter - pw / 2) + '%';
      perfect.style.width = pw + '%';
    }

    function markerPos() {
      const el2 = (performance.now() - t0) / sweep;
      return Math.abs((el2 % 2) - 1) * 100;   // 0~100 삼각파
    }

    function loop() {
      if (!running) return;
      const p = markerPos();
      marker.style.left = 'calc(' + p + '% - 3.5px)';
      raf = requestAnimationFrame(loop);
    }

    function hit() {
      if (!running) return;
      const p = markerPos();
      const d = Math.abs(p - zoneCenter);
      const half = zoneW / 2;

      let sc, msg, cls;
      if (d <= half * 0.34) { sc = 100; msg = '✨ 완벽해요!'; cls = 'hit'; }
      else if (d <= half)   { sc = 84;  msg = '👍 좋아요!';   cls = 'hit'; }
      else if (d <= half + 12) { sc = 52; msg = '😅 아슬아슬!'; cls = 'miss'; }
      else { sc = 26; msg = '💦 조금 빗나갔어요'; cls = 'miss'; }

      FF.Audio.play(sc >= 84 ? 'good' : 'bad');
      scores.push(sc);
      if (pips[round]) pips[round].className = cls;
      hint.innerHTML = `<b>${msg}</b>`;
      gauge.style.transform = 'scale(1.03)';
      setTimeout(() => { gauge.style.transform = ''; }, 130);

      round++;
      if (round >= rounds) {
        running = false;
        cancelAnimationFrame(raf);
        btn.disabled = true;
        const total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        setTimeout(() => finish({
          score: total,
          msg: total >= 90 ? '아주 매끈하게 됐어요!' : total >= 65 ? '잘 됐어요!' : '조금 아쉬웠어요.'
        }), 520);
      } else {
        placeZone();
      }
    }

    btn.addEventListener('click', hit);
    window.addEventListener('keydown', onKey);

    placeZone();
    t0 = performance.now();
    loop();
  });
};

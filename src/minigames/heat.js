/* ============================================================
   heat.js — 가열 미니게임 (버튼을 꾹 눌러 온도 유지)
   cfg: { tempRange:[a,b], target:[lo,hi], hold, rise, fall, burn, ease }
   ============================================================ */
FF.Minigames = FF.Minigames || {};

FF.Minigames.heat = function (box, cfg) {
  const U = FF.util;
  return new Promise(resolve => {

    const range = cfg.tempRange || [0, 100];
    const ease = U.clamp(cfg.ease || 0, 0, 0.6);
    let lo = cfg.target[0], hi = cfg.target[1];
    const mid = (lo + hi) / 2, half = (hi - lo) / 2 * (1 + ease);
    lo = U.clamp(mid - half, 2, 96);
    hi = U.clamp(mid + half, 4, 98);

    const holdNeed = cfg.hold || 2600;
    const rise = cfg.rise || 28;      // 초당 상승
    const fall = cfg.fall || 17;      // 초당 하강
    const burn = cfg.burn || 95;
    const LIMIT = 20000;              // 최대 20초

    let temp = 0, heating = false, running = true;
    let inTime = 0, outTime = 0, burnTime = 0, elapsed = 0;
    let last = performance.now(), raf = null;

    const toC = v => Math.round(range[0] + v / 100 * (range[1] - range[0]));

    box.innerHTML = `
      <div class="mini">
        <div class="thermo-wrap">
          <div class="thermo">
            <div class="fill"></div>
            <div class="target"></div>
            <div class="needle"></div>
          </div>
          <div class="heat-info">
            <div class="lbl">현재 온도</div>
            <div class="big-t"><span data-temp>0</span>°C</div>
            <div class="lbl" style="margin-top:8px">목표 범위</div>
            <div style="font-weight:900;color:#2f9b60">${toC(lo)}°C ~ ${toC(hi)}°C</div>
            <div class="lbl" style="margin-top:8px">진행</div>
            <div class="bar green" style="width:120px"><i data-prog style="width:0%"></i></div>
          </div>
        </div>
        <div class="heat-msg low" data-msg>버튼을 꾹 눌러 데워 보세요</div>
        <button class="heat-btn" data-heat>🔥 꾹 눌러서 가열</button>
        <div class="mini-hint">누르면 온도가 <b>오르고</b>, 떼면 <b>내려가요</b>. 초록 구간을 유지하세요!</div>
      </div>`;

    const fill = box.querySelector('.fill');
    const tgt = box.querySelector('.target');
    const needle = box.querySelector('.needle');
    const tempEl = box.querySelector('[data-temp]');
    const progEl = box.querySelector('[data-prog]');
    const msgEl = box.querySelector('[data-msg]');
    const btn = box.querySelector('[data-heat]');
    const pot = box.parentElement ? box.parentElement.querySelector('.pot') : null;

    tgt.style.bottom = lo + '%';
    tgt.style.height = (hi - lo) + '%';

    function finish(result) {
      running = false;
      cancelAnimationFrame(raf);
      detach();
      resolve(result);
    }

    function down(e) { if (e) e.preventDefault(); heating = true; btn.classList.add('on'); FF.Audio.play('sizzle'); if (pot) pot.classList.add('heat'); }
    function up() { heating = false; btn.classList.remove('on'); if (pot) pot.classList.remove('heat'); }

    function onKeyDown(e) { if (e.code === 'Space') { e.preventDefault(); if (!heating) down(); } }
    function onKeyUp(e) { if (e.code === 'Space') { e.preventDefault(); up(); } }

    btn.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    function detach() {
      btn.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (pot) pot.classList.remove('heat');
    }

    function loop(now) {
      if (!running) return;
      const dt = Math.min(80, now - last); last = now;
      elapsed += dt;

      temp += (heating ? rise : -fall) * dt / 1000;
      temp = U.clamp(temp, 0, 100);

      if (temp >= lo && temp <= hi) {
        inTime += dt;
        msgEl.textContent = '좋아요! 적절한 조건입니다.';
        msgEl.className = 'heat-msg good';
      } else if (temp > hi) {
        outTime += dt;
        if (temp >= burn) burnTime += dt;
        msgEl.textContent = temp >= burn ? '🔥 온도가 너무 높아요!' : '조금 뜨거워요. 잠깐 떼 볼까요?';
        msgEl.className = 'heat-msg high';
      } else {
        outTime += dt;
        msgEl.textContent = '아직 충분하지 않아요.';
        msgEl.className = 'heat-msg low';
      }

      fill.style.height = temp + '%';
      needle.style.bottom = 'calc(' + temp + '% - 2px)';
      tempEl.textContent = toC(temp);
      progEl.style.width = U.clamp(inTime / holdNeed * 100, 0, 100) + '%';

      if (inTime >= holdNeed) {
        const score = U.clamp(Math.round(100 - outTime * 0.011 - burnTime * 0.05), 30, 100);
        FF.Audio.play(score >= 80 ? 'good' : 'bad');
        msgEl.textContent = score >= 80 ? '✨ 완벽하게 익었어요!' : '완성! 조금 아쉬웠어요.';
        msgEl.className = 'heat-msg good';
        setTimeout(() => finish({ score, msg: msgEl.textContent, overheat: burnTime > 500 }), 560);
        running = false;
        return;
      }
      if (elapsed > LIMIT) {
        const score = U.clamp(Math.round(28 + 46 * (inTime / holdNeed)), 20, 74);
        setTimeout(() => finish({ score, msg: '시간이 다 됐어요!', overheat: burnTime > 500 }), 320);
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    last = performance.now();
    raf = requestAnimationFrame(loop);
  });
};

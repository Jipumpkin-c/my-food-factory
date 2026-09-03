/* ============================================================
   dial.js — 슬라이더로 값 맞추기 (발효 온도 / 배합 비율 / 당도)
   cfg: { valueRange:[a,b], unit, target:[lo,hi], labels, ease, tip, overPenalty }
   ============================================================ */
FF.Minigames = FF.Minigames || {};

FF.Minigames.dial = function (box, cfg) {
  const U = FF.util;
  return new Promise(resolve => {

    const range = cfg.valueRange || [0, 100];
    const unit = cfg.unit || '';
    const ease = U.clamp(cfg.ease || 0, 0, 0.6);
    const labels = cfg.labels || ['낮음', '알맞음', '높음'];

    const rawLo = cfg.target[0], rawHi = cfg.target[1];
    const mid = (rawLo + rawHi) / 2, half = (rawHi - rawLo) / 2 * (1 + ease);
    const lo = U.clamp(mid - half, 2, 96);
    const hi = U.clamp(mid + half, 4, 98);

    const showHint = FF.State.s.settings.hints;
    const toVal = v => {
      const r = range[0] + v / 100 * (range[1] - range[0]);
      return (range[1] - range[0]) <= 25 ? Math.round(r * 10) / 10 : Math.round(r);
    };

    box.innerHTML = `
      <div class="mini">
        ${cfg.tip ? `<div class="tip"><span class="ic">💡</span><span><b>TIP</b> ${cfg.tip}</span></div>` : ''}
        <div class="dial-wrap">
          <div class="dial-scale">
            ${showHint ? `<div class="band hintband" style="left:${lo}%;width:${hi - lo}%"></div>` : ''}
          </div>
          <input type="range" class="slider" min="0" max="100" step="1" value="50" data-dial>
          <div class="dial-labels"><span>${labels[0]}</span><span>${labels[1]}</span><span>${labels[2]}</span></div>
          <div class="dial-readout"><span data-val>${toVal(50)}</span>${unit}</div>
        </div>
        <div class="mini-hint" data-fb>${showHint ? '초록 구간에 맞춰 보세요!' : '알맞다고 생각하는 값에 맞춰 보세요.'}</div>
        <button class="btn primary big wide" data-ok style="max-width:340px">✅ 이걸로 결정!</button>
      </div>`;

    const slider = box.querySelector('[data-dial]');
    const valEl = box.querySelector('[data-val]');
    const fb = box.querySelector('[data-fb]');
    const okBtn = box.querySelector('[data-ok]');

    slider.addEventListener('input', () => {
      const v = +slider.value;
      valEl.textContent = toVal(v);
      if (showHint) {
        fb.innerHTML = (v >= lo && v <= hi)
          ? '<b style="color:#2f9b60">👍 좋은 범위예요!</b>'
          : (v < lo ? '조금 낮아요…' : '조금 높아요…');
      }
    });
    slider.addEventListener('change', () => FF.Audio.play('tap'));

    okBtn.addEventListener('click', () => {
      const v = +slider.value;
      const c = (lo + hi) / 2, h = (hi - lo) / 2;
      let score, msg;

      if (v >= lo && v <= hi) {
        const acc = 1 - Math.abs(v - c) / Math.max(1, h);
        score = Math.round(86 + 14 * acc);
        msg = score >= 96 ? '✨ 딱 알맞아요!' : '👍 좋은 선택이에요!';
      } else {
        const d = v < lo ? lo - v : v - hi;
        score = U.clamp(Math.round(84 - d * 2.3), 15, 84);
        msg = v < lo ? '조금 낮았어요.' : '조금 높았어요.';
      }

      FF.Audio.play(score >= 86 ? 'good' : 'bad');
      fb.innerHTML = `<b>${msg}</b> (${toVal(v)}${unit})`;
      okBtn.disabled = true;
      slider.disabled = true;

      const out = { score, msg, value: v, display: toVal(v) + unit };
      if (cfg.overPenalty && v > hi + 10) {
        out.penalty = { key: cfg.overPenalty.key, amount: cfg.overPenalty.amount };
        out.msg += ' 온도가 높아 영양소가 조금 손상됐어요.';
      }
      setTimeout(() => resolve(out), 620);
    });
  });
};

/* ============================================================
   choice.js — 보기 중에서 고르기 (발효 시간 / 숙성 / 냉각 등)
   cfg: { options:[{icon,label,sub,score,feedback}], tip, columns }
   ============================================================ */
FF.Minigames = FF.Minigames || {};

FF.Minigames.choice = function (box, cfg) {
  return new Promise(resolve => {
    const opts = cfg.options || [];

    box.innerHTML = `
      <div class="mini">
        ${cfg.tip ? `<div class="tip"><span class="ic">💡</span><span><b>TIP</b> ${cfg.tip}</span></div>` : ''}
        <div class="choice-grid ${cfg.columns === 2 ? 'c2' : ''}">
          ${opts.map((o, i) => `
            <button class="choice-btn" data-i="${i}">
              <span class="cic">${o.icon || '▫️'}</span>
              <span><span>${o.label}</span><span class="cs">${o.sub || ''}</span></span>
            </button>`).join('')}
        </div>
        <div class="mini-hint" data-fb>마음에 드는 것을 골라 보세요.</div>
      </div>`;

    const fb = box.querySelector('[data-fb]');
    const btns = Array.from(box.querySelectorAll('.choice-btn'));

    btns.forEach(b => b.addEventListener('click', () => {
      const o = opts[+b.dataset.i];
      btns.forEach(x => { x.disabled = true; });
      b.classList.add('picked');
      FF.Audio.play(o.score >= 80 ? 'good' : 'bad');
      fb.innerHTML = `<b>${o.feedback || ''}</b>`;
      setTimeout(() => resolve({
        score: o.score,
        msg: o.feedback || '',
        value: o.label
      }), 780);
    }));
  });
};

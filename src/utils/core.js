/* ============================================================
   core.js — 전역 네임스페이스 / DOM 헬퍼 / 수학·랜덤 / 이벤트 버스
   ============================================================ */
window.FF = window.FF || {};
FF.DATA = FF.DATA || {};

/* ---------- 유틸 ---------- */
FF.util = (function () {

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** 엘리먼트 생성: el('div', 'card big', '<b>hi</b>') */
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /** 이벤트 위임: on(root, 'click', '[data-act]', fn) */
  function on(root, type, sel, fn) {
    root.addEventListener(type, e => {
      const t = e.target.closest(sel);
      if (t && root.contains(t)) fn(e, t);
    });
  }

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rndInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const chance = p => Math.random() < p;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /** 1234567 -> "1,234,567" */
  const fmt = n => Math.round(n || 0).toLocaleString('ko-KR');

  /** 0~5 값 -> ⭐☆ 문자열 HTML */
  function stars(v, animate) {
    const n = clamp(Math.round(v), 0, 5);
    let h = `<span class="stars${animate ? ' anim' : ''}">`;
    for (let i = 0; i < 5; i++) {
      h += `<i class="${i < n ? 'on' : ''}" style="animation-delay:${i * 70}ms">${i < n ? '⭐' : '☆'}</i>`;
    }
    return h + '</span>';
  }

  /** 점수(0~100) -> 별 개수(1~5) */
  const scoreToStar = s => clamp(Math.round(s / 20), 1, 5);

  /** 얕은 병합(기본값 채우기) */
  function defaults(target, def) {
    const out = Object.assign({}, def, target || {});
    for (const k in def) {
      if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k])) {
        out[k] = defaults((target || {})[k], def[k]);
      }
    }
    return out;
  }

  /** 안전 실행 — 한 곳이 터져도 게임 전체가 멈추지 않게 */
  function safe(fn, label) {
    try { return fn(); }
    catch (err) {
      console.error('[FF] ' + (label || 'error'), err);
      if (FF.UI && FF.UI.toast) FF.UI.toast('문제가 생겼어요. 계속 진행할 수 있습니다.', 'warn');
      return null;
    }
  }

  return { $, $$, el, on, clamp, rnd, rndInt, pick, chance, sleep, fmt, stars, scoreToStar, defaults, safe };
})();

/* ---------- 이벤트 버스 ---------- */
FF.bus = (function () {
  const map = {};
  return {
    on(ev, fn) { (map[ev] = map[ev] || []).push(fn); return fn; },
    off(ev, fn) { if (map[ev]) map[ev] = map[ev].filter(f => f !== fn); },
    emit(ev, data) {
      (map[ev] || []).forEach(fn => {
        try { fn(data); } catch (e) { console.error('[FF] bus:' + ev, e); }
      });
    }
  };
})();

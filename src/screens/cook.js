/* ============================================================
   cook.js — 식품 제작 화면 (선택 → 레시피 → 제작 → 결과)
   ============================================================ */
FF.Screens.cook = (function () {

  const U = FF.util;

  let rootEl = null;
  let mode = 'list';        // list | recipe | run | result
  let foodId = null;
  let subs = {};            // { 기본재료id: 희귀재료id }
  let batch = null;
  let steps = [];
  let stepIdx = 0;
  let product = null;
  let tutorial = false;

  /* ============================================================
     1. 식품 선택
     ============================================================ */
  function renderList() {
    const cards = FF.DATA.foodOrder.map(id => {
      const f = FF.DATA.foods[id];
      const open = FF.State.foodUnlocked(id);
      const best = FF.State.s.stats.byFood[id] || 0;
      const have = FF.State.hasRecipe(f.recipe);
      if (!open) {
        const r = f.need ? FF.DATA.research[f.need] : null;
        return `<div class="card food-card locked">
                  <span class="fic">❔</span>
                  <div class="fnm">???</div>
                  <div class="fpr">${r ? '«' + r.name + '» 연구 필요' : '잠김'}</div>
                  <div class="lockmark">🔒</div>
                </div>`;
      }
      return `<div class="card food-card" data-pick="${id}">
                ${best ? `<span class="badge gray best">${best}회</span>` : ''}
                <span class="fic">${f.icon}</span>
                <div class="fnm">${f.name}</div>
                <div class="fpr">기본 ${U.fmt(f.basePrice)}G</div>
                <div class="tiny ${have ? '' : 'muted'}" style="margin-top:5px;font-weight:800;color:${have ? '#2f9b60' : ''}">
                  ${have ? '✅ 재료 있음' : '🧺 재료 부족'}
                </div>
              </div>`;
    }).join('');

    rootEl.innerHTML = `
      <div class="h-sec">🍎 무엇을 만들까요?</div>
      <p class="sub-line">만들고 싶은 식품을 눌러 보세요. 잠긴 식품은 🔬 연구로 열 수 있어요.</p>
      <div class="grid auto">${cards}</div>
      <div class="btn-row" style="margin-top:16px">
        <button class="btn" data-go="market">🛒 재료 사러 가기</button>
        <button class="btn" data-go="research">🔬 새 식품 연구하기</button>
      </div>`;

    U.on(rootEl, 'click', '[data-pick]', (e, t) => {
      FF.Audio.play('click');
      foodId = t.dataset.pick; subs = {}; mode = 'recipe'; show();
    });
  }

  /* ============================================================
     2. 레시피 확인
     ============================================================ */
  function renderRecipe() {
    const f = FF.DATA.foods[foodId];
    const S = FF.State.s;

    const rows = f.recipe.map(r => {
      const useId = subs[r.id] || r.id;
      const ing = FF.DATA.ingredients[useId];
      const own = FF.State.itemCount(useId);
      const ok = own >= r.qty;

      // 이 재료를 대체할 수 있는 보유 희귀 재료
      const rareOpt = FF.DATA.rareIngredients.find(rid =>
        FF.DATA.ingredients[rid].replaces === r.id && FF.State.itemCount(rid) >= r.qty);

      let swap = '';
      if (rareOpt) {
        const ri = FF.DATA.ingredients[rareOpt];
        const on = subs[r.id] === rareOpt;
        swap = `<button class="btn small ${on ? 'purple' : 'ghost'}" data-swap="${r.id}" data-rare="${rareOpt}">
                  ${on ? '✨ 사용 중' : ri.icon + ' 사용'}
                </button>`;
      }

      return `<div class="recipe-row ${ok ? 'ok' : 'lack'}">
                <span class="ric">${ing.icon}</span>
                <div class="grow">
                  <div style="font-weight:800">${ing.name} ${ing.rare ? '<span class="badge rare">희귀</span>' : ''}</div>
                  <div class="tiny muted">보유 ${own}개</div>
                </div>
                ${swap}
                <span class="rq">${ok ? '✅' : '❌'} ${r.qty}개</span>
              </div>`;
    }).join('');

    const can = FF.State.hasRecipe(f.recipe, subs);
    const need = f.recipe.filter(r => FF.State.itemCount(subs[r.id] || r.id) < r.qty);
    const buyCost = need.reduce((s, r) => {
      const id = subs[r.id] || r.id;
      return s + FF.DATA.ingredients[id].price * (r.qty - FF.State.itemCount(id));
    }, 0);

    const ig = FF.Quality.ingredientScore(f.recipe, subs);

    rootEl.innerHTML = `
      <div class="btn-row" style="margin-bottom:12px">
        <button class="btn small ghost" data-back>← 다른 식품 고르기</button>
      </div>

      <div class="panel">
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
          <div style="font-size:56px" class="anim-bob">${f.icon}</div>
          <div class="grow" style="flex:1;min-width:150px">
            <h3 style="font-size:22px">${f.name}</h3>
            <p class="tiny muted">${f.tagline}</p>
            <div class="chip-row" style="margin-top:6px">
              <span class="chip">💰 기본 ${U.fmt(f.basePrice)}G</span>
              <span class="chip">📊 난이도 ${'★'.repeat(f.difficulty)}${'☆'.repeat(4 - f.difficulty)}</span>
              <span class="chip">🧪 재료 품질 ${ig.quality}점</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">🧺 필요한 재료</div>
        ${rows}
        ${!can ? `<div class="tip" style="margin-top:12px"><span class="ic">🛒</span>
            <span>재료가 부족해요. 상점에서 약 <b>${U.fmt(buyCost)}G</b>어치를 사면 만들 수 있어요.</span></div>` : ''}
      </div>

      <div class="panel">
        <div class="panel-title">🧭 제작 순서</div>
        <div class="chip-row">
          <span class="chip">🧺 재료 넣기</span>
          ${f.steps.map(s => `<span class="chip">${s.icon} ${s.title}</span>`).join('')}
          <span class="chip">🧊 보관</span>
          ${FF.State.hasResearch('packaging') ? '<span class="chip">📦 포장</span>' : ''}
          <span class="chip">⭐ 품질 평가</span>
        </div>
      </div>

      <div class="btn-row" style="margin-top:6px">
        ${can
          ? '<button class="btn primary big wide attn" data-start>🍳 제작 시작!</button>'
          : '<button class="btn big wide" data-go="market">🛒 재료 사러 가기</button>'}
      </div>`;

    U.on(rootEl, 'click', '[data-back]', () => { FF.Audio.play('click'); mode = 'list'; tutorial = false; show(); });
    U.on(rootEl, 'click', '[data-swap]', (e, t) => {
      const base = t.dataset.swap, rare = t.dataset.rare;
      if (subs[base] === rare) delete subs[base]; else subs[base] = rare;
      FF.Audio.play('pop');
      show();
    });
    U.on(rootEl, 'click', '[data-start]', () => { FF.Audio.play('click'); startRun(); });
  }

  /* ============================================================
     3. 제작 진행
     ============================================================ */
  function buildSteps(f) {
    const list = f.steps.slice();
    list.push({
      type: 'storage', key: 'storage', icon: '🧊', title: '보관 방법 선택',
      desc: '완성된 식품을 어떻게 보관할까요?', vessel: f.icon, concept: 'preserve'
    });
    if (FF.State.hasResearch('packaging')) {
      list.push({
        type: 'pack', key: 'pack', icon: '📦', title: '포장하기',
        desc: '어떤 포장재에 담을까요?', vessel: f.icon
      });
    }
    return list;
  }

  function startRun() {
    const f = FF.DATA.foods[foodId];
    if (!FF.State.consume(f.recipe, subs)) {
      FF.UI.toast('🧺 재료가 부족해요.', 'warn');
      return;
    }
    const ig = FF.Quality.ingredientScore(f.recipe, subs);
    batch = {
      foodId, results: [], ingQuality: ig.quality, ingFresh: ig.fresh,
      usedRare: ig.rare, storage: 'room', pack: 'none',
      overheat: 0, penalties: {}
    };
    steps = buildSteps(f);
    stepIdx = 0;
    mode = 'run';
    show();
    nextStep();
  }

  function stepBarHtml() {
    const f = FF.DATA.foods[foodId];
    const all = [{ icon: '🧺', title: '재료' }].concat(steps);
    return all.map((s, i) => {
      const idx = i - 1;
      const cls = idx < stepIdx ? 'done' : (idx === stepIdx ? 'cur' : '');
      return `<span class="step-dot ${i === 0 ? 'done' : cls}">${s.icon} ${s.title}</span>`;
    }).join('') + `<span class="step-dot ${stepIdx >= steps.length ? 'cur' : ''}">⭐ 평가</span>`;
  }

  function renderRun() {
    const f = FF.DATA.foods[foodId];
    rootEl.innerHTML = `
      <div class="step-bar">${stepBarHtml()}</div>
      <div class="stage">
        <div class="stage-head">
          <h3 id="stg-title">${f.icon} ${f.name} 만드는 중…</h3>
          <p id="stg-desc">재료를 넣고 있어요</p>
        </div>
        <div class="pot" id="stg-pot"><span class="vessel">${f.icon}</span>
          <span class="steam">💨</span><span class="steam">💨</span><span class="steam">💨</span></div>
        <div id="stg-box"></div>
      </div>`;
  }

  /** 재료가 그릇으로 떨어지는 연출 */
  function ingredientDrop() {
    const f = FF.DATA.foods[foodId];
    const pot = document.getElementById('stg-pot');
    if (!pot) return Promise.resolve();
    pot.classList.add('stir');
    const list = f.recipe.map(r => FF.DATA.ingredients[subs[r.id] || r.id]);
    list.forEach((ing, i) => {
      setTimeout(() => {
        if (!document.getElementById('stg-pot')) return;
        const s = U.el('span', 'drop-ing', ing.icon);
        s.style.left = (30 + i * 26) + 'px';
        pot.appendChild(s);
        FF.Audio.play('pop');
        setTimeout(() => s.remove(), 700);
      }, i * 260);
    });
    return U.sleep(list.length * 260 + 380).then(() => {
      const p = document.getElementById('stg-pot');
      if (p) p.classList.remove('stir');
    });
  }

  /* ---------- 보관 / 포장 선택 단계 ---------- */
  function storageStep(box) {
    const f = FF.DATA.foods[foodId];
    const ids = Object.keys(FF.DATA.storage).filter(id => {
      const st = FF.DATA.storage[id];
      return !st.need || FF.State.hasResearch(st.need);
    });
    return FF.Minigames.choice(box, {
      tip: FF.State.s.settings.hints ? '식품마다 어울리는 보관 방법이 달라요.' : null,
      columns: 2,
      options: ids.map(id => {
        const st = FF.DATA.storage[id];
        const good = (st.good || []).indexOf(foodId) >= 0 || (f.best && f.best.storage === id);
        return {
          icon: st.icon, label: st.name, sub: st.desc + (st.cost ? ` · ${st.cost}G` : ''),
          score: good ? 96 : 58,
          feedback: good ? `${st.name} 보관은 아주 좋은 선택이에요!` : `${st.name}보다 더 어울리는 방법이 있었을지도?`,
          _id: id
        };
      })
    }).then(res => {
      const opt = ids.find(id => FF.DATA.storage[id].name === res.value);
      batch.storage = opt || 'room';
      const cost = FF.DATA.storage[batch.storage].cost;
      if (cost && FF.State.canPay(cost)) FF.State.pay(cost);
      return res;
    });
  }

  function packStep(box) {
    const f = FF.DATA.foods[foodId];
    const ids = FF.State.s.packUnlocked.slice();
    return FF.Minigames.choice(box, {
      tip: FF.State.s.settings.hints ? '포장은 제품을 보호하고, 환경 점수에도 영향을 줘요.' : null,
      columns: 2,
      options: ids.map(id => {
        const pk = FF.DATA.packages[id];
        const cost = FF.Economy.packCost(id);
        const good = f.best && f.best.pack === id;
        return {
          icon: pk.icon, label: pk.name,
          sub: `${cost}G · 👍${pk.pros} / 👎${pk.cons}`,
          score: good ? 95 : 60 + pk.protect,
          feedback: good ? `${pk.name} 포장이 딱 어울려요!` : `${pk.name} 포장으로 마무리했어요.`
        };
      })
    }).then(res => {
      const opt = ids.find(id => FF.DATA.packages[id].name === res.value);
      batch.pack = opt || 'none';
      const cost = FF.Economy.packCost(batch.pack);
      if (cost && FF.State.canPay(cost)) FF.State.pay(cost);
      return res;
    });
  }

  /* ---------- 단계 실행 ---------- */
  function nextStep() {
    const f = FF.DATA.foods[foodId];

    // 첫 단계 전 재료 연출
    const pre = (stepIdx === 0) ? ingredientDrop() : Promise.resolve();

    pre.then(() => {
      if (stepIdx >= steps.length) return finishProduction();

      const step = steps[stepIdx];
      const conceptFirst = step.concept
        ? FF.Progress.unlockCodex(step.concept)
        : Promise.resolve(false);

      return conceptFirst.then(() => {
        if (mode !== 'run') return;           // 도중 화면 이탈 방지
        renderRun();
        const title = document.getElementById('stg-title');
        const desc = document.getElementById('stg-desc');
        const pot = document.getElementById('stg-pot');
        const box = document.getElementById('stg-box');
        if (!box) return;

        title.innerHTML = `${step.icon} ${step.title}`;
        desc.textContent = step.desc || '';
        if (step.vessel) pot.querySelector('.vessel').textContent = step.vessel;
        if (step.type === 'knead') pot.classList.add('stir');

        const ease =
          step.type === 'knead' ? FF.State.bonus('easeKnead') :
          step.type === 'heat' ? FF.State.bonus('easeHeat') :
          step.type === 'dial' ? FF.State.bonus('easeDial') : 0;

        const cfg = Object.assign({}, step, { ease });
        if (step.tip && !FF.State.s.settings.hints) cfg.tip = null;

        let run;
        if (step.type === 'storage') run = storageStep(box);
        else if (step.type === 'pack') run = packStep(box);
        else if (FF.Minigames[step.type]) run = FF.Minigames[step.type](box, cfg);
        else run = Promise.resolve({ score: 70, msg: '' });

        return run.then(res => {
          pot.classList.remove('stir', 'heat');
          batch.results.push({
            key: step.key, score: res.score,
            affects: step.affects || ['quality'], msg: res.msg
          });
          if (res.overheat) batch.overheat++;
          if (res.penalty) {
            batch.penalties[res.penalty.key] = (batch.penalties[res.penalty.key] || 0) + res.penalty.amount;
          }
          stepIdx++;
          nextStep();
        });
      });
    }).catch(err => {
      console.error('[FF] 제작 중 오류', err);
      FF.UI.toast('제작 중 문제가 생겨 처음으로 돌아갑니다.', 'warn');
      mode = 'list'; show();
    });
  }

  /* ============================================================
     4. 완성 & 품질 평가
     ============================================================ */
  function finishProduction() {
    const S = FF.State.s;
    product = FF.Quality.evaluate(batch);

    S.stats.made++;
    S.stats.byFood[foodId] = (S.stats.byFood[foodId] || 0) + 1;
    if (batch.usedRare) S.stats.rareUsed++;
    S.stats.bestScore = Math.max(S.stats.bestScore, product.total);
    S.stats.bestEco = Math.max(S.stats.bestEco, product.cats.eco);
    if (product.grade === 'S') S.stats.sGrade++;
    if (product.packMatch) S.stats.packMatch++;
    FF.State.addHygiene(-3);
    FF.State.pushCombo(product.total >= 70);
    FF.State.addEco(product.cats.eco >= 75 ? 1 : (product.cats.eco <= 45 ? -1 : 0));
    FF.State.touch();

    FF.Economy.refreshMarket(false);
    FF.Progress.notify('made', product);

    mode = 'result';
    show();
  }

  function renderResult() {
    const p = product;
    const S = FF.State.s;
    const f = FF.DATA.foods[p.foodId];
    const st = FF.DATA.storage[p.storage], pk = FF.DATA.packages[p.pack];

    const gradeMsg = {
      S: ['✨✨✨ 완벽합니다!', `최고 품질의 ${p.name}을(를) 만들었어요!`],
      A: ['🎉 훌륭해요!', '아주 잘 만들어졌어요!'],
      B: ['👍 괜찮아요!', '먹을 만한 제품이 완성됐어요.'],
      C: ['🙂 아쉽네요!', '다음엔 더 잘 만들 수 있어요!']
    }[p.grade];

    /* 약한 항목 코칭 */
    const weakStep = batch.results.slice().sort((a, b) => a.score - b.score)[0];
    const coach = p.total >= 88
      ? '이 조합, 계속 밀고 나가세요!'
      : `${FF.Quality.CAT_NAME[p.weak]}이(가) 조금 아쉬웠어요. ${weakStep && weakStep.msg ? '「' + weakStep.msg + '」' : ''}`;

    /* 소비자 반응 */
    const cust = U.pick(FF.DATA.customers);
    let say = U.pick(FF.DATA.reactions[p.grade]);
    if (p.total < 88 && FF.DATA.weakComments[p.weak]) say += ' ' + FF.DATA.weakComments[p.weak];

    const catRows = FF.Quality.CATS.map((k, i) => `
      <div class="score-row">
        <span class="k">${FF.Quality.CAT_NAME[k]}</span>
        <span class="bar"><i style="width:${p.cats[k]}%"></i></span>
        <span>${U.stars(p.stars[k], true)}</span>
      </div>`).join('');

    const mKeys = [['taste', '맛'], ['color', '색'], ['smell', '냄새'], ['texture', '식감'], ['hygiene', '위생'], ['preserve', '보존성']];
    const metrics = mKeys.map(([k, n], i) => {
      const v = p.metrics[k];
      const cls = v >= 80 ? 'hi' : v >= 60 ? 'mid' : 'lo';
      return `<div class="metric ${cls}" style="animation-delay:${i * 70}ms">
                <div class="mv">${v}</div><div class="mk">${n}</div>
              </div>`;
    }).join('');

    const comboTxt = S.combo >= 2
      ? `<span class="chip" style="border-color:#ffc7e2;background:#fff0f7">🔥 ${S.combo}연속 보너스 +${Math.round((p.comboMult - 1) * 100)}%</span>` : '';
    const buffTxt = p.buffMult > 1
      ? `<span class="chip" style="border-color:#bcdcfb;background:#eaf4fe">⭐ 인기 보너스 +${Math.round((p.buffMult - 1) * 100)}%</span>` : '';
    const rareTxt = p.usedRare ? '<span class="chip" style="border-color:#e3c6ff">✨ 희귀 재료 사용</span>' : '';

    rootEl.innerHTML = `
      <div class="panel">
        <div class="result-hero">
          <div class="grade ${p.grade}">${p.grade}</div>
          <div><span class="rimg ${p.grade === 'S' ? 'shine' : ''}">${p.icon}</span></div>
          <h3>${p.name} 완성!</h3>
          <p style="font-weight:900;color:#d1741d;font-size:16px">${gradeMsg[0]}</p>
          <p class="tiny muted">${gradeMsg[1]}</p>
        </div>
      </div>

      <div class="split">
        <div>
          <div class="panel">
            <div class="panel-title">⭐ 품질 평가</div>
            <div class="score-rows">${catRows}</div>
            <div class="total-box" style="margin-top:14px">
              <div class="tl">TOTAL SCORE</div>
              <div class="tv">${p.total}<span style="font-size:18px">점</span></div>
              <div style="font-weight:900;color:#2f9b60;margin-top:4px">예상 판매가 ${U.fmt(p.price)}G</div>
            </div>
            <div class="chip-row" style="margin-top:10px;justify-content:center">
              ${comboTxt}${buffTxt}${rareTxt}
              <span class="chip">${st.icon} ${st.name}</span>
              <span class="chip">${pk.icon} ${pk.name}</span>
            </div>
          </div>
        </div>

        <div>
          <div class="panel">
            <div class="panel-title">🧪 품질검사</div>
            <div class="metric-grid">${metrics}</div>
          </div>

          <div class="panel">
            <div class="panel-title">🙋 소비자 반응</div>
            <div class="reaction">
              <span class="face">${cust.icon}</span>
              <div><div class="who">${cust.name}</div><div class="say">"${say}"</div></div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-title">💡 이번 제작에서 배운 것</div>
            <div class="tip"><span class="ic">📘</span><span>${f.learn}</span></div>
            <p class="tiny muted" style="margin-top:8px">${coach}</p>
          </div>
        </div>
      </div>

      <div class="btn-row" style="margin-top:6px">
        <button class="btn primary big" data-sell style="flex:2 1 220px">💰 ${U.fmt(p.price)}G에 판매하기</button>
        <button class="btn big" data-store style="flex:1 1 150px">📦 창고에 보관</button>
        <button class="btn big" data-again style="flex:1 1 150px">🔁 또 만들기</button>
      </div>`;

    /* 연출 */
    if (p.grade === 'S') { FF.Audio.play('success'); FF.UI.confetti(70); }
    else if (p.grade === 'A') { FF.Audio.play('success'); FF.UI.confetti(35); }
    else FF.Audio.play('good');

    U.on(rootEl, 'click', '[data-sell]', (e, t) => {
      t.disabled = true;
      FF.Economy.sellProduct(p, e);
      FF.UI.toast(`💰 ${p.name} 판매 완료! +${U.fmt(p.price)}G`, 'good');
      afterResult();
    });
    U.on(rootEl, 'click', '[data-store]', (e, t) => {
      t.disabled = true;
      FF.Economy.storeProduct(p);
      afterResult();
    });
    U.on(rootEl, 'click', '[data-again]', () => {
      FF.Audio.play('click');
      afterResult(true);
    });
  }

  function afterResult(again) {
    FF.Progress.maybeEvent().then(() => {
      if (again) {
        mode = FF.State.hasRecipe(FF.DATA.foods[foodId].recipe, subs) ? 'recipe' : 'list';
      } else {
        mode = 'list';
      }
      tutorial = false;
      show();
      FF.UI.renderTop();
    });
  }

  /* ============================================================
     라우팅
     ============================================================ */
  function show() {
    if (!rootEl) return;
    if (mode === 'list') renderList();
    else if (mode === 'recipe') renderRecipe();
    else if (mode === 'run') renderRun();
    else if (mode === 'result') renderResult();
    FF.UI.renderTop();
  }

  function render(root, opts) {
    rootEl = root;
    opts = opts || {};
    if (opts.auto) {
      foodId = opts.auto; subs = {}; tutorial = !!opts.tutorial; mode = 'recipe';
    } else if (!opts.keep) {
      if (mode === 'run' || mode === 'result') { /* 진행 중이면 유지 */ }
      else if (!foodId) mode = 'list';
    }
    // 제작/결과 중에는 외부 갱신으로 화면을 부수지 않는다
    if (opts.keep && (mode === 'run' || mode === 'result')) return;
    show();
  }

  return { render };
})();

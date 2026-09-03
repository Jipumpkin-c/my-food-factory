/* ============================================================
   main.js — 게임 부팅 / 전역 이벤트 연결
   ============================================================ */
(function () {

  function boot() {
    // 1) 저장 불러오기 (없거나 깨져 있으면 기본값으로 시작)
    FF.util.safe(() => FF.State.load(), 'load');

    // 2) 설정 반영
    FF.Audio.setEnabled(!!FF.State.s.settings.sound);

    // 3) 상점 초기화
    FF.util.safe(() => FF.Economy.refreshMarket(false), 'market');

    // 4) 타이틀 버튼 연결
    FF.Intro.bind();

    // 5) 전역 화면 이동 버튼 [data-go]
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-go]');
      if (!t) return;
      FF.Audio.play('click');
      FF.UI.go(t.dataset.go);
    });

    // 6) 시스템 → UI 갱신 신호
    FF.bus.on('ui:refresh', () => FF.util.safe(FF.UI.refresh, 'refresh'));

    // 7) 첫 사용자 조작 때 오디오 활성화 (브라우저 자동재생 정책)
    const unlock = () => {
      FF.Audio.unlockContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    // 8) 떠나기 전 저장
    window.addEventListener('beforeunload', () => FF.State.save(true));

    // 9) 예상 못 한 오류가 나도 게임이 멈추지 않게
    window.addEventListener('error', ev => {
      console.error('[FF] 전역 오류', ev.error || ev.message);
    });
    window.addEventListener('unhandledrejection', ev => {
      console.error('[FF] 처리되지 않은 오류', ev.reason);
    });

    // 10) 타이틀 표시
    FF.Intro.showTitle();

    console.log('%c🏭 나만의 식품공장 준비 완료', 'color:#ff8c42;font-weight:bold');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

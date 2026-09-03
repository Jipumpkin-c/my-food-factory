# 🏭 나만의 식품공장

중학생~고등학생을 위한 **식품공학 교육 게임**.
재료를 사고 → 식품을 만들고 → 품질을 평가받고 → 공장을 키우다 보면
자연스럽게 가공·발효·가열·보존·포장·품질관리 개념을 익히게 됩니다.

## ▶ 실행 방법

`index.html` 을 더블클릭하면 끝입니다. 설치·서버·인터넷 모두 필요 없습니다.

> 스크립트를 일반 `<script>` 로 나눠 두어 `file://` 에서도 그대로 동작합니다.
> (ES 모듈을 쓰면 로컬 파일 실행 시 CORS로 막히기 때문)

진행 상황은 브라우저 LocalStorage(`ff_myfoodfactory_v1`)에 자동 저장됩니다.

## 🎮 게임 루프

재료 구매 → 식품 선택 → 제작(미니게임) → 보관/포장 → 품질 평가 → 판매 →
장비 업그레이드 / 공장 확장 / 연구 → 새 식품 해금

## 🍳 식품 7종

| 식품 | 배우는 개념 |
|---|---|
| 🍞 빵 | 반죽·발효·가열 |
| 🍯 딸기잼 | 설탕과 보존, 졸이기 |
| 🧃 과일주스 | 착즙, 살균 온도와 영양 손실 |
| 🥣 요구르트 | 유산균 발효, 냉각 |
| 🧀 치즈 | 응고, 커드, 숙성 |
| 🍨 아이스크림 | 냉동, 교반과 얼음 결정 |
| 🥤 기능성 음료 | 배합비, 저온살균, 식품첨가물 |

## 🕹 미니게임 4종

- **knead** 타이밍 게이지 — 반죽 / 착즙 / 커드 자르기 / 교반
- **heat** 꾹 눌러 온도 유지 — 굽기 / 살균 / 졸이기
- **dial** 슬라이더로 값 맞추기 — 발효 온도 / 설탕 비율 / 당도
- **choice** 보기 고르기 — 발효 시간 / 숙성 / 보관 / 포장

장비를 올리면 판정 범위가 넓어져 쉬워집니다(`easeKnead`/`easeHeat`/`easeDial`).

## 🎁 재미 요소

레벨업 · 연속 제작 콤보 보너스 · 희귀 재료 · 랜덤 이벤트 8종 · 업적 12종 ·
공장 꾸미기 · 소비자 반응 · 해금 연출 · 콘페티 / 별점 애니메이션 ·
WebAudio로 즉석 합성하는 효과음(음원 파일 0개)

## 📁 구조

```
index.html
styles/    base(토큰·애니메이션) / components(버튼·모달) / screens(화면별)
src/
  utils/core.js         DOM·랜덤·이벤트버스
  systems/  audio state quality economy progress
  data/     ingredients foods packaging progression content
  ui/ui.js              토스트·모달·라우터·이펙트
  minigames/ knead heat dial choice
  screens/  intro factory market cook menus
  main.js
```

## ➕ 새 식품 추가하기

`src/data/foods.js` 에 항목 하나만 추가하면 됩니다. 시스템 코드는 손대지 않아도 됩니다.

```js
strawIce: {
  id:'strawIce', name:'딸기 아이스크림', icon:'🍧', basePrice:820,
  difficulty:3, need:'freezing', tagline:'분홍빛 겨울',
  recipe:[{id:'milk',qty:2},{id:'cream',qty:2},{id:'fruit',qty:2}],
  best:{ storage:'freezer', pack:'plastic' },
  steps:[ /* knead | heat | dial | choice 조합 */ ],
  learn:'…'
}
```
그리고 `FF.DATA.foodOrder` 에 id 를 넣어 주면 목록에 나타납니다.

## ✅ 검증

Edge 헤드리스로 실제 렌더링을 스크린샷 검증했습니다.
타이틀 / 공장 / 상점 / 제작 흐름 / 미니게임 3종 / 결과 / 연구 / 도감 / 미션,
그리고 PC(1280px)·태블릿(820px) 폭에서 레이아웃 깨짐 없음, 콘솔 오류 없음.

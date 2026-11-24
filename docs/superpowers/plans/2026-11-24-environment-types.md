# 우리 동네 환경 탐험대 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사회 4학년 「우리를 둘러싼 환경」 차시를 학생 혼자 진행하는 정적 웹앱(도입 → 환경의 뜻 → 종류 → 그림 지도·카드 구분 → 퀴즈 → 마무리)을 만든다.

**Architecture:** 빌드 없는 HTML/CSS/JS. 순수 로직(저장, 통과 조건, 퀴즈 생성, 채점)은 브라우저 전역과 Node `module.exports` 둘 다로 내보내 `node --test`로 단위 시험한다. 화면은 `js/app.js`가 단계별 render 함수로 그리고, 그림은 `js/art.js`의 SVG 문자열 함수가 만든다. 전체 흐름은 Playwright 스크립트로 태블릿 크기에서 끝까지 진행해 시험한다.

**Tech Stack:** HTML, CSS, JavaScript(ES2019, 일반 `<script>`), Node 22 `node:test`, Playwright(미리 설치됨), html2canvas 1.4.1(cdnjs, 이미지 저장만).

**Spec:** `docs/superpowers/specs/2026-11-24-environment-types-design.md`

## Global Constraints

- `index.html`을 file://로 열어 동작해야 한다: `type="module"`, `import`, `fetch()` 금지.
- 외부에서 받는 것: 눈누 글꼴(`edu-webapp:noonnu-fonts` 검증 코드: 학교안심 둥근미소, 프리텐다드 400/600/700), html2canvas 1.4.1. 없어도 앱은 동작.
- 저장 키 `social4-2-3-1-env-v1`. localStorage 읽기·쓰기는 모두 try/catch.
- 자연환경 = `natural`, 기호 ○, 초록 계열 / 인문환경 = `human`, 기호 △, 주황 계열. 앱 전체에서 같게.
- 본문 18px 이상, 누르는 곳 48px 이상, 카드 64px 이상.
- 학생 문구: 해요체, `edu-webapp:kid-friendly-copy`. 교과서 용어(자연환경, 인문환경, 하천, 항구)는 그대로.
- 결과는 ○/✕ 글자와 색을 함께, `aria-live="polite"` 영역에.
- 끌어다 놓기는 `edu-webapp:tablet-ready`의 `references/pointer-drag.js`를 `js/pointer-drag.js`로 복사해 쓴다. HTML5 drag API 금지.
- 넣지 않는 항목: 그냥 "호수", 공원의 나무, 제방을 쌓은 강, 개울.

## Review Focus

1. 단계 중간에 새로고침 → 지도 ○/△, 놓은 카드, 퀴즈 진행이 그대로 돌아온다. (Task 2 `restores saved state`, Task 8 e2e reload)
2. localStorage가 막힌 기기(사생활 보호 모드) → 오류 없이 처음부터 동작하고 저장만 안 된다. (Task 2 `works when storage throws`)
3. 태블릿을 돌리거나 창 크기가 바뀜 → 지도 이름표가 그림의 제자리에 남는다(위치는 SVG viewBox 좌표, 이름표는 SVG 안에 그림). (Task 6 e2e 두 크기 위치 비교)
4. 지난 단계로 돌아가 다시 함 → 뒤 단계 기록이 지워지거나 두 번 세지지 않는다. (Task 2 `revisiting does not double count`)
5. 이름·까닭 칸에 공백만 입력 → 빈 칸으로 본다. (Task 3 `whitespace counts as empty`)

---

### Task 1: 데이터와 설정

**Files:**
- Create: `data/places.js`, `data/cards.js`, `data/quiz.js`, `js/config.js`
- Test: `tests/unit/data.test.js`

**Interfaces:**
- Produces: `window.PLACES: Place[]` (`{id, name, type:'natural'|'human', x, y, reason, hint}`, x·y는 지도 viewBox 1000×640 좌표), `window.CARDS: Card[]` (`{id, name, type, emoji, image:'', reason}`), `window.EXTRA_QUIZ: Question[]` (Task 3 형식), `window.CONFIG = {storageKey:'social4-2-3-1-env-v1', cardPassCount:10, quizCount:10, step2CheckQuiz:true}`. 파일마다 끝에 `if (typeof module !== 'undefined') module.exports = ...`.

- [ ] **Step 1: 시험 작성** — `places has 14 items, 6 natural and 8 human` (산, 들, 하천, 바다, 비, 바람 / 논, 밭, 비닐하우스, 과수원, 아파트, 도로, 다리, 항구), `cards has at least 30 items with both types at least 13`, `card names do not repeat place names`, `every item has non-empty reason`, `banned ambiguous names absent` (호수, 공원 나무, 개울, 강), `ids unique`, `저수지 is human and reason mentions 둑`, `place coordinates inside 1000x640`.
- [ ] **Step 2: 실행해 실패 확인** — `node --test tests/unit` → FAIL (파일 없음)
- [ ] **Step 3: 데이터 작성** — 설계 4-1·4-2 표의 항목 그대로. 까닭은 한 줄 해요체(예: 다리 "강을 쉽게 건너려고 사람들이 만들었어요."), hint는 "이것은 사람이 만들었나요?" 꼴로 항목에 맞게. EXTRA_QUIZ에 설계 5단계 예시 문제 4개(OX 논, 빈칸 인문환경, 까닭 항구, 아닌 것 고르기).
- [ ] **Step 4: 실행해 통과 확인** — `node --test tests/unit` → PASS
- [ ] **Step 5: 커밋** — `git commit -m "feat: add places, cards, quiz data and config"`

### Task 2: 상태와 저장

**Files:**
- Create: `js/store.js`
- Test: `tests/unit/store.test.js`

**Interfaces:**
- Produces: `window.Store.create(storage, key) -> store` 와 store의 `get(): State`, `update(fn: (State)=>void): State`(적용 후 저장), `reset()`. `State = {student:{no,name}, step:number(0~7, Task 3의 단계 번호), maxStep, intro:{ponds:{forest:{pick,why}, park:{pick,why}}}, around:{opened:string[], check:{[qid]:boolean}}, kinds:{tabs:string[], flipped:string[]}, map:{[placeId]:{pick, tries, correct}}, cards:{[cardId]:{pick, correct}}, quiz:{questions:Question[], answers:{[i]:{pick, correct}}, retry:number[], done:boolean}, learned:string}`.
- `storage`는 `localStorage`와 같은 모양(`getItem/setItem/removeItem`). 던지면 메모리에만 둔다.

- [ ] **Step 1: 시험 작성** — `new state has step 0 and empty records`, `restores saved state` (update 후 같은 storage로 create → 같은 값), `works when storage throws` (모든 메서드가 throw하는 storage → update/get 정상, 예외 없음), `reset clears storage key only`, `revisiting does not double count` (같은 placeId를 두 번 update해도 map 항목 1개, step을 낮춰도 maxStep 유지), `bad JSON in storage starts fresh`.
- [ ] **Step 2: 실패 확인** — `node --test tests/unit` → FAIL
- [ ] **Step 3: 구현** — 기본값과 저장값을 깊게 합쳐 빠진 필드를 채운다.
- [ ] **Step 4: 통과 확인** — PASS
- [ ] **Step 5: 커밋** — `git commit -m "feat: add state store with safe localStorage"`

### Task 3: 통과 조건, 퀴즈 생성과 채점

**Files:**
- Create: `js/logic.js`
- Test: `tests/unit/logic.test.js`

**Interfaces:**
- Consumes: Task 1 데이터, Task 2 `State`.
- Produces: `window.Logic`:
  - `isBlank(s:string): boolean`
  - `stepStatus(state, step:number, data:{places,cards}, config) -> {done:boolean, remaining:string}` — step 1: 두 연못 pick과 why. step 2: opened 8개 + (step2CheckQuiz면) 확인 2문제. step 3: 탭 2개 + flipped 7개. step 4: 지도 14곳 모두 correct 또는 tries≥2. step 5(카드): 맞게 놓은 카드 ≥ cardPassCount. step 6(퀴즈): done. remaining은 학생 문구("지도에서 3곳이 남았어요.").
  - `buildQuiz(data:{places,cards,extra}, count:number, rng:()=>number) -> Question[]`, `Question = {id, type:'kind'|'ox'|'blank'|'reason'|'pickNot', question, choices:string[], answer:string, explain}`.
  - `grade(q:Question, pick:string) -> boolean`
  - `shuffle(arr, rng) -> arr`(새 배열)
- 단계 번호: 0 시작, 1 연못, 2 환경, 3 종류, 4 지도, 5 카드, 6 퀴즈, 7 마무리.

- [ ] **Step 1: 시험 작성** — `whitespace counts as empty` (`isBlank('  \n')` true, step 1 why가 공백이면 done false), `step 4 remaining counts places`, `step 5 passes at cardPassCount correct cards`, `buildQuiz returns count unique questions`, `buildQuiz has at least 4 kind questions and at least 3 other types`, `buildQuiz is deterministic for same rng seed`, `every question answer is in choices`, `pickNot has exactly one answer of other type`, `grade true only for answer`.
- [ ] **Step 2: 실패 확인** — FAIL
- [ ] **Step 3: 구현** — kind 문제: 항목 이름 + 보기 ["자연환경", "인문환경"]. ox: 항목과 무작위 종류로 "○○은(는) 자연환경이에요." 받침에 맞는 조사(은/는, 이에요/예요)를 고른다. reason: 인문 항목의 reason을 정답으로, 다른 인문 항목 reason 3개를 오답으로. pickNot: 같은 종류 3개 + 다른 종류 1개. EXTRA_QUIZ에서 최대 2문제를 넣는다.
- [ ] **Step 4: 통과 확인** — PASS
- [ ] **Step 5: 커밋** — `git commit -m "feat: add gating, quiz builder and grading"`

### Task 4: 앱 뼈대, 시작 화면, 단계 1·2

**Files:**
- Create: `index.html`, `css/style.css`, `js/art.js`, `js/app.js`, `js/pointer-drag.js`(복사)
- Test: `tests/e2e/flow.js` (Playwright 스크립트: `node tests/e2e/flow.js` → 성공 시 종료 0)

**Interfaces:**
- Consumes: Task 1~3 전역.
- Produces: `js/app.js`의 `App.go(step:number)`, `App.render()`; 단계마다 `renderStepN(root:HTMLElement)`. 공통 요소 id: `#stepper`(단계 버튼, 지나온 단계만 누를 수 있음), `#screen`, `#feedback`(aria-live), `#next`(조건 못 채우면 disabled + `#next-hint`에 remaining), `#reset`(확인 후 Store.reset). `js/art.js`의 `Art.pond(kind:'forest'|'park') -> svg string`, `Art.explorer() -> svg string`.
- 시험용 `data-testid`: 연못 고르기 `pick-forest-natural` 꼴, 둘러싼 것 `around-<id>`.

- [ ] **Step 1: e2e 작성** — 1024×768 hasTouch로 열어: 이름 비면 시작 버튼 disabled → 번호·이름 입력 → 단계 1에서 두 연못 고르고 까닭 입력 → 다음 → 단계 2에서 8개 열기, OX 2문제 → 다음 → 단계 3 화면 제목 보임. 콘솔 오류 0(외부 글꼴 실패 제외).
- [ ] **Step 2: 실패 확인** — `node tests/e2e/flow.js` → FAIL
- [ ] **Step 3: 구현** — `index.html`에 스크립트 순서: config, data×3, store, logic, art, pointer-drag, app. 글꼴 `@font-face`는 `style.css` 맨 위. 레이아웃은 `tablet-ready` 규칙(100dvh, 900px 기준). 단계 1 정답은 여기서 보여 주지 않는다.
- [ ] **Step 4: 통과 확인** — e2e PASS, `node --test tests/unit` PASS
- [ ] **Step 5: 커밋** — `git commit -m "feat: add app shell, start, intro and environment meaning steps"`

### Task 5: 단계 3 환경의 두 가지

**Files:**
- Modify: `js/app.js`, `js/art.js`, `css/style.css`, `tests/e2e/flow.js`

**Interfaces:**
- Produces: `data-testid` `tab-natural`, `tab-human`, `flip-<placeId>`(인문 예 7개: 논, 밭, 과수원, 항구, 다리, 도로, 아파트 — 그 PLACES의 reason을 뒷면에), `pond-answer`.

- [ ] **Step 1: e2e 추가** — 두 탭 보기 + 카드 7개 뒤집기 전에는 다음 disabled, remaining 문구 보임 → 다 하면 `pond-answer`에 "숲속 연못 ○ 자연환경", "공원 연못 △ 인문환경"과 내 답이 보임 → 다음.
- [ ] **Step 2: 실패 확인** — FAIL
- [ ] **Step 3: 구현** — 자연환경 탭은 "땅의 생김새: 산, 들, 하천, 바다"와 "날씨: 눈, 비, 바람, 기온" 두 묶음, "날씨도 환경이에요!" 강조.
- [ ] **Step 4: 통과 확인** — PASS
- [ ] **Step 5: 커밋** — `git commit -m "feat: add environment kinds step with pond answer reveal"`

### Task 6: 단계 4-1 그림 지도

**Files:**
- Modify: `js/art.js`(`Art.townMap(places) -> svg string`, viewBox `0 0 1000 640`, 이름표를 SVG `<g data-testid="place-<id>">`로 그림), `js/app.js`, `css/style.css`, `tests/e2e/flow.js`

**Interfaces:**
- Produces: 이름표를 누르면 `#choice-sheet`에 `choose-natural`, `choose-human` 버튼. 고른 뒤 이름표 옆에 ○/△ 표시(`mark-<id>`).

- [ ] **Step 1: e2e 추가** — 논을 자연환경으로 고르면 힌트(✕ 아님, 질문 문구), 두 번째에 인문환경 → ○ 맞아요와 까닭. 14곳을 정답으로 마치면 다음 활성. 같은 이름표의 화면 위치를 1024×768과 768×1024에서 재서 지도 그림 대비 상대 위치가 2% 안에서 같다. 새로고침 후 ○/△ 표시가 그대로.
- [ ] **Step 2: 실패 확인** — FAIL
- [ ] **Step 3: 구현** — 교과서 그림을 옮기지 않은 새 마을: 위쪽 산과 비구름, 왼쪽 논·밭·비닐하우스·과수원, 가운데 아파트·도로, 오른쪽 하천과 다리, 아래 바다와 항구, 나무가 흔들리고 바람결 선(바람). 두 번째도 틀리면 정답으로 표시하고 `tries=2, correct=false`로 기록.
- [ ] **Step 4: 통과 확인** — PASS
- [ ] **Step 5: 커밋** — `git commit -m "feat: add town map marking activity"`

### Task 7: 단계 4-2 카드 나누기

**Files:**
- Modify: `js/app.js`, `css/style.css`, `tests/e2e/flow.js`

**Interfaces:**
- Consumes: `PointerDrag.attach({root, itemSelector:'.card', zoneSelector:'.bin', onDrop, canDrop})`.
- Produces: `data-testid` `card-<id>`, `bin-natural`, `bin-human`, `card-count`("맞게 놓은 카드 3 / 10").

- [ ] **Step 1: e2e 추가** — 마우스로 끌어 놓기 1장, CDP 터치로 끌어 놓기 1장, 누르고 상자 누르기 1장. 틀린 상자에 놓으면 힌트와 함께 카드가 다시 놓을 수 있는 곳으로 돌아감. 10장 맞으면 다음 활성, 남은 카드는 "더 해 보기"로 계속 보임. 새로고침 후 놓은 카드 유지.
- [ ] **Step 2: 실패 확인** — FAIL
- [ ] **Step 3: 구현** — 카드는 shuffle(시작 시 한 번 섞어 순서를 State에 저장), 한 번에 6장씩 보이는 카드 더미. 맞게 놓은 카드는 상자 안에 작게 쌓인다.
- [ ] **Step 4: 통과 확인** — PASS
- [ ] **Step 5: 커밋** — `git commit -m "feat: add card sorting activity"`

### Task 8: 퀴즈와 마무리

**Files:**
- Modify: `js/app.js`, `css/style.css`, `index.html`(html2canvas 1.4.1 cdnjs `defer`), `tests/e2e/flow.js`

**Interfaces:**
- Consumes: `Logic.buildQuiz`, `Logic.grade`.
- Produces: `data-testid` `quiz-choice-<i>`, `quiz-next`, `score`, `print`, `save-image`, `learned`.

- [ ] **Step 1: e2e 추가** — 퀴즈 10문제에서 일부러 2개 틀림 → 끝에 그 2문제를 다시 풂 → 마무리에 점수 "8 / 10", 배지, 연못 예상·정답, 지도 미리보기(○/△), 카드 결과가 보임. 알게 된 점 입력 후 새로고침해도 남음. html2canvas가 없을 때(외부 차단) 이미지 저장을 누르면 "인쇄 → PDF로 저장" 안내가 뜨고 오류 없음. 인쇄 스타일에서 버튼과 `#stepper`가 숨겨짐(`page.emulateMedia({media:'print'})`).
- [ ] **Step 2: 실패 확인** — FAIL
- [ ] **Step 3: 구현** — 퀴즈 문제는 처음 들어올 때 한 번 만들어 State에 저장(새로고침해도 같은 문제). 점수는 첫 시도 기준.
- [ ] **Step 4: 통과 확인** — PASS
- [ ] **Step 5: 커밋** — `git commit -m "feat: add quiz and wrap-up with print and image save"`

### Task 9: 교사용 README와 최종 점검

**Files:**
- Create: `README.md`
- Modify: `tests/e2e/flow.js`(단계마다 `tablet-check` 규칙 검사를 함께: 가로 스크롤 없음, 44px 미만 누르는 곳 없음)

- [ ] **Step 1: README 작성** — `edu-webapp-standards`의 README 8항목. "수업 전에 확인할 것"에 도입 이야기와 마을 그림은 새로 만든 것, 저수지·바람을 넣은 까닭, 카드 통과 조건 10장(0이면 선택 활동).
- [ ] **Step 2: 전체 점검** — `node --test tests/unit` PASS, `node tests/e2e/flow.js` PASS, `node <tablet-ready>/scripts/tablet-check.js . <scratchpad>/tc` 통과. 5개 화면 크기 스크린숏을 직접 열어 겹침·잘림 확인. `kid-friendly-copy` 점검 목록으로 `grep -nE "선택|입력|제출|클릭|오류" js data` 결과 확인.
- [ ] **Step 3: 커밋하고 올리기** — `git commit -m "docs: add teacher README"` 후 `git push`

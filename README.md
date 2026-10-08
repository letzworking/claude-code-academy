# Claude Code 첫걸음 (claude-code-academy)

AI 활용 경험이 거의 없는 **시니어 개발자(Java/Spring)** 를 위한 Claude Code 입문 교육 사이트입니다.
빌드 없는 정적 HTML/CSS/JS로 만들었고, PC와 모바일 화면을 모두 지원합니다.

## 여는 방법

- **가장 간단한 방법**: `index.html`을 더블클릭해 브라우저로 엽니다. `file://`로 열어도 모든 기능이 동작합니다.
- **사내 공유**: 폴더 전체를 사내 웹서버, GitHub Pages, Nginx 같은 정적 호스팅에 올리면 됩니다. 서버 설정은 필요 없습니다.
- 로컬 서버로 확인하려면 `npx serve .` 또는 `python -m http.server`를 실행합니다.

## 구성

| 페이지 | 내용 |
|---|---|
| `index.html` | 홈: 터미널 데모, Before/After 비교, 5단계 로드맵(진도 표시) |
| `lessons/01-why-ai.html` | 왜 지금 AI인가: 자동완성과의 차이, 시니어의 강점, 걱정 FAQ |
| `lessons/02-setup.html` | 설치·로그인·첫 실행, 승인 화면 이해, IDE 연동 |
| `lessons/03-first-10min.html` | 첫 10분 미션 3개: 설명받기 / 버그 찾기 / 주석 달기 |
| `lessons/04-recipes.html` | Java/Spring 레시피 6개: 레거시 분석, MyBatis, JUnit, 버그 수정, 리팩터링, PR |
| `lessons/05-habits.html` | 좋은 요청법, Plan 모드, CLAUDE.md, 금지 사항, 1주 챌린지 |
| `cheatsheet.html` | 명령, 단축키, 프롬프트 템플릿 한 장 요약(인쇄용 스타일 포함) |

```
assets/css/style.css   디자인 토큰(:root), 다크모드, 반응형
assets/js/progress.js  레슨 진도 저장(localStorage). 저장소가 막혀 있어도 정상 동작
assets/js/main.js      테마 전환, 모바일 메뉴, 복사 버튼, OS 탭, 진도 표시, 터미널 데모
tests/                 progress.js 단위 테스트(node:test)
```

## 콘텐츠 수정

- 텍스트는 각 HTML 파일을 직접 수정합니다. 헤더와 푸터는 페이지마다 복사되어 있으므로 메뉴를 바꿀 때는 **7개 파일을 모두** 수정해야 합니다.
- 복사 버튼은 `<div class="code">` 또는 `<div class="code prompt">` 안의 `<pre>`에 자동으로 붙습니다.
- 진도 체크 버튼은 `data-complete="01"`~`"05"` 속성을 씁니다. 레슨을 추가하면 `progress.js`의 `LESSON_IDS`도 함께 수정하세요.
- 설치 명령, 단축키 같은 Claude Code 정보는 2026-10-08 기준 [공식 문서](https://code.claude.com/docs)로 확인한 내용입니다. 버전이 바뀌면 다시 확인하세요.

## 테스트

```bash
npm test
```

Node.js 20 이상이 필요하며 의존성 설치는 없습니다.

## 컨벤션 예외

`web-convention.md` §2의 "빌드 없이 브라우저에 바로 로드하는 극소규모 스크립트 → JavaScript 허용" 조항을 적용했습니다.
그래서 `file://`로 열어도 동작하도록 ES 모듈 대신 일반 `<script>`를 쓰고, TypeScript·빌드 단계를 두지 않았습니다.

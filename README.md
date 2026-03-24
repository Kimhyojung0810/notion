# Notion 마감일 댓글 알림

Notion 데이터베이스의 **마감일**을 기준으로 조건에 맞는 행에 **페이지 댓글**을 달아 알림을 보냅니다. `Person` 속성에 지정된 사람에게는 댓글에 **@멘션**이 포함됩니다.

## 필요한 것

- [Notion 통합](https://www.notion.so/my-integrations)(Internal Integration)과 **API 키**
- 알림을 보낼 **데이터베이스**가 해당 통합과 **연결(Connections)** 되어 있을 것
- DB에 아래 속성(이름은 `.env`로 바꿀 수 있음)

| 기본 이름   | 타입   | 용도        |
|------------|--------|-------------|
| `Name`     | Title  | 작업 제목   |
| `Due Date` | Date   | 마감일      |
| `Status`   | Status 또는 Select | `done`, `archive`면 알림 제외 |
| `Person`   | People | 멘션 대상   |

## 로컬에서 실행

```bash
npm install
cp .env.example .env   # 없으면 .env를 직접 만들고 아래 변수 입력
node index.js
```

### 환경 변수 (`.env`)

| 변수 | 필수 | 설명 |
|------|------|------|
| `NOTION_API_KEY` | ✅ | 통합 시크릿 |
| `NOTION_DATABASE_ID` | ✅ | DB URL에 있는 **데이터베이스 ID**(UUID). `NOTION_DATA_SOURCE_ID` 이름으로 넣어도 동일하게 동작(호환용) |
| `NOTION_PERSON_PROPERTY` | | 기본값 `Person` |
| `NOTION_DUE_DATE_PROPERTY` | | 기본값 `Due Date` |
| `NOTION_STATUS_PROPERTY` | | 기본값 `Status` |
| `NOTION_TITLE_PROPERTY` | | 기본값 `Name` |

`.env`는 Git에 올리지 마세요(`.gitignore`에 포함됨).

## 알림이 달리는 조건

- **마감일**이 비어 있으면 건너뜀  
- **Status**가 `done` 또는 `archive`(대소문자 무시)면 건너뜀  
- 오늘과 마감일의 차이(일)가 아래일 때만 댓글 문구 생성 후 댓글 작성  
  - **3일 전**, **1일 전**, **마감일 지남**(지난 일수에 따라 문구 구분)  
- 같은 조건으로 **스크립트를 여러 번 실행하면 댓글이 중복**될 수 있음(하루 1회 제한 없음)

## GitHub Actions (노트북 꺼져 있어도 실행)

`default` 브랜치(예: `main`)에 워크플로가 있으면 **매일 UTC 01:00 = 한국 시간 10:00**에 자동 실행됩니다.

**저장소 → Settings → Secrets and variables → Actions → Repository secrets**에 다음을 등록합니다.

| Name | 값 |
|------|-----|
| `NOTION_API_KEY` | Notion API 키 |
| `NOTION_DATABASE_ID` | 위와 동일한 **DB ID**(URL의 UUID) |

수동 실행: **Actions** 탭 → **Notion deadline reminder** → **Run workflow**.

## 선택: 맥에서 매일 로컬 스케줄 (LaunchAgent)

한국 시간 기준으로만 동작하게 하려면 `scripts/run-deadline-reminder.sh`와 `scripts/install-launchd.sh`를 사용할 수 있습니다. 등록 해제는 `npm run uninstall-schedule` 또는 `scripts/uninstall-launchd.sh`.

## 라이선스

ISC (package.json 기준)

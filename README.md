# Notion 마감일 댓글 알림

Notion 데이터베이스의 **마감일**을 기준으로 조건에 맞는 행에 **페이지 댓글**을 달아 알림을 보냅니다. `Person` 속성에 지정된 사람에게는 댓글에 **@멘션**이 포함됩니다.

**상세 안내(회사 내부 공유용):** [docs/가이드.md](./docs/가이드.md)

---

## 빠른 요약

| 항목 | 내용 |
|------|------|
| **목적** | 마감일 N일 전·연체 시 담당자에게 Notion 댓글로 알림 |
| **실행** | GitHub Actions로 **매일 한국 시간 10시** 자동 (노트북 전원 불필요) |
| **필수 시크릿** | `NOTION_API_KEY`, `NOTION_DATABASE_ID` (Repository secrets) |

---

## 필요한 것

- [Notion 통합](https://www.notion.so/my-integrations)(Internal Integration)과 **API 키**
- 알림을 보낼 **데이터베이스**가 해당 통합과 **연결(Connections)** 되어 있을 것
- DB에 아래 속성(이름은 `.env`로 바꿀 수 있음)

| 기본 이름 | 타입 | 용도 |
|-----------|------|------|
| `Name` | Title | 작업 제목 |
| `Due Date` | Date | 마감일 |
| `Status` | Status 또는 Select | `done`, `archive`면 알림 제외 |
| `Person` | People | 멘션 대상 |

---

## 로컬에서 실행

```bash
npm install
cp .env.example .env   # 값 채우기
node index.js
```

### 환경 변수 (`.env`)

| 변수 | 필수 | 설명 |
|------|------|------|
| `NOTION_API_KEY` | ✅ | 통합 시크릿 |
| `NOTION_DATABASE_ID` | ✅ | DB URL의 **데이터베이스 ID**(UUID). 예전 이름 `NOTION_DATA_SOURCE_ID`로 넣어도 동일 동작(호환) |
| `NOTION_PERSON_PROPERTY` | | 기본값 `Person` |
| `NOTION_DUE_DATE_PROPERTY` | | 기본값 `Due Date` |
| `NOTION_STATUS_PROPERTY` | | 기본값 `Status` |
| `NOTION_TITLE_PROPERTY` | | 기본값 `Name` |

`.env`는 **Git에 커밋하지 마세요** (`.gitignore` 처리됨).

---

## 알림이 달리는 조건

- **마감일**이 비어 있으면 건너뜀  
- **Status**가 `done` 또는 `archive`(대소문자 무시)면 건너뜀  
- 오늘과 마감일의 차이(일)가 아래일 때만 댓글 작성  
  - **3일 전**, **1일 전**, **마감일 지남**(지난 일수에 따라 문구 구분)  
- **같은 날 스크립트를 여러 번 실행하면 댓글이 중복**될 수 있음 (하루 1회 제한 없음)

---

## GitHub Actions

`main` 등 기본 브랜치에 워크플로가 있으면 **매일 UTC 01:00 = 한국 시간 10:00**에 실행됩니다.

**Settings → Secrets and variables → Actions → Repository secrets**

| Name | 값 |
|------|-----|
| `NOTION_API_KEY` | Notion API 키 |
| `NOTION_DATABASE_ID` | DB ID (URL의 UUID) |

- **Deploy keys**에는 넣지 않습니다 (Git SSH용). **Repository secrets**만 사용합니다.  
- GitHub Actions는 **`.env`를 읽지 않으므로** 반드시 위 시크릿을 등록해야 합니다.

수동 실행: **Actions** → **Notion deadline reminder** → **Run workflow**

---

## 선택: 맥 로컬 스케줄 (LaunchAgent)

`scripts/install-launchd.sh` / `npm run install-schedule`  
해제: `npm run uninstall-schedule`

---

## 문서·라이선스

- 내부 공유·온보딩: [docs/가이드.md](./docs/가이드.md)  
- 라이선스: ISC (`package.json`)

# PAWMISE (포미스)

> AI 기반 동물 입양 계약 및 사후관리 플랫폼  
> 입양 동물의 특성 및 입양자 정보를 바탕으로 맞춤 특약을 생성하고, 전자계약·안부 인증·위험 관리까지 연결합니다.

---

## 1. 프로젝트 소개

PAWMISE는 보호소의 입양 과정을 계약 체결 이후까지 관리하기 위한 서비스입니다.

입양 동물의 건강·행동 특성과 입양자의 주거 환경·양육 경험을 분석하여 AI가 맞춤형 책임 특약을 생성합니다. 이후 전자서명, 정기 안부 인증, 제출 응답 기반 위험 등급 산정, 관리자 검토까지 하나의 흐름으로 제공합니다.

### 핵심 사용자 흐름

동물·입양 신청 정보 확인
→ AI 맞춤 특약 생성
→ 모두싸인 전자계약 요청 및 체결
→ 사후관리 인증 일정 생성
→ 관리자가 수동으로 인증 안내 발송
→ 입양자 인증 폼 제출
→ 응답·제출 지연 기반 위험 등급 산정
→ 관리자 검토 및 승인
→ 대시보드 상태·위험 뱃지 반영

> 제작 팀: PAWMISE

---

## 2. 주요 기능

### AI 맞춤 특약 생성

- Upstage Solar LLM을 활용해 동물 정보와 입양자 정보를 분석합니다.
- RAG 검색 결과를 근거로 맞춤형 계약 특약을 생성합니다.
- LLM이 임의의 강제 의무를 만들지 않도록, 확정된 특약 기준 문서 안에서만 응답하도록 구성했습니다.
- 생성 결과는 계약서 특약 및 입양자 안내 문구로 사용합니다.

### 전자계약 및 사후관리 일정 생성

- 모두싸인 템플릿 기반 전자서명 요청을 지원합니다.
- 계약 체결 완료 시 계약 ID와 반려동물 ID를 기준으로 사후관리 일정을 생성합니다.
- MVP 기준 총 6회차 인증 일정을 관리합니다.

| 회차 | 인증 시점 |
| --- | --- |
| 1회차 | D+3 |
| 2회차 | D+7 |
| 3회차 | D+30 |
| 4회차 | D+90 |
| 5회차 | D+180 |
| 6회차 | D+365 |

### 안부 인증 및 위험 관리

- 관리자가 시연용으로 인증 안내를 수동 발송할 수 있습니다.
- 입양자는 사진, 설문 응답, 건강 이상 여부 등을 제출할 수 있습니다.
- 제출 응답 및 미제출 지연 기간을 바탕으로 위험 등급을 산정합니다.
- 관리자는 인증 내용을 확인하고 승인 상태, 조치 내용, 관리자 메모를 저장할 수 있습니다.
- 대시보드에서 계약별 위험 상태와 인증 이력을 조회할 수 있습니다.

### 위험 등급 기준

| 조건 | 위험 등급 |
| --- | --- |
| 정상 제출 및 특이사항 없음 | Green / 정상 |
| 제출 지연 3일 초과 | Yellow / 관찰 |
| 제출 지연 7일 초과 | Orange / 주의 |
| 제출 지연 15일 이상 | Red / 긴급 |

---

## 3. AI 활용 증빙

### Upstage Solar LLM

PAWMISE는 Upstage Solar LLM을 사용하여 입양 동물과 입양 신청자 정보를 분석하고, 맞춤형 책임 특약을 생성합니다.

AI 요청에는 다음 정보가 포함됩니다.

- 동물 이름, 나이, 품종
- 건강 상태 및 행동 특성
- 입양자의 주거 환경
- 양육 경험
- 외출 시간 및 돌봄 가능 조건

LLM은 아래와 같은 JSON 형식으로 응답합니다.

```json
{
  "ai_summary": "입양자와 동물 특성에 맞춘 특약 요약",
  "custom_clauses": [
    "맞춤형 특약 문구 1",
    "맞춤형 특약 문구 2"
  ]
}
```

### RAG 기반 특약 생성

특약 생성에는 일반적인 돌봄 조언이 아닌, 보호소 운영 기준에 맞는 확정 특약 문서를 사용합니다.

RAG 기준 문서 위치:

```text
backend/knowledge/contract_monitoring_rules.md
```

RAG 처리 흐름:

```text
특약 기준 Markdown 문서
→ ChromaDB 색인
→ 동물·입양자 정보와 관련된 기준 검색
→ 검색된 기준을 Upstage Solar 프롬프트에 포함
→ 계약 특약 및 인증 기준 생성
```

현재 RAG 문서에는 아래 기준이 포함되어 있습니다.

- 건강 및 질병 관리 특약
- 행동 문제 및 파양 방지 특약
- 초기 적응 및 정기 안부 인증 특약

LLM은 검색된 기준 밖의 새로운 강제 의무를 임의로 만들지 않고, RAG 문서에 명시된 특약·인증·증빙 기준에 맞춰 응답하도록 설계했습니다.

> 본 프로젝트는 Document Parse를 사용하지 않았습니다.  
> Markdown 기준 문서를 ChromaDB에 색인하는 방식으로 RAG를 구현했습니다.

---

## 4. 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | Next.js, TypeScript |
| Backend | Python, FastAPI |
| Database | SQLite |
| AI | Upstage Solar LLM |
| Embedding | Upstage Solar Embedding |
| Vector Database | ChromaDB |
| 전자서명 | 모두싸인 API |
| API 문서 | FastAPI Swagger UI |

---

## 5. 프로젝트 구조

```text
AI-Builder-Sprint/
├── backend/
│   ├── app/
│   │   ├── api/              # AI 특약 생성 API
│   │   ├── contracts/        # 계약 체결 및 인증 일정 관리
│   │   ├── form/             # 입양자 인증 폼 및 위험 산정
│   │   ├── manage/           # 동물·입양 신청 관리 API
│   │   ├── risk/             # 위험 대시보드 및 관리자 검토
│   │   ├── services/         # Upstage, RAG 서비스
│   │   ├── config.py
│   │   └── main.py
│   ├── knowledge/
│   │   └── contract_monitoring_rules.md
│   ├── scripts/
│   │   ├── ingest_knowledge.py
│   │   └── seed_demo_data.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    └── src/
```

---

## 6. 로컬 실행 가이드

### 6-1. 저장소 복제

```bash
git clone https://github.com/whenthestarise/AI-Builder-Sprint.git
cd AI-Builder-Sprint
```

### 6-2. 백엔드 실행

백엔드 폴더로 이동합니다.

```powershell
cd backend
```

가상환경을 생성합니다.

```powershell
python -m venv venv
```

가상환경을 활성화합니다.

```powershell
.\venv\Scripts\Activate.ps1
```

필수 패키지를 설치합니다.

```powershell
pip install -r requirements.txt
```

환경변수 파일을 생성합니다.

```powershell
Copy-Item .env.example .env
```

`.env` 파일에 발급받은 Upstage API Key를 입력합니다.

RAG 기준 문서를 ChromaDB에 색인합니다.

```powershell
.\venv\Scripts\python.exe -m scripts.ingest_knowledge
```

FastAPI 서버를 실행합니다.

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버 실행 후 아래 주소에서 확인할 수 있습니다.

| 주소 | 설명 |
| --- | --- |
| `http://127.0.0.1:8000/health` | 백엔드 서버 상태 확인 |
| `http://127.0.0.1:8000/docs` | Swagger API 문서 |
| `http://127.0.0.1:8000/api/manage` | 동물 및 입양 신청 관리 API |

### 6-3. 프론트엔드 실행

새 터미널에서 프론트엔드 폴더로 이동합니다.

```powershell
cd ..\frontend
npm install
npm run dev
```

기본 접속 주소:

```text
http://localhost:3000
```

프론트엔드 환경변수는 `frontend/.env.local`에서 관리합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

---

## 7. 실행 및 배포 환경

### 개발 환경

| 항목 | 환경 |
| --- | --- |
| OS | Windows |
| Python | 3.10 이상 |
| Frontend | Next.js |
| Backend | FastAPI, Uvicorn |
| Database | SQLite |
| Vector DB | ChromaDB |

### 시연 환경

현재 해커톤 시연은 별도 클라우드 배포 환경이 아닌, 개발자 PC에서 실행하는 로컬 개발 서버 기반으로 시연합니다.

```text
Frontend: Next.js 개발 서버
Backend: FastAPI + Uvicorn 서버
Database: SQLite(form.db)
AI: Upstage Solar API
RAG: ChromaDB
```

백엔드는 외부 기기 요청을 받을 수 있도록 아래와 같이 실행합니다.

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 시연 접속 주소

> 현재 해커톤 시연용으로 운영 중인 주소입니다.  
> 백엔드 PC와 Uvicorn 서버가 실행 중일 때 접속할 수 있습니다.

| 구분 | 주소 |
| --- | --- |
| Frontend | `http://3.39.239.255` |
| Backend API | `http://113.131.34.14:8000` |
| Backend Health Check | `http://113.131.34.14:8000/health` |
| Backend Swagger API Docs | `http://113.131.34.14:8000/docs` |
| GitHub Repository | `https://github.com/whenthestarise/AI-Builder-Sprint` |

## 8. 환경변수 정보

### Backend: `backend/.env`

```env
UPSTAGE_API_KEY=
UPSTAGE_CHAT_MODEL=solar-pro3
UPSTAGE_PASSAGE_EMBEDDING_MODEL=solar-embedding-1-large-passage
UPSTAGE_QUERY_EMBEDDING_MODEL=solar-embedding-1-large-query
CHROMA_DB_PATH=./chroma_db
```

| 변수명 | 설명 |
| --- | --- |
| `UPSTAGE_API_KEY` | Upstage Solar API Key |
| `UPSTAGE_CHAT_MODEL` | 특약 생성에 사용할 Solar 모델 |
| `UPSTAGE_PASSAGE_EMBEDDING_MODEL` | RAG 문서 색인용 임베딩 모델 |
| `UPSTAGE_QUERY_EMBEDDING_MODEL` | RAG 검색 질의용 임베딩 모델 |
| `CHROMA_DB_PATH` | ChromaDB 저장 경로 |

### Frontend: `frontend/.env.local`

```env
# 프론트엔드 실행 주소
NEXT_PUBLIC_API_URL=http://localhost:3000

# FastAPI 백엔드 주소
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# 모두싸인 전자서명 연동
MODUSIGN_EMAIL=
MODUSIGN_API_KEY=
MODUSIGN_WEBHOOK_SECRET=

# 계약 요청에서 templateId를 별도로 보내지 않을 때 사용
MODUSIGN_TEMPLATE_ID=

# 카카오 JavaScript SDK
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=

| 변수명 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | 프론트엔드 실행 주소 |
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI 백엔드 서버 주소 |
| `MODUSIGN_EMAIL` | 모두싸인 API 계정 이메일 |
| `MODUSIGN_API_KEY` | 모두싸인 API Key |
| `MODUSIGN_WEBHOOK_SECRET` | 모두싸인 Webhook 검증용 비밀값 |
| `MODUSIGN_TEMPLATE_ID` | 모두싸인 전자계약 템플릿 ID |
| `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` | 카카오 JavaScript SDK Key |

> 실제 API Key와 Webhook Secret은 GitHub에 업로드하지 않습니다.  
> 외부 API 테스트용 환경변수는 제출 안내에 따라 별도 이메일로 제출합니다.

---

## 9. 주요 백엔드 API

| 기능 | Method | Endpoint |
| --- | --- | --- |
| AI 특약 생성 | POST | `/api/ai/contract-preview` |
| 계약 체결 및 일정 생성 | POST | `/api/contracts/sign-complete` |
| 계약별 인증 일정 조회 | GET | `/api/contracts/{contractId}/monitoring-schedules` |
| 인증 안내 수동 발송 | POST | `/api/contracts/{contractId}/monitoring-schedules/{scheduleId}/send` |
| 인증 제출 | POST | `/api/form/certifications` |
| 파일 포함 인증 제출 | POST | `/api/form/certifications/multipart` |
| 위험 대시보드 조회 | GET | `/api/risk/dashboard` |
| 계약별 상세 대시보드 | GET | `/api/risk/contracts/{contractId}/dashboard` |
| 관리자 인증 검토·승인 | PUT | `/api/risk/contracts/{contractId}/certifications/{certificationId}/approve` |
| 동물·입양 신청 목록 조회 | GET | `/api/manage` |
| 동물별 입양 신청 조회 | GET | `/api/manage/{petId}` |

전체 API 명세는 아래 Swagger에서 확인할 수 있습니다.

```text
http://127.0.0.1:8000/docs
```

---

## 10. 시연 시나리오

### 시연 1. AI 맞춤 특약 생성

1. 동물과 입양 신청자 정보를 선택합니다.
2. Upstage Solar LLM이 RAG 기준 문서를 검색합니다.
3. 동물 특성과 입양자 환경에 맞는 계약 특약을 생성합니다.
4. 생성된 특약을 전자계약 화면에 반영합니다.

### 시연 2. 정상 제출 후 관리자 승인

1. 두부의 안부 인증 제출 내용을 확인합니다.
2. 정상 위험 등급을 확인합니다.
3. 관리자가 승인 버튼을 누릅니다.
4. 상태가 `검토대기`에서 `승인완료`로 변경됩니다.

### 시연 3. 주의 대상 관리자 검토

1. 초코의 행동 문제 관련 인증 내용을 확인합니다.
2. 주의 위험 등급을 유지합니다.
3. 관리자가 조치 내용과 메모를 저장합니다.

### 시연 4. 미제출 긴급 관리

1. 보리의 인증 미제출 상태를 확인합니다.
2. 15일 이상 미제출로 긴급(Red) 상태가 표시됩니다.
3. 전화 독촉 또는 현장 방문 요청 등 관리 조치를 기록합니다.

---

## 11. 보안 및 제출 유의사항

- `.env` 파일은 GitHub에 업로드하지 않습니다.
- API Key는 README, 발표자료, 시연 영상에 노출하지 않습니다.
- `backend/.env.example`에는 실제 Key 없이 변수명과 예시 값만 포함합니다.
- 외부 API 테스트용 Key는 제출 안내에 따라 별도 이메일로 전달합니다.
- 로컬 네트워크 시연 종료 후 FastAPI 서버를 종료합니다.

---

## 12. 향후 확장 방향

- 카카오 알림톡 자동 발송 스케줄러 연동
- 실제 파일 스토리지 기반 인증 사진 관리
- 위험 등급별 관리자 조치 항목 동적 구성
- 인증 회차별 맞춤형 질문지 제공
- 실제 보호소 데이터 및 사용자 인증 연동
- 클라우드 배포 및 운영 환경 구축

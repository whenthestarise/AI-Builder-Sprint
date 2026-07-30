import re
from pathlib import Path

import chromadb
from openai import OpenAI

from app.config import get_settings


ROOT_DIR = Path(__file__).resolve().parents[1]
KNOWLEDGE_FILE = (
    ROOT_DIR / "knowledge" / "contract_monitoring_rules.md"
)
COLLECTION_NAME = "contract_monitoring_rules"

CLAUSE_TITLES = {
    "HEALTH_CARE": "건강 및 질병 관리 특약",
    "BEHAVIOR_RETURN": "행동 문제 및 파양 방지 특약",
    "INITIAL_MONITORING": "정기 안부 인증 특약",
}

# 특약 MarkDown 파일 나누는 함수
def split_clauses(markdown: str) -> list[dict[str, str]]:
    pattern = re.compile(r"^## (?P<code>[A-Z_]+)\s*$", re.MULTILINE)
    matches = list(pattern.finditer(markdown))

    clauses: list[dict[str, str]] = []

    for index, match in enumerate(matches):
        code = match.group("code")
        start = match.start()
        end = (
            matches[index + 1].start()
            if index + 1 < len(matches)
            else len(markdown)
        )

        clauses.append(
            {
                "code": code,
                "title": CLAUSE_TITLES.get(code, code),
                "content": markdown[start:end].strip(),
            }
        )

    return clauses

# Upstage Embedding & ChormaDB 저장 함수
def ingest() -> None:
    settings = get_settings()

    if not KNOWLEDGE_FILE.exists():
        raise FileNotFoundError(
            f"RAG 문서를 찾을 수 없습니다: {KNOWLEDGE_FILE}"
        )

    markdown = KNOWLEDGE_FILE.read_text(encoding="utf-8")
    clauses = split_clauses(markdown)

    if not clauses:
        raise ValueError("색인할 특약 섹션이 없습니다.")

    embedding_client = OpenAI(
        api_key=settings.upstage_api_key,
        base_url="https://api.upstage.ai/v1/solar",
    )

    texts = [clause["content"] for clause in clauses]

    embedding_response = embedding_client.embeddings.create(
        model=settings.upstage_passage_embedding_model,
        input=texts,
    )

    embeddings = [item.embedding for item in embedding_response.data]

    chroma_path = ROOT_DIR / settings.chroma_db_path
    chroma_client = chromadb.PersistentClient(path=str(chroma_path))

    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    collection.upsert(
        ids=[
            f"contract_monitoring_rules:{clause['code']}"
            for clause in clauses
        ],
        documents=texts,
        embeddings=embeddings,
        metadatas=[
            {
                "source_id": "contract_monitoring_rules",
                "clause_code": clause["code"],
                "title": clause["title"],
            }
            for clause in clauses
        ],
    )

    print(f"{len(clauses)}개 특약 청크를 색인했습니다.")
    print(f"ChromaDB 경로: {chroma_path}")
    print(f"Collection 문서 수: {collection.count()}")

# 실행
if __name__ == "__main__":
    ingest()
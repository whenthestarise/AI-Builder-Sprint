from dataclasses import dataclass
from pathlib import Path

import chromadb
from openai import OpenAI

from app.config import get_settings


ROOT_DIR = Path(__file__).resolve().parents[2]
COLLECTION_NAME = "contract_monitoring_rules"

BEHAVIOR_TRIGGER_WORDS = (
    "분리불안",
    "공격성",
    "지속적인 짖음",
)


@dataclass(frozen=True)
class RetrievedClause:
    code: str
    title: str
    content: str
    source_id: str
    distance: float

# 적용할 특약 코드 결정
def get_applicable_clause_codes(
    behavior_tags: list[str],
    health_signals: list[str],
) -> list[str]:
    codes = ["INITIAL_MONITORING"]

    behavior_text = " ".join(behavior_tags)

    if any(word in behavior_text for word in BEHAVIOR_TRIGGER_WORDS):
        codes.append("BEHAVIOR_RETURN")

    if health_signals:
        codes.append("HEALTH_CARE")

    return codes

# RAG 검색어(벡터 검색용)
def build_query_text(
    behavior_tags: list[str],
    health_signals: list[str],
) -> str:
    behavior_text = ", ".join(behavior_tags) or "특이사항 없음"
    health_text = ", ".join(health_signals) or "특이사항 없음"

    return f"""입양 계약 특약 및 안부 인증 기준을 검색한다.

행동 특성: {behavior_text}
건강 특성 또는 이상 징후: {health_text}
"""

# ChromaDB에서 특약 원문 검색
def retrieve_relevant_clauses(
    *,
    behavior_tags: list[str],
    health_signals: list[str],
) -> list[RetrievedClause]:
    settings = get_settings()

    applicable_codes = get_applicable_clause_codes(
        behavior_tags=behavior_tags,
        health_signals=health_signals,
    )

    embedding_client = OpenAI(
        api_key=settings.upstage_api_key,
        base_url="https://api.upstage.ai/v1/solar",
    )

    query_response = embedding_client.embeddings.create(
        model=settings.upstage_query_embedding_model,
        input=build_query_text(
            behavior_tags=behavior_tags,
            health_signals=health_signals,
        ),
    )

    query_embedding = query_response.data[0].embedding

    chroma_path = ROOT_DIR / settings.chroma_db_path
    chroma_client = chromadb.PersistentClient(path=str(chroma_path))

    try:
        collection = chroma_client.get_collection(
            name=COLLECTION_NAME,
        )
    except Exception as error:
        raise RuntimeError(
            "RAG 컬렉션이 없습니다. "
            "먼저 python -m scripts.ingest_knowledge 를 실행하세요."
        ) from error

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=len(applicable_codes),
        where={"clause_code": {"$in": applicable_codes}},
        include=["documents", "metadatas", "distances"],
    )

    clauses: list[RetrievedClause] = []

    for document, metadata, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        clauses.append(
            RetrievedClause(
                code=metadata["clause_code"],
                title=metadata["title"],
                content=document,
                source_id=metadata["source_id"],
                distance=distance,
            )
        )

    return clauses

# LLM용 텍스트
def format_clauses_for_prompt(
    clauses: list[RetrievedClause],
) -> str:
    return "\n\n".join(
        f"""[출처: {clause.source_id} / 코드: {clause.code}]
제목: {clause.title}
내용:
{clause.content}"""
        for clause in clauses
    )

# RAG 문서에서 계약 특약 원문만 추출
def extract_contract_clause_text(clause: RetrievedClause) -> str:
    marker = "### 계약 특약 원문"

    if marker not in clause.content:
        raise ValueError(
            f"{clause.code} 문서에서 계약 특약 원문을 찾지 못했습니다."
        )

    after_marker = clause.content.split(marker, 1)[1].strip()

    if "### " in after_marker:
        after_marker = after_marker.split("### ", 1)[0].strip()

    return after_marker
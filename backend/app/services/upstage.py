import json

from openai import OpenAI

from app.config import get_settings
from app.services.rag import (
    extract_contract_clause_text,
    format_clauses_for_prompt,
    retrieve_relevant_clauses,
)


SYSTEM_PROMPT = """
너는 유기견 보호소의 입양 계약 관리 AI다.

제공된 동물 정보, 입양자 정보, RAG 특약 기준을 바탕으로
적용된 특약의 이유를 한 문장으로 요약한다.

규칙:
- RAG 기준에 없는 의무, 기간, 증빙, 위험 신호를 만들지 않는다.
- 특약 문구 자체는 서버가 RAG 원문으로 처리한다.
- ai_summary에는 새로운 계약 의무를 추가하지 않는다.
- 반드시 JSON만 반환한다.

반환 형식:
{
  "ai_summary": "적용된 특약의 이유를 한 문장으로 요약"
}
"""


CLAUSE_ORDER = {
    "HEALTH_CARE": 1,
    "BEHAVIOR_RETURN": 2,
    "INITIAL_MONITORING": 3,
}


def _parse_json_response(content: str) -> dict:
    cleaned_content = content.strip()

    if cleaned_content.startswith("```"):
        cleaned_content = cleaned_content.split("```", 2)[1]

        if cleaned_content.startswith("json"):
            cleaned_content = cleaned_content[4:]

    return json.loads(cleaned_content.strip())


def _extract_rag_signals(special_notes: str) -> tuple[list[str], list[str]]:
    behavior_keywords = (
        "분리불안",
        "공격성",
        "지속적인 짖음",
        "지속적 짖음",
    )

    health_keywords = (
        "기저질환",
        "건강 이상",
        "질환",
        "슬개골",
        "관절",
        "심장",
        "식욕 저하",
        "구토",
        "혈변",
        "투약",
    )

    behavior_tags = [
        keyword for keyword in behavior_keywords
        if keyword in special_notes
    ]

    health_signals = [
        keyword for keyword in health_keywords
        if keyword in special_notes
    ]

    return behavior_tags, health_signals


def generate_contract_preview(
    *,
    pet_name: str,
    pet_age: str,
    pet_breed: str,
    special_notes: str,
    adopter_name: str,
    household_type: str,
    housing_type: str,
    pet_experience: str,
) -> dict:
    behavior_tags, health_signals = _extract_rag_signals(special_notes)

    retrieved_clauses = retrieve_relevant_clauses(
        behavior_tags=behavior_tags,
        health_signals=health_signals,
    )

    retrieved_clauses.sort(
        key=lambda clause: CLAUSE_ORDER[clause.code]
    )

    custom_clauses = [
        extract_contract_clause_text(clause)
        for clause in retrieved_clauses
    ]

    rag_context = format_clauses_for_prompt(retrieved_clauses)

    settings = get_settings()

    user_prompt = f"""
[동물 정보]
- 이름: {pet_name}
- 나이: {pet_age}
- 품종: {pet_breed}
- 특이사항: {special_notes}

[입양자 정보]
- 이름: {adopter_name}
- 가구 형태: {household_type}
- 주거 형태: {housing_type}
- 반려동물 양육 경험: {pet_experience}

[RAG 특약 기준]
{rag_context}
"""

    client = OpenAI(
        api_key=settings.upstage_api_key,
        base_url="https://api.upstage.ai/v1",
    )

    response = client.chat.completions.create(
        model=settings.upstage_chat_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Upstage AI가 빈 응답을 반환했습니다.")

    result = _parse_json_response(content)

    return {
        "ai_summary": result["ai_summary"],
        "custom_clauses": custom_clauses,
    }
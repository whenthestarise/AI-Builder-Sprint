import json

from openai import OpenAI

from app.config import get_settings


SYSTEM_PROMPT = """너는 동물보호소의 전문 입양 코디네이터이자 반려견 행동 전문가야.
제공되는 [동물 정보]와 [입양 신청자 정보]를 분석하여, 아래 3가지 항목을 반드시 JSON 형식으로만 응답해줘.

{
  "contractClauses": ["계약서에 넣을 맞춤형 특약 1", "계약서에 넣을 맞춤형 특약 2"],
  "dashboardTips": ["실행 가능한 돌봄 팁 1", "실행 가능한 돌봄 팁 2"],
  "monitoringCheckItem": {
    "question": "D+30 사후관리 인증 때 확인할 질문 1개",
    "riskSignal": "주의가 필요한 위험 신호 1개"
  }
}

contractClauses와 dashboardTips는 각각 정확히 2개여야 한다.
제공되지 않은 사실을 만들지 말고, 법률적 효력을 단정하지 마라.
동물의 배변 선호가 실외인 경우, 실내 배변 장소를 권장하지 말고 산책/외출 루틴 중심으로 안내하라.
마크다운 코드 블록이나 JSON 외의 설명은 절대 추가하지 마라."""


def _parse_json_response(content: str) -> dict:
    normalized = content.strip()
    if normalized.startswith("```"):
        normalized = normalized.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(normalized)


def generate_contract_preview(
    *,
    animal_name: str,
    behavior_tags: list[str],
    housing: str,
    average_away_hours: float,
    care_experience: str,
) -> dict:
    settings = get_settings()
    behavior_tag_text = ", ".join(behavior_tags) or "특이사항 없음"
    user_prompt = f"""[동물 정보]
이름: {animal_name}
행동 태그: {behavior_tag_text}

[입양 신청자 정보]
주거: {housing}
외출: 하루 평균 {average_away_hours:g}시간
양육 경험: {care_experience}"""

    client = OpenAI(
        api_key=settings.upstage_api_key,
        base_url="https://api.upstage.ai/v1",
    )

    response = client.chat.completions.create(
        model=settings.upstage_chat_model,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("Upstage returned an empty response")

    return _parse_json_response(content)

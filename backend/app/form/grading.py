from datetime import datetime
from typing import Literal

from app.form.schemas import RiskLevel


RISK_ORDER: dict[RiskLevel, int] = {
    "green": 1,
    "yellow": 2,
    "orange": 3,
    "red": 4,
}

ANSWER_RISK_MAP: dict[str, dict[str, RiskLevel]] = {
    "appetite": {
        "good": "green",
        "slightly_less": "yellow",
        "almost_none": "orange",
    },
    "condition": {
        "active": "green",
        "calmer": "yellow",
        "abnormal": "orange",
    },
    "toilet": {
        "normal": "green",
        "slightly_abnormal": "yellow",
        "emergency": "red",
    },
    "familyReaction": {
        "adapted": "green",
        "stressed": "yellow",
    },
    "separationReaction": {
        "calm": "green",
        "anxious": "orange",
    },
    "animalRegistration": {
        "completed": "green",
        "waiting": "yellow",
        "not_started": "orange",
    },
    "medicalCare": {
        "completed": "green",
        "delayed": "yellow",
        "not_started": "orange",
    },
    "socialReaction": {
        "social": "green",
        "guarded": "yellow",
        "aggressive": "orange",
    },
    "weightChange": {
        "stable": "green",
        "slight_change": "yellow",
        "large_change": "orange",
    },
}

BODY_SYMPTOM_RISK_MAP: dict[str, RiskLevel] = {
    "healthy": "green",
    "observe": "yellow",
    "warning": "orange",
}


def calculate_response_risk(
    answers: dict[str, str],
    body_symptoms: list[str],
) -> RiskLevel:
    """
    자동 등급 분류 알고리즘 (Rule-based Engine)
    폼 제출 직후 아래 규칙에 따라 즉시 위험 등급을 계산합니다.

    Red (긴급) 판정 조건:
      - 식욕 전면 거부(almost_none) + 배변 응급(emergency)
      - 배뇨 곤란 또는 심각한 부상 (toilet=emergency)
      - 동물등록 고의 거부(not_started) + 건강 이상 2건 이상 동시
      - body_symptoms에 warning 포함 + 식욕/컨디션 모두 이상

    Orange (주의) 판정 조건:
      - 식욕 거부(almost_none) 또는 지속적 이상(abnormal)
      - 동물등록 미완료(not_started)이거나 증빙 누락
      - body_symptoms에 warning 포함
      - 공격성(aggressive) 또는 분리불안(anxious)
      - yellow 2건 이상 동시 발생

    Yellow (관찰) 판정 조건:
      - 경미한 이상 1~2건 (slightly_less, calmer, slightly_abnormal 등)
      - body_symptoms에 observe 포함
      - 분리불안 징후(anxious)이면서 다른 문항 정상

    Green (정상) 판정 조건:
      - 모든 건강/식욕 문항 '정상' 선택
      - body_symptoms가 healthy만 포함
      - 동물등록/예방접종 완료
    """
    risks: list[RiskLevel] = []

    for question_id, selected_value in answers.items():
        mapped_risk = ANSWER_RISK_MAP.get(question_id, {}).get(selected_value)
        if mapped_risk:
            risks.append(mapped_risk)

    for symptom in body_symptoms:
        mapped_risk = BODY_SYMPTOM_RISK_MAP.get(symptom)
        if mapped_risk:
            risks.append(mapped_risk)

    # --- Red (긴급) 판정 ---
    has_appetite_refuse = answers.get("appetite") == "almost_none"
    has_toilet_emergency = answers.get("toilet") == "emergency"
    has_body_warning = "warning" in body_symptoms
    has_condition_abnormal = answers.get("condition") == "abnormal"
    has_registration_refused = answers.get("animalRegistration") == "not_started"

    # 식욕 전면 거부 + 배변 응급
    if has_appetite_refuse and has_toilet_emergency:
        return "red"

    # 배뇨 곤란 / 심각한 부상 단독
    if has_toilet_emergency:
        return "red"

    # 동물등록 고의 거부 + 건강 이상 2건 이상
    if has_registration_refused:
        health_issues = sum(1 for r in risks if r in ("orange", "red"))
        if health_issues >= 2:
            return "red"

    # body_symptoms warning + 식욕/컨디션 모두 이상
    if has_body_warning and has_appetite_refuse and has_condition_abnormal:
        return "red"

    # 어떤 단일 문항이라도 red
    if "red" in risks:
        return "red"

    # --- Orange (주의) 판정 ---
    # 식욕 거부 단독
    if has_appetite_refuse:
        return "orange"

    # 동물등록 미완료
    if has_registration_refused:
        return "orange"

    # body_symptoms에 warning 포함
    if has_body_warning:
        return "orange"

    # 공격성 또는 분리불안 + 다른 이상
    has_aggressive = answers.get("socialReaction") == "aggressive"
    has_anxious = answers.get("separationReaction") == "anxious"

    if has_aggressive:
        return "orange"

    # orange 문항이 하나라도 있으면
    if "orange" in risks:
        return "orange"

    # yellow 2건 이상 동시 → orange 승격
    yellow_count = risks.count("yellow")
    if yellow_count >= 2:
        return "orange"

    # --- Yellow (관찰) 판정 ---
    # 분리불안 단독 (다른 문항 정상)
    if has_anxious:
        return "yellow"

    # body_symptoms에 observe 포함
    if "observe" in body_symptoms:
        return "yellow"

    # 경미한 이상 1건
    if yellow_count == 1:
        return "yellow"

    # --- Green (정상) 판정 ---
    return "green"


def calculate_time_risk(
    *,
    sent_at: datetime | None,
    now: datetime,
    submitted: bool,
) -> tuple[RiskLevel, str]:
    """
    응답 성실도 (연락 두절) 판정:
      - 제출 완료: green
      - 7일 이상 미제출: red (긴급 - 24시간 이내 긴급 가정방문)
      - 3일 이상 미제출: orange (주의)
      - 그 외: green (대기중)
    """
    if submitted or sent_at is None:
        return "green", "[제출 완료]"

    delayed_days = (now - sent_at).days

    if delayed_days > 7:
        return "red", f"[미제출 ({delayed_days}일 지연 - 긴급)]"

    if delayed_days > 3:
        return "orange", f"[미제출 ({delayed_days}일 지연)]"

    return "green", "[제출 대기중]"


def max_risk(*risks: RiskLevel) -> RiskLevel:
    return max(risks, key=lambda risk: RISK_ORDER[risk])


def approval_status_for_submission() -> Literal["검토대기 (미승인)"]:
    return "검토대기 (미승인)"

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
    risks: list[RiskLevel] = []

    for question_id, selected_value in answers.items():
        mapped_risk = ANSWER_RISK_MAP.get(question_id, {}).get(selected_value)
        if mapped_risk:
            risks.append(mapped_risk)

    for symptom in body_symptoms:
        mapped_risk = BODY_SYMPTOM_RISK_MAP.get(symptom)
        if mapped_risk:
            risks.append(mapped_risk)

    if "red" in risks:
        return "red"

    yellow_count = risks.count("yellow")

    if "orange" in risks or yellow_count >= 2:
        return "orange"

    if yellow_count == 1:
        return "yellow"

    return "green"


def calculate_time_risk(
    *,
    sent_at: datetime | None,
    now: datetime,
    submitted: bool,
) -> tuple[RiskLevel, str]:
    if submitted or sent_at is None:
        return "green", "[제출 완료]"

    delayed_days = (now - sent_at).days

    if delayed_days > 7:
        return "orange", "[미제출 (7일 지연)]"

    if delayed_days > 3:
        return "yellow", "[미제출 (3일 지연)]"

    return "green", "[제출 대기중]"


def max_risk(*risks: RiskLevel) -> RiskLevel:
    return max(risks, key=lambda risk: RISK_ORDER[risk])


def approval_status_for_submission() -> Literal["검토대기 (미승인)"]:
    return "검토대기 (미승인)"

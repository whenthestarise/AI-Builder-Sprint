from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from app.form.database import (
    get_connection,
    initialize_database,
    load_datetime,
    load_json,
)
from app.risk.schemas import (
    CertificationAnswer,
    Contract,
    RiskCertificationCard,
    RiskConfig,
    RiskDashboardData,
    RiskDashboardModalViewModel,
    RiskDashboardViewModel,
    RiskFallbackRow,
    RiskGradeOption,
    RiskUpcomingTimeline,
    TimelineEvent,
)


FORM_RISK_TO_CONTRACT_RISK = {
    "green": "normal",
    "yellow": "warning",
    "orange": "warning",
    "red": "urgent",
}

FORM_RISK_TO_MANUAL_GRADE = {
    "green": "normal",
    "yellow": "observe",
    "orange": "caution",
    "red": "urgent",
}

FORM_RISK_TO_TIMELINE_TONE = {
    "green": "normal",
    "yellow": "warning",
    "orange": "warning",
    "red": "urgent",
}

FORM_RISK_TO_BADGE = {
    "green": (
        "\uC815\uC0C1",
        "border-emerald-400 bg-emerald-500 text-white",
        "bg-emerald-200",
    ),
    "yellow": (
        "\uAD00\uCC30",
        "border-yellow-400 bg-yellow-400 text-yellow-950",
        "bg-yellow-200",
    ),
    "orange": (
        "\uC8FC\uC758",
        "border-orange-400 bg-orange-500 text-white",
        "bg-orange-200",
    ),
    "red": (
        "\uAE34\uAE09 \uC870\uCE58 \uD544\uC694",
        "border-red-400 bg-red-500 text-white",
        "bg-red-200",
    ),
}

ROUND_DAYS = {
    1: 3,
    2: 7,
    3: 30,
    4: 90,
    5: 180,
    6: 365,
}

ANSWER_LABELS = {
    "appetite": "Q1. \uBC25\uC740 \uC798 \uBA39\uACE0 \uC788\uB098\uC694?",
    "condition": "Q2. \uD3C9\uC18C \uCEE8\uB514\uC158\uC740 \uC5B4\uB5A4\uAC00\uC694?",
    "toilet": "Q3. \uBC30\uBCC0 \uC0C1\uD0DC\uB294 \uC5B4\uB5A4\uAC00\uC694?",
    "familyReaction": "Q4. \uAC00\uC871\uACFC\uC758 \uBC18\uC751\uC740 \uC5B4\uB5A4\uAC00\uC694?",
    "separationReaction": "Q5. \uBD84\uB9AC \uBC18\uC751\uC740 \uC5B4\uB5A4\uAC00\uC694?",
    "animalRegistration": "Q6. \uB3D9\uBB3C\uB4F1\uB85D\uC740 \uC644\uB8CC\uD588\uB098\uC694?",
    "medicalCare": "Q7. \uC608\uBC29\uC811\uC885/\uC911\uC131\uD654\uB294 \uC644\uB8CC\uD588\uB098\uC694?",
    "socialReaction": "Q8. \uC678\uBD80 \uC0AC\uB78C/\uB3D9\uBB3C \uBC18\uC751\uC740 \uC5B4\uB5A4\uAC00\uC694?",
    "weightChange": "Q9. \uCCB4\uC911 \uBCC0\uD654\uAC00 \uC788\uB098\uC694?",
}

ANSWER_VALUE_LABELS = {
    "good": "\uC798 \uBA39\uC5B4\uC694",
    "slightly_less": "\uC870\uAE08 \uB35C \uBA39\uC5B4\uC694",
    "almost_none": "\uAC70\uC758 \uBA39\uC9C0 \uC54A\uC544\uC694",
    "active": "\uD65C\uBC1C\uD558\uACE0 \uC88B\uC544\uC694",
    "calmer": "\uC870\uAE08 \uCC28\uBD84\uD574\uC84C\uC5B4\uC694",
    "abnormal": "\uD3C9\uC18C\uC640 \uB2EC\uB77C\uC694",
    "normal": "\uC815\uC0C1\uC774\uC5D0\uC694",
    "slightly_abnormal": "\uC870\uAE08 \uC774\uC0C1\uD574\uC694",
    "emergency": "\uC751\uAE09 \uC99D\uC0C1\uC774 \uC788\uC5B4\uC694",
    "adapted": "\uC798 \uC801\uC751\uD588\uC5B4\uC694",
    "stressed": "\uC2A4\uD2B8\uB808\uC2A4\uB97C \uBCF4\uC5EC\uC694",
    "calm": "\uCC28\uBD84\uD574\uC694",
    "anxious": "\uBD88\uC548\uD574\uD574\uC694",
    "completed": "\uC644\uB8CC\uD588\uC5B4\uC694",
    "waiting": "\uC9C4\uD589 \uC608\uC815\uC774\uC5D0\uC694",
    "not_started": "\uC544\uC9C1 \uC2DC\uC791\uD558\uC9C0 \uC54A\uC558\uC5B4\uC694",
    "delayed": "\uC9C0\uC5F0\uB418\uACE0 \uC788\uC5B4\uC694",
    "social": "\uC0AC\uD68C\uC801\uC774\uC5D0\uC694",
    "guarded": "\uACBD\uACC4\uD574\uC694",
    "aggressive": "\uACF5\uACA9\uC801\uC778 \uBC18\uC751\uC774 \uC788\uC5B4\uC694",
    "stable": "\uC548\uC815\uC801\uC774\uC5D0\uC694",
    "slight_change": "\uC870\uAE08 \uBCC0\uD588\uC5B4\uC694",
    "large_change": "\uD070 \uBCC0\uD654\uAC00 \uC788\uC5B4\uC694",
    "healthy": "\uAC74\uAC15\uD574\uC694",
    "observe": "\uAD00\uCC30\uC774 \uD544\uC694\uD574\uC694",
    "warning": "\uC8FC\uC758\uAC00 \uD544\uC694\uD574\uC694",
}
ANSWER_TONE_MAP = {
    "slightly_less": "observe",
    "calmer": "observe",
    "slightly_abnormal": "observe",
    "stressed": "observe",
    "waiting": "observe",
    "delayed": "observe",
    "guarded": "observe",
    "slight_change": "observe",
    "almost_none": "caution",
    "abnormal": "caution",
    "anxious": "caution",
    "not_started": "caution",
    "aggressive": "caution",
    "large_change": "caution",
    "emergency": "caution",
}


def get_risk_dashboard_view_model() -> RiskDashboardViewModel:
    records = get_form_risk_records()
    contracts = build_contracts(records)

    return RiskDashboardViewModel(
        contracts=contracts,
        applicantPhone=get_primary_applicant_phone(records),
        timelineEvents=build_timeline_events(records),
        modalViewModels={
            contract.id: build_modal_view_model(contract, records.get(contract.id, []))
            for contract in contracts
        },
        riskConfig=get_risk_config(),
    )


def get_modal_view_model(contract_id: str) -> RiskDashboardModalViewModel:
    records = get_form_risk_records()
    contract = next(
        (item for item in build_contracts(records) if item.id == contract_id),
        None,
    )

    if not contract:
        return RiskDashboardModalViewModel(
            contract=None,
            dashboardData=None,
            upcomingTimeline=None,
            certificationCards=[],
        )

    return build_modal_view_model(contract, records.get(contract.id, []))


def approve_certification(
    contract_id: str,
    certification_id: str,
    approved_status: str,
) -> bool:
    initialize_database()

    with get_connection() as connection:
        result = connection.execute(
            """
            UPDATE certification_submissions
            SET
                highest_risk = 'green',
                final_risk = 'green',
                approval_status = ?,
                status_label = ?
            WHERE id = ? AND pet_id = ?
            """,
            (
                approved_status,
                approved_status,
                certification_id,
                contract_id,
            ),
        )

    return result.rowcount > 0


def get_form_risk_records() -> dict[str, list[dict[str, Any]]]:
    initialize_database()

    with get_connection() as connection:
        submissions = connection.execute(
            """
            SELECT
                s.id,
                s.pet_id,
                s.round,
                s.sent_at,
                s.submitted_at,
                s.final_risk,
                s.approval_status,
                s.status_label,
                s.answers_json,
                s.body_symptoms_json,
                s.text_inputs_json,
                s.files_json,
                p.pet_name,
                p.adopter_name,
                p.adoption_date
            FROM certification_submissions s
            JOIN pets p ON p.pet_id = s.pet_id
            ORDER BY s.submitted_at DESC
            """
        ).fetchall()
        missing_items = connection.execute(
            """
            SELECT
                m.id,
                m.pet_id,
                m.round,
                m.sent_at,
                m.checked_at,
                m.final_risk,
                m.approval_status,
                m.status_label,
                p.pet_name,
                p.adopter_name,
                p.adoption_date
            FROM missing_certifications m
            JOIN pets p ON p.pet_id = m.pet_id
            ORDER BY m.checked_at DESC
            """
        ).fetchall()

    records: dict[str, list[dict[str, Any]]] = defaultdict(list)
    submitted_rounds = {
        (row["pet_id"], row["round"])
        for row in submissions
    }

    for row in submissions:
        records[row["pet_id"]].append(
            {
                "kind": "submitted",
                "id": row["id"],
                "pet_id": row["pet_id"],
                "round": row["round"],
                "sent_at": load_datetime(row["sent_at"]),
                "event_at": load_datetime(row["submitted_at"]),
                "final_risk": row["final_risk"],
                "approval_status": row["approval_status"],
                "status_label": row["status_label"],
                "answers": load_json(row["answers_json"]),
                "body_symptoms": load_json(row["body_symptoms_json"]),
                "text_inputs": load_json(row["text_inputs_json"]),
                "files": load_json(row["files_json"]),
                "pet_name": row["pet_name"],
                "adopter_name": row["adopter_name"],
                "adoption_date": row["adoption_date"],
            }
        )

    for row in missing_items:
        if (row["pet_id"], row["round"]) in submitted_rounds:
            continue

        records[row["pet_id"]].append(
            {
                "kind": "missing",
                "id": row["id"],
                "pet_id": row["pet_id"],
                "round": row["round"],
                "sent_at": load_datetime(row["sent_at"]),
                "event_at": load_datetime(row["checked_at"]),
                "final_risk": row["final_risk"],
                "approval_status": row["approval_status"],
                "status_label": row["status_label"],
                "answers": {},
                "body_symptoms": [],
                "text_inputs": {},
                "files": [],
                "pet_name": row["pet_name"],
                "adopter_name": row["adopter_name"],
                "adoption_date": row["adoption_date"],
            }
        )

    for pet_records in records.values():
        pet_records.sort(
            key=lambda item: item["event_at"] or datetime.min,
            reverse=True,
        )
        seen_rounds = set()
        unique_records = []
        for record in pet_records:
            round_number = record["round"]
            if round_number in seen_rounds:
                continue

            seen_rounds.add(round_number)
            unique_records.append(record)

        pet_records[:] = unique_records

    return dict(records)


def build_contracts(records: dict[str, list[dict[str, Any]]]) -> list[Contract]:
    return [
        contract_from_records(pet_id, pet_records)
        for pet_id, pet_records in records.items()
        if pet_records
    ]


def contract_from_records(pet_id: str, records: list[dict[str, Any]]) -> Contract:
    latest = records[0]
    latest_risk = latest["final_risk"]
    latest_event_at = latest["event_at"]
    adoption_date = latest["adoption_date"] or format_date(latest_event_at)

    return Contract(
        id=pet_id,
        petName=latest["pet_name"],
        adopterName=latest["adopter_name"] or "\uC785\uC591\uC790 \uBBF8\uC785\uB825",
        status=status_for_record(latest),
        signedAt=adoption_date,
        nextCheck=next_check_label(latest),
        risk=FORM_RISK_TO_CONTRACT_RISK.get(latest_risk, "warning"),
        petType=pet_type_from_text(latest["text_inputs"]),
        adoptionDate=adoption_date,
        lastCertificationDate=last_certification_label(latest),
        certificationRound=latest["round"],
    )


def status_for_record(record: dict[str, Any]) -> str:
    if record["kind"] == "missing":
        return record["status_label"]

    risk = record["final_risk"]
    if risk == "green":
        return "\uAC80\uD1A0\uB300\uAE30 (\uC815\uC0C1)"
    if risk == "yellow":
        return "\uAC80\uD1A0\uB300\uAE30 (\uAD00\uCC30)"
    if risk == "orange":
        return "\uAC80\uD1A0\uB300\uAE30 (\uC8FC\uC758)"
    return "\uAC80\uD1A0\uB300\uAE30 (\uAE34\uAE09)"


def next_check_label(record: dict[str, Any]) -> str:
    if record["kind"] == "missing":
        return record["status_label"]

    return f"{round_day_label(record['round'])} \uC778\uC99D \uC81C\uCD9C \uC644\uB8CC"


def last_certification_label(record: dict[str, Any]) -> str:
    event_at = record["event_at"]
    if not event_at:
        return record["status_label"]

    date_label = format_date(event_at)
    if record["kind"] == "missing":
        return f"{date_label} {record['status_label']}"

    return f"{date_label} ({round_day_label(record['round'])})"


def build_timeline_events(
    records: dict[str, list[dict[str, Any]]],
) -> list[TimelineEvent]:
    events: list[TimelineEvent] = []

    for pet_records in records.values():
        for record in pet_records:
            events.append(
                TimelineEvent(
                    id=f"TL-{record['id']}",
                    title=timeline_title(record),
                    description=timeline_description(record),
                    date=format_date(record["event_at"]),
                    tone=FORM_RISK_TO_TIMELINE_TONE.get(
                        record["final_risk"],
                        "warning",
                    ),
                )
            )

    events.sort(key=lambda item: item.date, reverse=True)
    return events[:8]


def timeline_title(record: dict[str, Any]) -> str:
    action = "\uC778\uC99D \uBBF8\uC81C\uCD9C" if record["kind"] == "missing" else "\uC778\uC99D \uC81C\uCD9C"
    return f"{record['pet_name']} {round_day_label(record['round'])} {action}"


def timeline_description(record: dict[str, Any]) -> str:
    adopter_name = record["adopter_name"] or "\uC785\uC591\uC790 \uBBF8\uC785\uB825"
    if record["kind"] == "missing":
        return f"{adopter_name} \uBCF4\uD638\uC790\uC758 {round_day_label(record['round'])} \uC778\uC99D\uC774 \uC9C0\uC5F0\uB418\uC5B4 {record['status_label']} \uC0C1\uD0DC\uB85C \uBC18\uC601\uB418\uC5C8\uC2B5\uB2C8\uB2E4."

    grade, _, _ = FORM_RISK_TO_BADGE.get(
        record["final_risk"],
        FORM_RISK_TO_BADGE["orange"],
    )
    return f"{adopter_name} \uBCF4\uD638\uC790\uC758 {round_day_label(record['round'])} \uC81C\uCD9C \uC751\uB2F5\uC774 {grade} \uB4F1\uAE09\uC73C\uB85C \uBC18\uC601\uB418\uC5C8\uC2B5\uB2C8\uB2E4."

def build_modal_view_model(
    contract: Contract,
    records: list[dict[str, Any]],
) -> RiskDashboardModalViewModel:
    return RiskDashboardModalViewModel(
        contract=contract,
        dashboardData=get_dashboard_data(contract, records[0] if records else None),
        upcomingTimeline=get_upcoming_timeline(contract, records[0] if records else None),
        certificationCards=[
            certification_card_from_record(record)
            for record in records
        ],
    )


def get_dashboard_data(
    contract: Contract,
    latest_record: dict[str, Any] | None,
) -> RiskDashboardData:
    risk = latest_record["final_risk"] if latest_record else "orange"
    header_status, badge_class, dot_class = FORM_RISK_TO_BADGE.get(
        risk,
        FORM_RISK_TO_BADGE["orange"],
    )

    return RiskDashboardData(
        headerStatus=header_status,
        headerBadgeClass=badge_class,
        headerDotClass=dot_class,
        behaviorTrait=behavior_trait_from_record(latest_record),
        signedDate=contract.signedAt,
    )


def get_upcoming_timeline(
    contract: Contract,
    latest_record: dict[str, Any] | None,
) -> RiskUpcomingTimeline:
    base_date = latest_record["event_at"] if latest_record else None
    next_date = (base_date + timedelta(days=30)) if base_date else None

    return RiskUpcomingTimeline(
        label="Upcoming Timeline",
        title="\uB2E4\uC74C \uC608\uC815: \uC815\uAE30 \uC548\uBD80 \uC778\uC99D",
        description=(
            f"\uC608\uC815 \uC77C\uC790: {format_date(next_date)} 夷?\uC790\uB3D9 \uB9AC\uB9C8\uC778\uB4DC \uB300\uAE30\uC911"
            if next_date
            else "\uB2E4\uC74C \uC548\uBD80 \uC778\uC99D \uC77C\uC815\uC774 \uB300\uAE30\uC911\uC785\uB2C8\uB2E4."
        ),
        buttonLabel="\uC0AC\uC804 \uC548\uB0B4 \uBC1C\uC1A1",
    )

def certification_card_from_record(record: dict[str, Any]) -> RiskCertificationCard:
    if record["kind"] == "missing":
        return RiskCertificationCard(
            id=record["id"],
            contractId=record["pet_id"],
            tone="caution",
            title=f"{round_day_label(record['round'])} \uC548\uBD80 \uC778\uC99D \uBBF8\uC81C\uCD9C",
            description=record["status_label"],
            status=record["approval_status"],
            submittedAt=format_datetime(record["event_at"]),
            roundLabel=round_label(record["round"]),
            answers=[],
        )

    return RiskCertificationCard(
        id=record["id"],
        contractId=record["pet_id"],
        tone="approved" if record["final_risk"] == "green" else "caution",
        title=f"{round_day_label(record['round'])} \uC548\uBD80 \uC778\uC99D \uC81C\uCD9C \uAC74",
        description=summary_from_record(record),
        status=record["approval_status"],
        submittedAt=format_datetime(record["event_at"]),
        roundLabel=round_label(record["round"]),
        imageUrl=image_url_from_files(record["files"]),
        answers=answers_from_record(record),
    )

def answers_from_record(record: dict[str, Any]) -> list[CertificationAnswer]:
    answers = []

    for question_id, value in record["answers"].items():
        tone = ANSWER_TONE_MAP.get(value, "normal")
        answers.append(
            CertificationAnswer(
                question=ANSWER_LABELS.get(question_id, question_id),
                answer=ANSWER_VALUE_LABELS.get(value, value),
                tone=tone,
                highlighted=tone != "normal",
            )
        )

    for symptom in record["body_symptoms"]:
        tone = "normal" if symptom == "healthy" else "observe"
        if symptom == "warning":
            tone = "caution"

        answers.append(
            CertificationAnswer(
                question="\uAC74\uAC15 \uC774\uC0C1 \uC99D\uC0C1",
                answer=ANSWER_VALUE_LABELS.get(symptom, symptom),
                tone=tone,
                highlighted=tone != "normal",
            )
        )

    for key, value in record["text_inputs"].items():
        if value:
            answers.append(
                CertificationAnswer(
                    question=key,
                    answer=value,
                    tone="normal",
                )
            )

    return answers


def summary_from_record(record: dict[str, Any]) -> str:
    text_inputs = record["text_inputs"]
    for key in ("specialNote", "memo", "note", "description"):
        value = text_inputs.get(key)
        if value:
            return f'"{value}"'

    grade, _, _ = FORM_RISK_TO_BADGE.get(
        record["final_risk"],
        FORM_RISK_TO_BADGE["orange"],
    )
    return f"{grade} \uB4F1\uAE09\uC73C\uB85C \uC0B0\uC815\uB41C \uC778\uC99D \uC81C\uCD9C \uAC74\uC785\uB2C8\uB2E4."


def behavior_trait_from_record(record: dict[str, Any] | None) -> str:
    if not record:
        return "\uC548\uBD80 \uC778\uC99D \uBAA8\uB2C8\uD130\uB9C1"

    text_inputs = record["text_inputs"]
    return (
        text_inputs.get("behaviorTrait")
        or text_inputs.get("specialNote")
        or "\uC548\uBD80 \uC778\uC99D \uBAA8\uB2C8\uD130\uB9C1"
    )


def image_url_from_files(files: list[dict[str, Any]]) -> str | None:
    if not files:
        return None

    return None


def pet_type_from_text(text_inputs: dict[str, str]) -> str:
    return (
        text_inputs.get("petType")
        or text_inputs.get("breed")
        or "\uBC18\uB824\uB3D9\uBB3C"
    )

def get_primary_applicant_phone(records: dict[str, list[dict[str, Any]]]) -> str:
    for pet_records in records.values():
        for record in pet_records:
            phone = record["text_inputs"].get("phone")
            if phone:
                return phone

    return ""


def get_risk_config() -> RiskConfig:
    return RiskConfig(
        gradeOptions=[
            RiskGradeOption(
                value="urgent",
                label="\uAE34\uAE09 (Red)",
                shortLabel="\uAE34\uAE09",
                badgeClass="border-red-400 bg-red-500 text-white",
                dotClass="bg-red-200",
                textClass="text-red-600",
            ),
            RiskGradeOption(
                value="caution",
                label="\uC8FC\uC758 (Orange)",
                shortLabel="\uC8FC\uC758",
                badgeClass="border-orange-400 bg-orange-500 text-white",
                dotClass="bg-orange-200",
                textClass="text-orange-600",
            ),
            RiskGradeOption(
                value="observe",
                label="\uAD00\uCC30 (Yellow)",
                shortLabel="\uAD00\uCC30",
                badgeClass="border-yellow-400 bg-yellow-400 text-yellow-950",
                dotClass="bg-yellow-200",
                textClass="text-yellow-600",
            ),
            RiskGradeOption(
                value="normal",
                label="\uC815\uC0C1 (Green)",
                shortLabel="\uC815\uC0C1",
                badgeClass="border-emerald-400 bg-emerald-500 text-white",
                dotClass="bg-emerald-200",
                textClass="text-emerald-600",
            ),
        ],
        reasonCategories=[
            "\uC5F0\uB77D \uB450\uC808",
            "\uC548\uBD80 \uC778\uC99D \uBBF8\uC81C\uCD9C",
            "\uC548\uBD80 \uC778\uC99D \uC9C0\uC5F0",
            "\uAC74\uAC15 \uC774\uC0C1 \uC9D5\uD6C4",
            "\uC8FC\uAC70 \uD658\uACBD \uBB38\uC81C",
            "\uACC4\uC57D \uC704\uBC18 \uC758\uC2EC",
            "\uAE30\uD0C0 \uC0AC\uC720",
        ],
        actionOptions=[
            "\uC6B0\uC120 \uC804\uD654 \uC0C1\uB2F4 \uC644\uB8CC",
            "\uD544\uC218 \uC758\uBB34 \uBBF8\uC774\uD589 \uC548\uB0B4 \uBC1C\uC1A1",
            "\uC81C\uD734 \uB3D9\uBB3C\uBCD1\uC6D0 \uAC74\uAC15\uC0C1\uB2F4 \uB9C1\uD06C \uBC1C\uC1A1",
            "\uB2E4\uC74C \uC548\uBD80 \uC8FC\uAE30 \uC9D1\uC911 \uBAA8\uB2C8\uD130\uB9C1 \uB300\uC0C1\uC73C\uB85C \uD0DC\uADF8 \uC9C0\uC815",
        ],
        fallbackRows=[
            RiskFallbackRow(
                adoptionDate="",
                lastCertificationDate="",
                petType="\uBC18\uB824\uB3D9\uBB3C",
            ),
        ],
    )

def format_date(value: datetime | None) -> str:
    return value.strftime("%Y.%m.%d") if value else ""


def format_datetime(value: datetime | None) -> str:
    return value.strftime("%Y.%m.%d %H:%M") if value else None


def round_day(round_number: int) -> int:
    return ROUND_DAYS.get(round_number, round_number)


def round_day_label(round_number: int) -> str:
    return f"D+{round_day(round_number)}"


def round_label(round_number: int) -> str:
    return f"{round_number}?????({round_day_label(round_number)})"

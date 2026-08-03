"""
Seed script to populate the form.db with 4 contracts and their certification histories.
All form fields are included to match what the certification form submits.

Run: python seed_risk_data.py
"""

import json
import sqlite3
import uuid
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "form.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS pets (
            pet_id TEXT PRIMARY KEY,
            pet_name TEXT NOT NULL,
            adopter_name TEXT,
            adoption_date TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS certification_submissions (
            id TEXT PRIMARY KEY,
            pet_id TEXT NOT NULL,
            round INTEGER NOT NULL,
            sent_at TEXT,
            submitted_at TEXT NOT NULL,
            highest_risk TEXT NOT NULL,
            response_risk TEXT NOT NULL,
            time_risk TEXT NOT NULL,
            final_risk TEXT NOT NULL,
            approval_status TEXT NOT NULL,
            status_label TEXT NOT NULL,
            answers_json TEXT NOT NULL,
            body_symptoms_json TEXT NOT NULL,
            text_inputs_json TEXT NOT NULL,
            files_json TEXT NOT NULL,
            manager_actions_json TEXT NOT NULL DEFAULT '[]',
            manager_comment TEXT NOT NULL DEFAULT '',
            manual_grade TEXT NOT NULL DEFAULT '',
            manual_category TEXT NOT NULL DEFAULT '',
            manual_reason TEXT NOT NULL DEFAULT '',
            FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
        );

        CREATE TABLE IF NOT EXISTS missing_certifications (
            id TEXT PRIMARY KEY,
            pet_id TEXT NOT NULL,
            round INTEGER NOT NULL,
            sent_at TEXT NOT NULL,
            checked_at TEXT NOT NULL,
            time_risk TEXT NOT NULL,
            final_risk TEXT NOT NULL,
            approval_status TEXT NOT NULL,
            status_label TEXT NOT NULL,
            FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
        );
        """
    )


def dump_json(value) -> str:
    return json.dumps(value, ensure_ascii=False)


def gen_id() -> str:
    return str(uuid.uuid4())[:8]


def insert_submission(connection, pet_id, round_num, sent, submitted, final_risk, status, label, answers, body_symptoms, text_inputs):
    connection.execute(
        """INSERT INTO certification_submissions
        (id, pet_id, round, sent_at, submitted_at, highest_risk, response_risk, time_risk, final_risk, approval_status, status_label, answers_json, body_symptoms_json, text_inputs_json, files_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            gen_id(), pet_id, round_num, sent, submitted,
            final_risk, final_risk, "green", final_risk,
            status, label,
            dump_json(answers), dump_json(body_symptoms), dump_json(text_inputs), dump_json([]),
        ),
    )


def seed():
    connection = get_connection()
    initialize_database(connection)

    # Clear existing data
    connection.execute("DELETE FROM certification_submissions")
    connection.execute("DELETE FROM missing_certifications")
    delete_table_if_exists(connection, "monitoring_schedules")
    delete_table_if_exists(connection, "contracts")
    connection.execute("DELETE FROM pets")
    connection.commit()

    # ===================================================================
    # PET-001: 두부 (정다은) - 포메라니안, 전체 정상
    # ===================================================================
    connection.execute(
        "INSERT INTO pets (pet_id, pet_name, adopter_name, adoption_date, created_at) VALUES (?, ?, ?, ?, ?)",
        ("PET-001", "두부", "정다은", "2026-06-01", "2026-06-01T00:00:00"),
    )

    # Round 1 (D+3): 초기 환경 적응
    insert_submission(connection, "PET-001", 1,
        "2026-06-04T00:00:00", "2026-06-04T11:20:00", "green", "승인완료", "승인완료",
        {"appetite": "good", "condition": "calmer", "toilet": "normal", "familyReaction": "adapted"},
        ["healthy"],
        {"phone": "010-3333-2222", "petType": "포메라니안", "specialNote": "입양 첫 날 잘 도착했습니다. 긴장하지만 밥은 먹어요."},
    )

    # Round 2 (D+7): 교감 및 분리불안
    insert_submission(connection, "PET-001", 2,
        "2026-06-08T00:00:00", "2026-06-08T09:00:00", "green", "승인완료", "승인완료",
        {"appetite": "good", "condition": "active", "toilet": "normal", "separationReaction": "calm"},
        ["healthy"],
        {"phone": "010-3333-2222", "petType": "포메라니안", "specialNote": "새 환경에 적응 중입니다. 밥은 잘 먹고 있어요."},
    )

    # Round 3 (D+30): 행정·의료 필수 검증
    insert_submission(connection, "PET-001", 3,
        "2026-07-01T00:00:00", "2026-07-01T10:15:00", "green", "승인완료", "승인완료",
        {"appetite": "good", "condition": "active", "toilet": "normal", "animalRegistration": "completed", "medicalCare": "completed"},
        ["healthy"],
        {"phone": "010-3333-2222", "petType": "포메라니안", "specialNote": "적응을 잘 하고 있어요. 동물등록과 예방접종 완료했습니다."},
    )

    # Round 4 (D+90): 장기 적응 및 사회성 - 검토대기
    insert_submission(connection, "PET-001", 4,
        "2026-07-29T00:00:00", "2026-07-29T14:30:00", "green", "검토대기", "검토대기 (미승인)",
        {"appetite": "good", "condition": "active", "toilet": "normal", "socialReaction": "social"},
        ["healthy"],
        {"phone": "010-3333-2222", "petType": "포메라니안", "specialNote": "건강하고 활발하게 잘 지내고 있습니다. 산책도 매일 하고 있어요."},
    )

    # ===================================================================
    # PET-002: 초코 (강민수) - 시바견, 분리불안 → 주의
    # ===================================================================
    connection.execute(
        "INSERT INTO pets (pet_id, pet_name, adopter_name, adoption_date, created_at) VALUES (?, ?, ?, ?, ?)",
        ("PET-002", "초코", "강민수", "2026-04-15", "2026-04-15T00:00:00"),
    )

    # Round 1 (D+3)
    insert_submission(connection, "PET-002", 1,
        "2026-04-18T00:00:00", "2026-04-18T09:30:00", "green", "승인완료", "승인완료",
        {"appetite": "slightly_less", "condition": "calmer", "toilet": "normal", "familyReaction": "stressed"},
        ["healthy"],
        {"phone": "010-4444-5555", "petType": "시바견", "specialNote": "처음이라 긴장하지만 잘 지내고 있어요."},
    )

    # Round 2 (D+7)
    insert_submission(connection, "PET-002", 2,
        "2026-04-22T00:00:00", "2026-04-22T10:00:00", "yellow", "승인완료", "승인완료",
        {"appetite": "good", "condition": "active", "toilet": "normal", "separationReaction": "anxious"},
        ["healthy"],
        {"phone": "010-4444-5555", "petType": "시바견", "specialNote": "혼자 두면 짖기 시작합니다. 분리불안 징후가 보여요."},
    )

    # Round 3 (D+30)
    insert_submission(connection, "PET-002", 3,
        "2026-05-15T00:00:00", "2026-05-15T13:20:00", "yellow", "승인완료", "승인완료",
        {"appetite": "good", "condition": "active", "toilet": "normal", "animalRegistration": "completed", "medicalCare": "delayed"},
        ["observe"],
        {"phone": "010-4444-5555", "petType": "시바견", "specialNote": "분리불안 증상이 있어요. 혼자 두면 많이 짖습니다.", "medicalDelayReason": "분리불안 상태라 중성화 수술을 미루고 있습니다.", "bodyObserveDetail": "피부를 가끔 긁는 모습이 보여요."},
    )

    # Round 4 (D+90) - 주의, 공격적 반응
    insert_submission(connection, "PET-002", 4,
        "2026-07-28T00:00:00", "2026-07-28T16:45:00", "orange", "검토대기", "검토대기 (미승인)",
        {"appetite": "good", "condition": "abnormal", "toilet": "slightly_abnormal", "socialReaction": "aggressive"},
        ["observe"],
        {"phone": "010-4444-5555", "petType": "시바견", "specialNote": "산책 시 다른 개에게 공격적 반응을 보이고 있어요. 상담 필요할 것 같습니다.", "bodyObserveDetail": "스트레스성 피부 긁기가 잦아졌어요."},
    )

    # ===================================================================
    # PET-003: 콩이 (이지은) - 푸들, 모범 사례
    # ===================================================================
    connection.execute(
        "INSERT INTO pets (pet_id, pet_name, adopter_name, adoption_date, created_at) VALUES (?, ?, ?, ?, ?)",
        ("PET-003", "콩이", "이지은", "2025-07-10", "2025-07-10T00:00:00"),
    )

    # Round 1 (D+3)
    insert_submission(connection, "PET-003", 1,
        "2025-07-13T00:00:00", "2025-07-13T10:30:00", "green", "승인완료", "승인완료",
        {"appetite": "slightly_less", "condition": "calmer", "toilet": "normal", "familyReaction": "adapted"},
        ["healthy"],
        {"phone": "010-9876-5432", "petType": "푸들", "specialNote": "새 집에 잘 도착했어요. 조금 긴장하지만 괜찮아요."},
    )

    # Round 2 (D+7)
    insert_submission(connection, "PET-003", 2,
        "2025-07-17T00:00:00", "2025-07-17T09:45:00", "green", "승인완료", "승인완료",
        {"appetite": "good", "condition": "active", "toilet": "normal", "separationReaction": "calm"},
        ["healthy"],
        {"phone": "010-9876-5432", "petType": "푸들", "specialNote": "점점 적응하고 있습니다. 낯가림이 줄었어요."},
    )

    # Round 3 (D+30)
    insert_submission(connection, "PET-003", 3,
        "2025-08-09T00:00:00", "2025-08-09T14:00:00", "green", "승인완료", "승인완료",
        {"appetite": "good", "condition": "active", "toilet": "normal", "animalRegistration": "completed", "medicalCare": "completed"},
        ["healthy"],
        {"phone": "010-9876-5432", "petType": "푸들", "specialNote": "완전히 적응했어요. 동물등록, 예방접종, 중성화 모두 완료!"},
    )

    # Round 4 (D+90)
    insert_submission(connection, "PET-003", 4,
        "2025-10-08T00:00:00", "2025-10-08T11:30:00", "green", "승인완료", "승인완료",
        {"appetite": "good", "condition": "active", "toilet": "normal", "socialReaction": "social"},
        ["healthy"],
        {"phone": "010-9876-5432", "petType": "푸들", "specialNote": "산책 시 다른 강아지와도 잘 어울려요."},
    )

    # Round 5 (D+180)
    insert_submission(connection, "PET-003", 5,
        "2026-01-06T00:00:00", "2026-01-06T08:00:00", "green", "승인완료", "승인완료",
        {"appetite": "good", "condition": "active", "toilet": "normal", "weightChange": "stable"},
        ["healthy"],
        {"phone": "010-9876-5432", "petType": "푸들", "specialNote": "건강하고 활기차게 잘 지내고 있어요. 체중도 안정적입니다.", "currentWeight": "5.2"},
    )

    # Round 6 (D+365) - 최종
    insert_submission(connection, "PET-003", 6,
        "2026-06-10T00:00:00", "2026-06-10T08:00:00", "green", "승인완료", "승인완료 (최종)",
        {"appetite": "good", "condition": "active", "toilet": "normal"},
        ["healthy"],
        {"phone": "010-9876-5432", "petType": "푸들", "specialNote": "1년간 건강하게 잘 지냈습니다. 가족 모두 행복해요."},
    )

    # ===================================================================
    # PET-004: 보리 (박서준) - 코숏, 위험
    # ===================================================================
    connection.execute(
        "INSERT INTO pets (pet_id, pet_name, adopter_name, adoption_date, created_at) VALUES (?, ?, ?, ?, ?)",
        ("PET-004", "보리", "박서준", "2026-02-01", "2026-02-01T00:00:00"),
    )

    # Round 1 (D+3) - 주의
    insert_submission(connection, "PET-004", 1,
        "2026-02-04T00:00:00", "2026-02-04T12:00:00", "orange", "승인완료", "승인완료",
        {"appetite": "almost_none", "condition": "abnormal", "toilet": "slightly_abnormal", "familyReaction": "stressed"},
        ["observe", "warning"],
        {"phone": "010-5555-4444", "petType": "코숏", "specialNote": "보리가 많이 겁먹어 있어요. 구석에 숨어 있습니다.", "bodyObserveDetail": "눈물이 많이 나고 있어요."},
    )

    # Round 2 (D+7) - 주의
    insert_submission(connection, "PET-004", 2,
        "2026-02-08T00:00:00", "2026-02-08T15:30:00", "orange", "승인완료", "승인완료",
        {"appetite": "almost_none", "condition": "abnormal", "toilet": "slightly_abnormal", "separationReaction": "anxious"},
        ["observe", "warning"],
        {"phone": "010-5555-4444", "petType": "코숏", "specialNote": "보리가 숨기 행동이 심합니다. 밥도 잘 안 먹어요.", "bodyObserveDetail": "여전히 눈물과 피부 긁기가 있어요."},
    )

    # Round 3 (D+30) - 미제출 (15일 지연)
    connection.execute(
        """INSERT INTO missing_certifications
        (id, pet_id, round, sent_at, checked_at, time_risk, final_risk, approval_status, status_label)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            gen_id(), "PET-004", 3,
            "2026-03-03T00:00:00", "2026-03-18T00:00:00",
            "red", "red",
            "미제출 (15일 지연)", "미제출 (15일 지연)",
        ),
    )

    connection.commit()
    connection.close()
    print("Database seeded successfully with 4 pets and full certification histories.")


def delete_table_if_exists(connection, table_name):
    table = connection.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    ).fetchone()
    if table:
        connection.execute(f"DELETE FROM {table_name}")


if __name__ == "__main__":
    seed()

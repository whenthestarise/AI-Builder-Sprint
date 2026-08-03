import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any


DB_PATH = Path(__file__).resolve().parents[2] / "form.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection

def ensure_column(
    connection: sqlite3.Connection,
    table_name: str,
    column_name: str,
    column_definition: str,
) -> None:
    columns = {
        row["name"]
        for row in connection.execute(
            f"PRAGMA table_info({table_name})"
        ).fetchall()
    }

    if column_name not in columns:
        connection.execute(
            f"ALTER TABLE {table_name} "
            f"ADD COLUMN {column_name} {column_definition}"
        )

def initialize_database() -> None:
    with get_connection() as connection:
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
                schedule_id TEXT,
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
                reviewed_at TEXT,
                FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
            );

            CREATE TABLE IF NOT EXISTS missing_certifications (
                id TEXT PRIMARY KEY,
                pet_id TEXT NOT NULL,
                round INTEGER NOT NULL,
                schedule_id TEXT,
                sent_at TEXT NOT NULL,
                checked_at TEXT NOT NULL,
                time_risk TEXT NOT NULL,
                final_risk TEXT NOT NULL,
                approval_status TEXT NOT NULL,
                status_label TEXT NOT NULL,
                manager_actions_json TEXT NOT NULL DEFAULT '[]',
                manager_comment TEXT,
                reviewed_at TEXT,
                FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
            );

             CREATE TABLE IF NOT EXISTS contracts (
                contract_id TEXT PRIMARY KEY,
                pet_id TEXT NOT NULL,
                adopter_name TEXT NOT NULL,
                applicant_phone TEXT,
                status TEXT NOT NULL,
                signed_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
            );

            CREATE TABLE IF NOT EXISTS monitoring_schedules (
                schedule_id TEXT PRIMARY KEY,
                contract_id TEXT NOT NULL,
                round INTEGER NOT NULL,
                scheduled_at TEXT NOT NULL,
                status TEXT NOT NULL,
                sent_at TEXT,
                FOREIGN KEY (contract_id) REFERENCES contracts(contract_id),
                UNIQUE (contract_id, round)
            );

            CREATE TABLE IF NOT EXISTS ai_contract_previews (
                cache_key TEXT PRIMARY KEY,
                pet_id TEXT,
                application_id TEXT,
                request_hash TEXT NOT NULL,
                ai_summary TEXT NOT NULL,
                custom_clauses_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )

        # Migration: add manager columns if missing
        columns = [row[1] for row in connection.execute("PRAGMA table_info(certification_submissions)").fetchall()]
        if "manager_actions_json" not in columns:
            connection.execute("ALTER TABLE certification_submissions ADD COLUMN manager_actions_json TEXT NOT NULL DEFAULT '[]'")
        if "manager_comment" not in columns:
            connection.execute("ALTER TABLE certification_submissions ADD COLUMN manager_comment TEXT NOT NULL DEFAULT ''")
        if "manual_grade" not in columns:
            connection.execute("ALTER TABLE certification_submissions ADD COLUMN manual_grade TEXT NOT NULL DEFAULT ''")
        if "manual_category" not in columns:
            connection.execute("ALTER TABLE certification_submissions ADD COLUMN manual_category TEXT NOT NULL DEFAULT ''")
        if "manual_reason" not in columns:
            connection.execute("ALTER TABLE certification_submissions ADD COLUMN manual_reason TEXT NOT NULL DEFAULT ''")

        ensure_column(
            connection,
            "certification_submissions",
            "manager_actions_json",
            "TEXT NOT NULL DEFAULT '[]'",
        )
        ensure_column(
            connection,
            "certification_submissions",
            "manager_comment",
            "TEXT",
        )
        ensure_column(
            connection,
            "certification_submissions",
            "reviewed_at",
            "TEXT",
        )
        ensure_column(
            connection,
            "contracts",
            "applicant_phone",
            "TEXT",
        )
        ensure_column(
            connection,
            "pets",
            "image_url",
            "TEXT",
        )
        ensure_column(
            connection,
            "certification_submissions",
            "manager_image_data_url",
            "TEXT",
        )

        ensure_column(
            connection,
            "missing_certifications",
            "manager_actions_json",
            "TEXT NOT NULL DEFAULT '[]'",
        )
        ensure_column(
            connection,
            "missing_certifications",
            "manager_comment",
            "TEXT",
        )
        ensure_column(
            connection,
            "missing_certifications",
            "reviewed_at",
            "TEXT",
        )
        ensure_column(
            connection,
            "missing_certifications",
            "manager_image_data_url",
            "TEXT",
        )
        ensure_column(
            connection,
            "certification_submissions",
            "schedule_id",
            "TEXT",
        )
        ensure_column(
            connection,
            "missing_certifications",
            "schedule_id",
            "TEXT",
        )
def dump_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def load_json(value: str) -> Any:
    return json.loads(value)


def dump_datetime(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def load_datetime(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None

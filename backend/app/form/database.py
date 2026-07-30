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


def dump_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def load_json(value: str) -> Any:
    return json.loads(value)


def dump_datetime(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def load_datetime(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None

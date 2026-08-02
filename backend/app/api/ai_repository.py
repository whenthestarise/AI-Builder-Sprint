from dataclasses import dataclass
from datetime import datetime

from app.form.database import (
    dump_datetime,
    dump_json,
    get_connection,
    initialize_database,
    load_json,
)


@dataclass(frozen=True)
class StoredContractPreview:
    ai_summary: str
    custom_clauses: list[str]


def get_contract_preview(cache_key: str) -> StoredContractPreview | None:
    initialize_database()

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT ai_summary, custom_clauses_json
            FROM ai_contract_previews
            WHERE cache_key = ?
            """,
            (cache_key,),
        ).fetchone()

    if not row:
        return None

    return StoredContractPreview(
        ai_summary=row["ai_summary"],
        custom_clauses=load_json(row["custom_clauses_json"]),
    )


def save_contract_preview(
    *,
    cache_key: str,
    pet_id: str | None,
    application_id: str | None,
    request_hash: str,
    ai_summary: str,
    custom_clauses: list[str],
) -> StoredContractPreview:
    initialize_database()

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO ai_contract_previews (
                cache_key,
                pet_id,
                application_id,
                request_hash,
                ai_summary,
                custom_clauses_json,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(cache_key) DO UPDATE SET
                pet_id = excluded.pet_id,
                application_id = excluded.application_id,
                request_hash = excluded.request_hash,
                ai_summary = excluded.ai_summary,
                custom_clauses_json = excluded.custom_clauses_json,
                created_at = excluded.created_at
            """,
            (
                cache_key,
                pet_id,
                application_id,
                request_hash,
                ai_summary,
                dump_json(custom_clauses),
                dump_datetime(datetime.utcnow()),
            ),
        )

    return StoredContractPreview(
        ai_summary=ai_summary,
        custom_clauses=custom_clauses,
    )

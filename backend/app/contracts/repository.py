from datetime import datetime, timedelta
from uuid import uuid4

from app.contracts.schemas import (
    ContractSignComplete,
    ContractSignCompleteRequest,
    MonitoringSchedule,
)
from app.form.database import (
    dump_datetime,
    get_connection,
    initialize_database,
    load_datetime,
)


ROUND_DAYS = {
    1: 3,
    2: 7,
    3: 30,
    4: 90,
    5: 180,
    6: 365,
}


def create_signed_contract(
    payload: ContractSignCompleteRequest,
) -> ContractSignComplete:
    initialize_database()

    contract_id = payload.contractId
    created_at = datetime.utcnow()

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO pets (
                pet_id,
                pet_name,
                adopter_name,
                adoption_date,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(pet_id) DO UPDATE SET
                pet_name = excluded.pet_name,
                adopter_name = excluded.adopter_name,
                adoption_date = excluded.adoption_date
            """,
            (
                payload.petId,
                payload.petName,
                payload.adopterName,
                payload.signedAt.date().isoformat(),
                dump_datetime(created_at),
            ),
        )

        connection.execute(
            """
            INSERT INTO contracts (
                contract_id,
                pet_id,
                adopter_name,
                status,
                signed_at,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(contract_id) DO NOTHING
            """,
            (
                contract_id,
                payload.petId,
                payload.adopterName,
                "SIGNED",
                dump_datetime(payload.signedAt),
                dump_datetime(created_at),
            ),
        )

        for round_number, day_offset in ROUND_DAYS.items():
            scheduled_at = payload.signedAt + timedelta(days=day_offset)
            schedule_id = f"SCHEDULE-{uuid4().hex[:12].upper()}"

            connection.execute(
                """
                INSERT INTO monitoring_schedules (
                    schedule_id,
                    contract_id,
                    round,
                    scheduled_at,
                    status,
                    sent_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(contract_id, round) DO NOTHING
                """,
                (
                    schedule_id,
                    contract_id,
                    round_number,
                    dump_datetime(scheduled_at),
                    "PENDING",
                    None,
                ),
            )
    schedules = list_monitoring_schedules(contract_id)

    return ContractSignComplete(
        contractId=contract_id,
        petId=payload.petId,
        petName=payload.petName,
        adopterName=payload.adopterName,
        status="SIGNED",
        signedAt=payload.signedAt,
        schedules=schedules,
    )

def list_monitoring_schedules(
    contract_id: str,
) -> list[MonitoringSchedule]:
    initialize_database()

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                schedule_id,
                round,
                scheduled_at,
                status,
                sent_at
            FROM monitoring_schedules
            WHERE contract_id = ?
            ORDER BY round ASC
            """,
            (contract_id,),
        ).fetchall()

    return [
        MonitoringSchedule(
            scheduleId=row["schedule_id"],
            round=row["round"],
            scheduledAt=load_datetime(row["scheduled_at"]),
            status=row["status"],
            sentAt=load_datetime(row["sent_at"]),
        )
        for row in rows
    ]

def send_monitoring_schedule(
    *,
    contract_id: str,
    schedule_id: str,
) -> MonitoringSchedule | None:
    initialize_database()

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT
                schedule_id,
                round,
                scheduled_at,
                status,
                sent_at
            FROM monitoring_schedules
            WHERE contract_id = ? AND schedule_id = ?
            """,
            (contract_id, schedule_id),
        ).fetchone()

        if not row:
            return None

        if row["status"] != "PENDING":
            raise ValueError(
                "PENDING 상태의 인증 일정만 발송할 수 있습니다."
            )

        sent_at = datetime.utcnow()

        connection.execute(
            """
            UPDATE monitoring_schedules
            SET
                status = 'SENT',
                sent_at = ?
            WHERE schedule_id = ?
            """,
            (
                dump_datetime(sent_at),
                schedule_id,
            ),
        )

    return MonitoringSchedule(
        scheduleId=row["schedule_id"],
        round=row["round"],
        scheduledAt=load_datetime(row["scheduled_at"]),
        status="SENT",
        sentAt=sent_at,
    )
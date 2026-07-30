from datetime import datetime
from uuid import uuid4

from app.form.database import (
    dump_datetime,
    dump_json,
    get_connection,
    initialize_database,
    load_datetime,
    load_json,
)
from app.form.grading import (
    approval_status_for_submission,
    calculate_response_risk,
    calculate_time_risk,
    max_risk,
)
from app.form.schemas import (
    CertificationFileMeta,
    CertificationSubmission,
    CertificationSubmissionCreate,
    MissingCertification,
    MissingCertificationCreate,
)


def create_submission(payload: CertificationSubmissionCreate) -> CertificationSubmission:
    initialize_database()

    now = datetime.utcnow()
    pet_id = normalize_pet_id(payload.petId, payload.petName)
    response_risk = calculate_response_risk(
        payload.answers,
        payload.bodySymptoms,
    )
    time_risk, time_status_label = calculate_time_risk(
        sent_at=payload.sentAt,
        now=now,
        submitted=True,
    )
    final_risk = max_risk(response_risk, time_risk)
    submission_id = f"CERT-SUB-{uuid4().hex[:12].upper()}"

    submission = CertificationSubmission.model_validate(
        {
            **payload.model_dump(),
            "petId": pet_id,
            "id": submission_id,
            "highestRisk": final_risk,
            "submittedAt": now,
            "responseRisk": response_risk,
            "timeRisk": time_risk,
            "finalRisk": final_risk,
            "approvalStatus": approval_status_for_submission(),
            "statusLabel": time_status_label,
        }
    )

    with get_connection() as connection:
        upsert_pet(
            connection,
            pet_id=pet_id,
            pet_name=payload.petName,
            adopter_name=payload.adopterName,
            adoption_date=payload.adoptionDate,
        )
        connection.execute(
            """
            DELETE FROM missing_certifications
            WHERE pet_id = ? AND round = ?
            """,
            (
                pet_id,
                submission.round,
            ),
        )
        connection.execute(
            """
            INSERT INTO certification_submissions (
                id,
                pet_id,
                round,
                sent_at,
                submitted_at,
                highest_risk,
                response_risk,
                time_risk,
                final_risk,
                approval_status,
                status_label,
                answers_json,
                body_symptoms_json,
                text_inputs_json,
                files_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                submission.id,
                submission.petId,
                submission.round,
                dump_datetime(submission.sentAt),
                dump_datetime(submission.submittedAt),
                submission.highestRisk,
                submission.responseRisk,
                submission.timeRisk,
                submission.finalRisk,
                submission.approvalStatus,
                submission.statusLabel,
                dump_json(submission.answers),
                dump_json(submission.bodySymptoms),
                dump_json(submission.textInputs),
                dump_json([file.model_dump() for file in submission.files]),
            ),
        )

    return submission


def list_submissions() -> list[CertificationSubmission]:
    initialize_database()

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                s.*,
                p.pet_name,
                p.adopter_name,
                p.adoption_date
            FROM certification_submissions s
            JOIN pets p ON p.pet_id = s.pet_id
            ORDER BY s.submitted_at DESC
            """
        ).fetchall()

    return [submission_from_row(row) for row in rows]


def get_submission(submission_id: str) -> CertificationSubmission | None:
    initialize_database()

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT
                s.*,
                p.pet_name,
                p.adopter_name,
                p.adoption_date
            FROM certification_submissions s
            JOIN pets p ON p.pet_id = s.pet_id
            WHERE s.id = ?
            """,
            (submission_id,),
        ).fetchone()

    return submission_from_row(row) if row else None


def create_missing_certification(
    payload: MissingCertificationCreate,
) -> MissingCertification:
    initialize_database()

    now = payload.checkedAt or datetime.utcnow()
    pet_id = normalize_pet_id(payload.petId, payload.petName)
    time_risk, status_label = calculate_time_risk(
        sent_at=payload.sentAt,
        now=now,
        submitted=False,
    )
    missing_id = f"CERT-MISS-{uuid4().hex[:12].upper()}"

    missing = MissingCertification.model_validate(
        {
            **payload.model_dump(),
            "id": missing_id,
            "petId": pet_id,
            "checkedAt": now,
            "timeRisk": time_risk,
            "finalRisk": time_risk,
            "approvalStatus": status_label,
            "statusLabel": status_label,
        }
    )

    with get_connection() as connection:
        upsert_pet(
            connection,
            pet_id=pet_id,
            pet_name=payload.petName,
            adopter_name=payload.adopterName,
            adoption_date=payload.adoptionDate,
        )
        connection.execute(
            """
            INSERT INTO missing_certifications (
                id,
                pet_id,
                round,
                sent_at,
                checked_at,
                time_risk,
                final_risk,
                approval_status,
                status_label
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                missing.id,
                missing.petId,
                missing.round,
                dump_datetime(missing.sentAt),
                dump_datetime(missing.checkedAt),
                missing.timeRisk,
                missing.finalRisk,
                missing.approvalStatus,
                missing.statusLabel,
            ),
        )

    return missing


def upsert_pet(
    connection,
    *,
    pet_id: str,
    pet_name: str,
    adopter_name: str | None,
    adoption_date: str | None,
) -> None:
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
            pet_id,
            pet_name,
            adopter_name,
            adoption_date,
            dump_datetime(datetime.utcnow()),
        ),
    )


def normalize_pet_id(pet_id: str | None, pet_name: str) -> str:
    if pet_id and pet_id.strip():
        return pet_id.strip()

    return f"PET-{pet_name.strip().upper()}"


def submission_from_row(row) -> CertificationSubmission:
    files = [
        CertificationFileMeta.model_validate(file)
        for file in load_json(row["files_json"])
    ]

    return CertificationSubmission.model_validate(
        {
            "id": row["id"],
            "petId": row["pet_id"],
            "round": row["round"],
            "petName": row["pet_name"],
            "adopterName": row["adopter_name"],
            "adoptionDate": row["adoption_date"],
            "sentAt": load_datetime(row["sent_at"]),
            "submittedAt": load_datetime(row["submitted_at"]),
            "highestRisk": row["highest_risk"],
            "responseRisk": row["response_risk"],
            "timeRisk": row["time_risk"],
            "finalRisk": row["final_risk"],
            "approvalStatus": row["approval_status"],
            "statusLabel": row["status_label"],
            "answers": load_json(row["answers_json"]),
            "bodySymptoms": load_json(row["body_symptoms_json"]),
            "textInputs": load_json(row["text_inputs_json"]),
            "files": files,
        }
    )

import json
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.form.repository import (
    create_missing_certification,
    create_submission,
    get_submission,
    list_submissions,
)
from app.form.schemas import (
    CertificationFileMeta,
    CertificationSubmissionCreate,
    CertificationSubmissionListResponse,
    CertificationSubmissionResponse,
    MissingCertificationCreate,
    MissingCertificationResponse,
)

router = APIRouter(prefix="/form", tags=["Form"])


@router.post(
    "/certifications",
    response_model=CertificationSubmissionResponse,
    status_code=201,
)
def submit_certification_json(
    payload: CertificationSubmissionCreate,
) -> CertificationSubmissionResponse:
    submission = create_submission(payload)
    return CertificationSubmissionResponse(data=submission)


@router.post(
    "/certifications/multipart",
    response_model=CertificationSubmissionResponse,
    status_code=201,
)
async def submit_certification_multipart(
    round: Annotated[int, Form()],
    petName: Annotated[str, Form()],
    highestRisk: Annotated[str, Form()],
    answers: Annotated[str, Form()] = "{}",
    bodySymptoms: Annotated[str, Form()] = "[]",
    textInputs: Annotated[str, Form()] = "{}",
    fileFieldIds: Annotated[str, Form()] = "[]",
    adopterName: Annotated[str | None, Form()] = None,
    adoptionDate: Annotated[str | None, Form()] = None,
    petId: Annotated[str | None, Form()] = None,
    sentAt: Annotated[str | None, Form()] = None,
    uploadedFiles: Annotated[list[UploadFile] | None, File()] = None,
) -> CertificationSubmissionResponse:
    file_metas: list[CertificationFileMeta] = []

    try:
        parsed_file_field_ids = json.loads(fileFieldIds)
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=422,
            detail="Invalid file field metadata.",
        ) from error

    for index, upload in enumerate(uploadedFiles or []):
        content = await upload.read()
        file_metas.append(
            CertificationFileMeta(
                field_id=(
                    parsed_file_field_ids[index]
                    if index < len(parsed_file_field_ids)
                    else "uploadedFiles"
                ),
                filename=upload.filename or "unnamed",
                content_type=upload.content_type,
                size=len(content),
            )
        )

    try:
        payload = CertificationSubmissionCreate(
            petId=petId,
            round=round,
            petName=petName,
            adopterName=adopterName,
            adoptionDate=adoptionDate,
            sentAt=sentAt,
            highestRisk=highestRisk,
            answers=json.loads(answers),
            bodySymptoms=json.loads(bodySymptoms),
            textInputs=json.loads(textInputs),
            files=file_metas,
        )
    except (json.JSONDecodeError, ValidationError) as error:
        raise HTTPException(
            status_code=422,
            detail="Invalid certification form payload.",
        ) from error

    submission = create_submission(payload)
    return CertificationSubmissionResponse(data=submission)


@router.post(
    "/certifications/missing",
    response_model=MissingCertificationResponse,
    status_code=201,
)
def save_missing_certification_status(
    payload: MissingCertificationCreate,
) -> MissingCertificationResponse:
    missing = create_missing_certification(payload)
    return MissingCertificationResponse(data=missing)


@router.get(
    "/certifications",
    response_model=CertificationSubmissionListResponse,
)
def get_certifications() -> CertificationSubmissionListResponse:
    return CertificationSubmissionListResponse(data=list_submissions())


@router.get(
    "/certifications/{submission_id}",
    response_model=CertificationSubmissionResponse,
)
def get_certification(submission_id: str) -> CertificationSubmissionResponse:
    submission = get_submission(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")

    return CertificationSubmissionResponse(data=submission)

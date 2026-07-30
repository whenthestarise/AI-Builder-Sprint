from datetime import datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field


CertificationRound = Literal[1, 2, 3, 4, 5, 6]
RiskLevel = Literal["green", "yellow", "orange", "red"]


class CertificationFileMeta(BaseModel):
    field_id: str = Field(min_length=1)
    filename: str = Field(min_length=1)
    content_type: str | None = None
    size: int = Field(ge=0)


class CertificationSubmissionCreate(BaseModel):
    petId: str | None = Field(default=None, max_length=80)
    round: CertificationRound
    petName: str = Field(min_length=1, max_length=50)
    adopterName: str | None = Field(default=None, max_length=50)
    adoptionDate: str | None = Field(default=None, max_length=30)
    sentAt: datetime | None = None
    highestRisk: RiskLevel
    answers: dict[str, str] = Field(default_factory=dict)
    bodySymptoms: list[str] = Field(default_factory=list)
    textInputs: dict[str, str] = Field(default_factory=dict)
    files: list[CertificationFileMeta] = Field(default_factory=list)


class CertificationSubmission(CertificationSubmissionCreate):
    id: str = Field(default_factory=lambda: f"CERT-SUB-{uuid4().hex[:12].upper()}")
    submittedAt: datetime = Field(default_factory=datetime.utcnow)
    responseRisk: RiskLevel
    timeRisk: RiskLevel
    finalRisk: RiskLevel
    approvalStatus: str
    statusLabel: str


class CertificationSubmissionResponse(BaseModel):
    data: CertificationSubmission


class CertificationSubmissionListResponse(BaseModel):
    data: list[CertificationSubmission]


class MissingCertificationCreate(BaseModel):
    petId: str | None = Field(default=None, max_length=80)
    round: CertificationRound
    petName: str = Field(min_length=1, max_length=50)
    adopterName: str | None = Field(default=None, max_length=50)
    adoptionDate: str | None = Field(default=None, max_length=30)
    sentAt: datetime
    checkedAt: datetime | None = None


class MissingCertification(BaseModel):
    id: str = Field(default_factory=lambda: f"CERT-MISS-{uuid4().hex[:12].upper()}")
    petId: str
    round: CertificationRound
    petName: str
    adopterName: str | None = None
    adoptionDate: str | None = None
    sentAt: datetime
    checkedAt: datetime
    timeRisk: RiskLevel
    finalRisk: RiskLevel
    approvalStatus: str
    statusLabel: str


class MissingCertificationResponse(BaseModel):
    data: MissingCertification

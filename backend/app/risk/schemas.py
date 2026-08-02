from typing import Literal

from pydantic import BaseModel, Field


RiskLevel = Literal["normal", "warning", "urgent"]
CertificationTone = Literal["caution", "approved"]
ManualGrade = Literal["urgent", "caution", "observe", "normal"]


class Contract(BaseModel):
    id: str
    petName: str
    adopterName: str
    applicantPhone: str | None = None
    status: str
    signedAt: str
    nextCheck: str
    risk: RiskLevel
    petType: str | None = None
    adoptionDate: str | None = None
    lastCertificationDate: str | None = None
    certificationRound: int | None = None


class TimelineEvent(BaseModel):
    id: str
    title: str
    description: str
    date: str
    tone: RiskLevel


class RiskDashboardData(BaseModel):
    headerStatus: str
    headerBadgeClass: str
    headerDotClass: str
    behaviorTrait: str
    signedDate: str
    manualGrade: str | None = None
    manualCategory: str | None = None
    manualReason: str | None = None


class RiskUpcomingTimeline(BaseModel):
    label: str
    title: str
    description: str
    buttonLabel: str


class CertificationAnswer(BaseModel):
    question: str
    answer: str
    tone: Literal["normal", "observe", "caution"]
    highlighted: bool = False


class RiskCertificationCard(BaseModel):
    id: str
    contractId: str
    tone: CertificationTone
    title: str
    description: str
    status: str
    submittedAt: str | None = None
    roundLabel: str | None = None
    imageUrl: str | None = None
    answers: list[CertificationAnswer] = Field(default_factory=list)
    managerActions: list[str] | None = None
    managerComment: str | None = None
    reviewedAt: str | None = None


class RiskDashboardModalViewModel(BaseModel):
    contract: Contract | None
    dashboardData: RiskDashboardData | None
    upcomingTimeline: RiskUpcomingTimeline | None
    certificationCards: list[RiskCertificationCard]


class RiskGradeOption(BaseModel):
    value: ManualGrade
    label: str
    shortLabel: str
    badgeClass: str
    dotClass: str
    textClass: str


class RiskFallbackRow(BaseModel):
    adoptionDate: str
    lastCertificationDate: str
    petType: str


class RiskConfig(BaseModel):
    gradeOptions: list[RiskGradeOption]
    reasonCategories: list[str]
    actionOptions: list[str]
    fallbackRows: list[RiskFallbackRow]


class RiskDashboardViewModel(BaseModel):
    contracts: list[Contract]
    applicantPhone: str
    timelineEvents: list[TimelineEvent]
    modalViewModels: dict[str, RiskDashboardModalViewModel]
    riskConfig: RiskConfig


class RiskDashboardResponse(BaseModel):
    data: RiskDashboardViewModel

class CertificationReviewRequest(BaseModel):
    approvedStatus: str = Field(min_length=1, max_length=50)
    managerActions: list[str] = Field(default_factory=list, max_length=10)
    managerComment: str | None = Field(
        default=None,
        max_length=500,
    )
    imageDataUrl: str | None = Field(
        default=None,
        max_length=4_500_000,
    )

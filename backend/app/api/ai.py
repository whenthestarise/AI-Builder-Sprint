from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.upstage import generate_contract_preview

router = APIRouter(prefix="/ai", tags=["AI"])


class AnimalInfo(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    behaviorTags: list[str] = Field(default_factory=list, max_length=10)


class ApplicantInfo(BaseModel):
    housing: str = Field(min_length=1, max_length=100)
    averageAwayHours: float = Field(ge=0, le=24)
    careExperience: str = Field(min_length=1, max_length=100)


class ContractPreviewRequest(BaseModel):
    animal: AnimalInfo
    applicant: ApplicantInfo


class MonitoringCheckItem(BaseModel):
    question: str
    riskSignal: str


class ContractPreviewResponse(BaseModel):
    contractClauses: list[str] = Field(min_length=2, max_length=2)
    dashboardTips: list[str] = Field(min_length=2, max_length=2)
    monitoringCheckItem: MonitoringCheckItem


@router.post("/contract-preview", response_model=ContractPreviewResponse)
def create_contract_preview(request: ContractPreviewRequest) -> ContractPreviewResponse:
    try:
        result = generate_contract_preview(
            animal_name=request.animal.name,
            behavior_tags=request.animal.behaviorTags,
            housing=request.applicant.housing,
            average_away_hours=request.applicant.averageAwayHours,
            care_experience=request.applicant.careExperience,
        )
        return ContractPreviewResponse.model_validate(result)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="Upstage 응답을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
        ) from error

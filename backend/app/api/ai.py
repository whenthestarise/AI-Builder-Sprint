from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.upstage import generate_contract_preview

router = APIRouter(prefix="/ai", tags=["AI"])


class PetInfo(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    age: str = Field(min_length=1, max_length=50)
    breed: str = Field(min_length=1, max_length=100)
    special_notes: str = Field(min_length=1, max_length=500)


class AdopterInfo(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    household_type: str = Field(min_length=1, max_length=100)
    housing_type: str = Field(min_length=1, max_length=200)
    pet_experience: str = Field(min_length=1, max_length=300)


class ContractPreviewRequest(BaseModel):
    pet_info: PetInfo
    adopter_info: AdopterInfo


class ContractPreviewResponse(BaseModel):
    ai_summary: str
    custom_clauses: list[str] = Field(min_length=1, max_length=3)


@router.post("/contract-preview", response_model=ContractPreviewResponse)
def create_contract_preview(request: ContractPreviewRequest):
    try:
        result = generate_contract_preview(
            pet_name=request.pet_info.name,
            pet_age=request.pet_info.age,
            pet_breed=request.pet_info.breed,
            special_notes=request.pet_info.special_notes,
            adopter_name=request.adopter_info.name,
            household_type=request.adopter_info.household_type,
            housing_type=request.adopter_info.housing_type,
            pet_experience=request.adopter_info.pet_experience,
        )

        return ContractPreviewResponse.model_validate(result)

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI 계약 특약 생성에 실패했습니다.",
        )
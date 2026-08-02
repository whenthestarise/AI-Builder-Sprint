import hashlib
import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.ai_repository import (
    get_contract_preview,
    save_contract_preview,
)
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
    pet_id: str | None = Field(default=None, max_length=80)
    application_id: str | None = Field(default=None, max_length=80)
    pet_info: PetInfo
    adopter_info: AdopterInfo


class ContractPreviewResponse(BaseModel):
    ai_summary: str
    custom_clauses: list[str] = Field(min_length=1, max_length=3)


@router.post("/contract-preview", response_model=ContractPreviewResponse)
def create_contract_preview(request: ContractPreviewRequest):
    try:
        request_json = json.dumps(
            request.model_dump(),
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        request_hash = hashlib.sha256(request_json.encode("utf-8")).hexdigest()
        identity = ":".join(
            value
            for value in (request.pet_id, request.application_id)
            if value
        ) or "anonymous"
        cache_key = f"{identity}:{request_hash}"

        stored_preview = get_contract_preview(cache_key)
        if stored_preview:
            return ContractPreviewResponse(
                ai_summary=stored_preview.ai_summary,
                custom_clauses=stored_preview.custom_clauses,
            )

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

        preview = ContractPreviewResponse.model_validate(result)
        save_contract_preview(
            cache_key=cache_key,
            pet_id=request.pet_id,
            application_id=request.application_id,
            request_hash=request_hash,
            ai_summary=preview.ai_summary,
            custom_clauses=preview.custom_clauses,
        )

        return preview

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI 계약 특약 생성에 실패했습니다.",
        )

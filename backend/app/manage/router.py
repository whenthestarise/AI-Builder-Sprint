from fastapi import APIRouter, HTTPException

from app.manage.repository import (
    get_manage_detail,
    list_manage_data,
)
from app.manage.schemas import (
    ManageDetailResponse,
    ManageListResponse,
)


router = APIRouter(
    prefix="/manage",
    tags=["Manage"],
)


@router.get(
    "",
    response_model=ManageListResponse,
)
def get_manage_list() -> ManageListResponse:
    return ManageListResponse(
        data=list_manage_data(),
    )


@router.get(
    "/{pet_id}",
    response_model=ManageDetailResponse,
)
def get_manage_pet_detail(
    pet_id: str,
) -> ManageDetailResponse:
    detail = get_manage_detail(pet_id)

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail="Pet not found.",
        )

    return ManageDetailResponse(data=detail)
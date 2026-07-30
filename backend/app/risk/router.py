from fastapi import APIRouter, HTTPException

from pydantic import BaseModel

from app.risk.repository import (
    approve_certification,
    get_modal_view_model,
    get_risk_dashboard_view_model,
)
from app.risk.schemas import RiskDashboardResponse, RiskDashboardModalViewModel


router = APIRouter(prefix="/risk", tags=["Risk"])


class CertificationApprovalRequest(BaseModel):
    approvedStatus: str


@router.get("/dashboard", response_model=RiskDashboardResponse)
def get_risk_dashboard() -> RiskDashboardResponse:
    return RiskDashboardResponse(data=get_risk_dashboard_view_model())


@router.get(
    "/contracts/{contract_id}/dashboard",
    response_model=RiskDashboardModalViewModel,
)
def get_contract_dashboard(contract_id: str) -> RiskDashboardModalViewModel:
    view_model = get_modal_view_model(contract_id)
    if not view_model.contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    return view_model


@router.put(
    "/contracts/{contract_id}/certifications/{certification_id}/approve",
)
def approve_contract_certification(
    contract_id: str,
    certification_id: str,
    payload: CertificationApprovalRequest,
) -> dict[str, bool]:
    approved = approve_certification(
        contract_id,
        certification_id,
        payload.approvedStatus,
    )
    if not approved:
        raise HTTPException(status_code=404, detail="Certification not found.")

    return {"ok": True}

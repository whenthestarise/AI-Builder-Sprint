from fastapi import APIRouter, HTTPException

from app.contracts.repository import (
    create_signed_contract,
    list_monitoring_schedules,
    send_monitoring_schedule,
)

from app.contracts.schemas import (
    ContractSignCompleteRequest,
    ContractSignCompleteResponse,
    MonitoringScheduleListResponse,
    MonitoringScheduleResponse,
)


router = APIRouter(prefix="/contracts", tags=["Contracts"])


@router.post(
    "/sign-complete",
    response_model=ContractSignCompleteResponse,
    status_code=201,
)
def sign_complete(
    payload: ContractSignCompleteRequest,
) -> ContractSignCompleteResponse:
    contract = create_signed_contract(payload)

    return ContractSignCompleteResponse(data=contract)

@router.get(
    "/{contract_id}/monitoring-schedules",
    response_model=MonitoringScheduleListResponse,
)
def get_monitoring_schedules(
    contract_id: str,
) -> MonitoringScheduleListResponse:
    schedules = list_monitoring_schedules(contract_id)

    return MonitoringScheduleListResponse(data=schedules)

@router.post(
    "/{contract_id}/monitoring-schedules/{schedule_id}/send",
    response_model=MonitoringScheduleResponse,
)
def send_schedule(
    contract_id: str,
    schedule_id: str,
) -> MonitoringScheduleResponse:
    try:
        schedule = send_monitoring_schedule(
            contract_id=contract_id,
            schedule_id=schedule_id,
        )
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error))

    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found.")

    return MonitoringScheduleResponse(data=schedule)

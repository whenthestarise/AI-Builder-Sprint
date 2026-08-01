from datetime import datetime

from pydantic import BaseModel, Field


class MonitoringSchedule(BaseModel):
    scheduleId: str
    round: int
    scheduledAt: datetime
    status: str
    sentAt: datetime | None = None


class ContractSignCompleteRequest(BaseModel):
    contractId: str = Field(min_length=1, max_length=80)
    petId: str = Field(min_length=1, max_length=80)
    petName: str = Field(min_length=1, max_length=50)
    adopterName: str = Field(min_length=1, max_length=50)
    signedAt: datetime


class ContractSignComplete(BaseModel):
    contractId: str
    petId: str
    petName: str
    adopterName: str
    status: str
    signedAt: datetime
    schedules: list[MonitoringSchedule]


class ContractSignCompleteResponse(BaseModel):
    data: ContractSignComplete

class MonitoringScheduleListResponse(BaseModel):
    data: list[MonitoringSchedule]

class MonitoringScheduleResponse(BaseModel):
    data: MonitoringSchedule
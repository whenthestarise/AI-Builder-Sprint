from pydantic import BaseModel


class ManagePet(BaseModel):
    id: str
    name: str
    englishName: str
    age: str
    breed: str
    gender: str
    weight: str
    neutered: bool

    # 이미지는 프론트 public 폴더에서 id 기준으로 연결해도 된다.
    imageUrl: str | None = None

    status: str
    contractStatus: str
    traits: list[str]
    note: str
    applications: int

    rescueDate: str
    rescueLocation: str
    shelterName: str
    intakeDate: str


class ManageApplication(BaseModel):
    id: str
    petId: str
    applicant: str
    phone: str
    email: str

    # 신청 접수일
    submittedAt: str

    # 프론트의 기존 adminModel.ts 명칭(home)에 맞춘다.
    home: str
    experience: str
    awayHours: str
    aiSummary: str
    score: str


class ManageListData(BaseModel):
    pets: list[ManagePet]
    applications: list[ManageApplication]


class ManageListResponse(BaseModel):
    ok: bool = True
    data: ManageListData


class ManageDetailData(BaseModel):
    selectedPet: ManagePet
    applications: list[ManageApplication]


class ManageDetailResponse(BaseModel):
    ok: bool = True
    data: ManageDetailData
from app.manage.schemas import (
    ManageApplication,
    ManageDetailData,
    ManageListData,
    ManagePet,
)


PETS = [
    {
        "id": "DOG-2026-01",
        "name": "바오",
        "englishName": "Bao",
        "age": "3살",
        "breed": "믹스견",
        "gender": "수컷",
        "weight": "8.5kg",
        "neutered": True,
        "imageUrl": None,
        "status": "available",
        "contractStatus": "매칭 대기",
        "traits": [
            "⚠️ 심한 분리불안",
            "실외 배변 선호",
            "헛짖음 약간",
            "사람을 매우 좋아함",
        ],
        "note": (
            "이 데이터는 다음 단계에서 Upstage Solar LLM이 분석하여 "
            "맞춤형 책임 약관을 자동 작성하는 데 사용됩니다."
        ),
        "rescueDate": "2026-05-12",
        "rescueLocation": "부산 해운대구",
        "shelterName": "부산 유기동물 보호협회",
        "intakeDate": "2026-05-12",
    },
    {
        "id": "DOG-2026-02",
        "name": "코코",
        "englishName": "Coco",
        "age": "2살",
        "breed": "말티즈",
        "gender": "암컷",
        "weight": "3.2kg",
        "neutered": True,
        "imageUrl": None,
        "status": "available",
        "contractStatus": "매칭 대기",
        "traits": [
            "⚠️ 슬개골 탈구 2기",
            "초인종 반응 짖음",
            "실내 배변 100% 완벽",
            "스킨십 선호",
        ],
        "note": (
            "이 데이터는 다음 단계에서 Upstage Solar LLM이 분석하여 "
            "맞춤형 책임 약관을 자동 작성하는 데 사용됩니다."
        ),
        "rescueDate": "2026-06-01",
        "rescueLocation": "부산 수영구",
        "shelterName": "부산 유기동물 보호협회",
        "intakeDate": "2026-06-01",
    },
    {
        "id": "DOG-2026-03",
        "name": "맥스",
        "englishName": "Max",
        "age": "4살",
        "breed": "골든 리트리버 믹스",
        "gender": "수컷",
        "weight": "22.0kg",
        "neutered": True,
        "imageUrl": None,
        "status": "available",
        "contractStatus": "매칭 대기",
        "traits": [
            "⚠️ 성인 남성 경계함",
            "높은 활동량 (하루 2시간 산책 필수)",
            "탈출 시도 이력 있음",
            "다른 강아지와 사회성 좋음",
        ],
        "note": (
            "이 데이터는 다음 단계에서 Upstage Solar LLM이 분석하여 "
            "맞춤형 책임 약관을 자동 작성하는 데 사용됩니다."
        ),
        "rescueDate": "2026-04-15",
        "rescueLocation": "부산 기장군",
        "shelterName": "부산 유기동물 보호협회",
        "intakeDate": "2026-04-15",
    },
    {
        "id": "DOG-2026-04",
        "name": "다미",
        "englishName": "Dami",
        "age": "10살 (노령견)",
        "breed": "시추",
        "gender": "암컷",
        "weight": "5.1kg",
        "neutered": True,
        "imageUrl": None,
        "status": "available",
        "contractStatus": "매칭 대기",
        "traits": [
            "⚠️ 심장병 초기 (매일 아침 투약 필수)",
            "매우 온순하고 조용함",
            "분리불안 없음",
            "수면 시간이 길음",
        ],
        "note": (
            "이 데이터는 다음 단계에서 Upstage Solar LLM이 분석하여 "
            "맞춤형 책임 약관을 자동 작성하는 데 사용됩니다."
        ),
        "rescueDate": "2026-03-20",
        "rescueLocation": "부산 동래구",
        "shelterName": "부산 유기동물 보호협회",
        "intakeDate": "2026-03-20",
    },
    {
        "id": "DOG-2026-05",
        "name": "레오",
        "englishName": "Leo",
        "age": "6개월 (퍼피)",
        "breed": "진도 믹스",
        "gender": "수컷",
        "weight": "6.8kg",
        "neutered": False,
        "imageUrl": None,
        "status": "available",
        "contractStatus": "매칭 대기",
        "traits": [
            "⚠️ 이갈이 및 입질 시기",
            "중성화 수술 예정 (D+30 필수)",
            "호기심 최고조",
            "퍼피 사회화 교육 필요",
        ],
        "note": (
            "이 데이터는 다음 단계에서 Upstage Solar LLM이 분석하여 "
            "맞춤형 책임 약관을 자동 작성하는 데 사용됩니다."
        ),
        "rescueDate": "2026-07-02",
        "rescueLocation": "부산 사하구",
        "shelterName": "부산 유기동물 보호협회",
        "intakeDate": "2026-07-02",
    },
]


APPLICATIONS = [
    {
        "id": "APP-2026-0727-1",
        "petId": "DOG-2026-01",
        "applicant": "김민수",
        "phone": "010-1234-5678",
        "email": "minsoo@naver.com",
        "submittedAt": "2026-07-27",
        "home": "1인 가구, 아파트 (방묘문 및 안전문 설치 완료)",
        "experience": "과거 반려견 15년 자연사 돌봄 경험 있음",
        "awayHours": "하루 평균 6시간 (퇴근 후 산책 2회 가능)",
        "aiSummary": (
            'AI 매칭 진단: "과거 노령견 돌봄 경험이 있어 바오의 분리불안 '
            '훈련이나 다미의 투약 관리에 매우 적합함."'
        ),
        "score": "1차 심사 통과",
    },
    {
        "id": "APP-2026-0728-2",
        "petId": "DOG-2026-03",
        "applicant": "이지은",
        "phone": "010-9876-5432",
        "email": "jieun.lee@gmail.com",
        "submittedAt": "2026-07-28",
        "home": "4인 가구, 마당이 있는 단독주택 (1.8m 높은 담장 완비)",
        "experience": "대형견(래브라도 리트리버) 10년 양육 경험 있음",
        "awayHours": "하루 평균 1~2시간 (부모님이 상시 집에 계심)",
        "aiSummary": (
            'AI 매칭 진단: "상시 사람이 있고 마당이 완비되어 있어 활동량이 '
            '많고 탈출 이력이 있는 맥스에게 최적의 입양처임."'
        ),
        "score": "1차 심사 통과",
    },
    {
        "id": "APP-2026-0728-3",
        "petId": "DOG-2026-02",
        "applicant": "박준호",
        "phone": "010-5555-4444",
        "email": "junho.park@kakao.com",
        "submittedAt": "2026-07-28",
        "home": "신혼부부(2인 가구), 빌라 2층 (전 좌석 미끄럼 방지 매트 시공 완료)",
        "experience": "반려견 양육 첫 경험 (주말 방문 훈련소 등록 완료)",
        "awayHours": "하루 평균 4시간 (부부 교대 재택근무 가능)",
        "aiSummary": (
            'AI 매칭 진단: "첫 입양이나 미끄럼 방지 매트 시공 등 준비성이 '
            '철저하여 슬개골 관리가 필요한 코코나 퍼피 레오와 적합함."'
        ),
        "score": "1차 심사 통과",
    },
]


def list_manage_data() -> ManageListData:
    applications = [
        ManageApplication(**application)
        for application in APPLICATIONS
    ]

    pets = [
        ManagePet(
            **pet,
            applications=sum(
                application.petId == pet["id"]
                for application in applications
            ),
        )
        for pet in PETS
    ]

    return ManageListData(
        pets=pets,
        applications=applications,
    )


def get_manage_detail(pet_id: str) -> ManageDetailData | None:
    manage_data = list_manage_data()

    selected_pet = next(
        (pet for pet in manage_data.pets if pet.id == pet_id),
        None,
    )
    if selected_pet is None:
        return None

    applications = [
        application
        for application in manage_data.applications
        if application.petId == pet_id
    ]

    return ManageDetailData(
        selectedPet=selected_pet,
        applications=applications,
    )
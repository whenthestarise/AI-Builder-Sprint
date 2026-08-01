from app.form.database import dump_json, get_connection, initialize_database


CREATED_AT = "2026-08-01T09:00:00"


def insert_pet(
    connection,
    *,
    pet_id: str,
    pet_name: str,
    adopter_name: str,
    adoption_date: str,
) -> None:
    connection.execute(
        """
        INSERT INTO pets (
            pet_id,
            pet_name,
            adopter_name,
            adoption_date,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            pet_id,
            pet_name,
            adopter_name,
            adoption_date,
            CREATED_AT,
        ),
    )


def insert_contract(
    connection,
    *,
    contract_id: str,
    pet_id: str,
    adopter_name: str,
    signed_at: str,
) -> None:
    connection.execute(
        """
        INSERT INTO contracts (
            contract_id,
            pet_id,
            adopter_name,
            status,
            signed_at,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            contract_id,
            pet_id,
            adopter_name,
            "SIGNED",
            signed_at,
            CREATED_AT,
        ),
    )


def insert_schedule_series(
    connection,
    *,
    contract_id: str,
    code: str,
    scheduled_dates: list[str],
    submitted_rounds: set[int],
    sent_rounds: set[int],
) -> None:
    for round_number, scheduled_at in enumerate(scheduled_dates, start=1):
        if round_number in submitted_rounds:
            status = "SUBMITTED"
            sent_at = scheduled_at
        elif round_number in sent_rounds:
            status = "SENT"
            sent_at = scheduled_at
        else:
            status = "PENDING"
            sent_at = None

        connection.execute(
            """
            INSERT INTO monitoring_schedules (
                schedule_id,
                contract_id,
                round,
                scheduled_at,
                status,
                sent_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                f"SCHEDULE-DEMO-{code}-{round_number:03}",
                contract_id,
                round_number,
                scheduled_at,
                status,
                sent_at,
            ),
        )


def insert_submission(
    connection,
    *,
    submission_id: str,
    pet_id: str,
    round_number: int,
    schedule_id: str,
    sent_at: str,
    submitted_at: str,
    risk: str,
    approval_status: str,
    answers: dict[str, str],
    body_symptoms: list[str],
    text_inputs: dict[str, str],
    manager_actions: list[str] | None = None,
    manager_comment: str | None = None,
    reviewed_at: str | None = None,
) -> None:
    connection.execute(
        """
        INSERT INTO certification_submissions (
            id,
            pet_id,
            round,
            schedule_id,
            sent_at,
            submitted_at,
            highest_risk,
            response_risk,
            time_risk,
            final_risk,
            approval_status,
            status_label,
            answers_json,
            body_symptoms_json,
            text_inputs_json,
            files_json,
            manager_actions_json,
            manager_comment,
            reviewed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            submission_id,
            pet_id,
            round_number,
            schedule_id,
            sent_at,
            submitted_at,
            risk,
            risk,
            "green",
            risk,
            approval_status,
            "제출 완료",
            dump_json(answers),
            dump_json(body_symptoms),
            dump_json(text_inputs),
            dump_json([]),
            dump_json(manager_actions or []),
            manager_comment,
            reviewed_at,
        ),
    )


def insert_missing_certification(
    connection,
    *,
    missing_id: str,
    pet_id: str,
    round_number: int,
    schedule_id: str,
    sent_at: str,
    checked_at: str,
) -> None:
    connection.execute(
        """
        INSERT INTO missing_certifications (
            id,
            pet_id,
            round,
            schedule_id,
            sent_at,
            checked_at,
            time_risk,
            final_risk,
            approval_status,
            status_label,
            manager_actions_json,
            manager_comment,
            reviewed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            missing_id,
            pet_id,
            round_number,
            schedule_id,
            sent_at,
            checked_at,
            "red",
            "red",
            "PENDING",
            "[미제출 (15일 지연)]",
            dump_json([]),
            None,
            None,
        ),
    )


def seed_demo_data() -> None:
    initialize_database()

    with get_connection() as connection:
        for table_name in (
            "certification_submissions",
            "missing_certifications",
            "monitoring_schedules",
            "contracts",
            "pets",
        ):
            connection.execute(f"DELETE FROM {table_name}")

        # 1. 정다은 · 두부: 정상 제출 후 승인완료
        insert_pet(
            connection,
            pet_id="PET-DEMO-TOFU-001",
            pet_name="두부",
            adopter_name="정다은",
            adoption_date="2026-06-01",
        )
        insert_contract(
            connection,
            contract_id="CONTRACT-DEMO-TOFU-001",
            pet_id="PET-DEMO-TOFU-001",
            adopter_name="정다은",
            signed_at="2026-06-01T10:00:00",
        )
        insert_schedule_series(
            connection,
            contract_id="CONTRACT-DEMO-TOFU-001",
            code="TOFU",
            scheduled_dates=[
                "2026-07-29T09:00:00",
                "2026-08-29T09:00:00",
                "2026-09-29T09:00:00",
                "2026-10-29T09:00:00",
                "2026-11-29T09:00:00",
                "2026-12-29T09:00:00",
            ],
            submitted_rounds={1},
            sent_rounds=set(),
        )
        insert_submission(
            connection,
            submission_id="CERT-DEMO-TOFU-001",
            pet_id="PET-DEMO-TOFU-001",
            round_number=1,
            schedule_id="SCHEDULE-DEMO-TOFU-001",
            sent_at="2026-07-29T09:00:00",
            submitted_at="2026-07-29T11:00:00",
            risk="green",
            approval_status="APPROVED",
            answers={
                "appetite": "good",
                "condition": "active",
                "toilet": "normal",
                "familyReaction": "adapted",
                "animalRegistration": "completed",
            },
            body_symptoms=["healthy"],
            text_inputs={
                "petType": "포메라니안",
                "phone": "010-3333-2222",
                "specialNote": "산책 사진과 실내 사료 급여 상태가 양호합니다.",
            },
            manager_actions=["인증 내용 확인 완료"],
            manager_comment="정상적인 초기 적응 상태를 확인했습니다.",
            reviewed_at="2026-07-29T11:10:00",
        )

        # 2. 강민수 · 초코: 주의 등급, 검토대기
        insert_pet(
            connection,
            pet_id="PET-DEMO-CHOCO-001",
            pet_name="초코",
            adopter_name="강민수",
            adoption_date="2026-04-15",
        )
        insert_contract(
            connection,
            contract_id="CONTRACT-DEMO-CHOCO-001",
            pet_id="PET-DEMO-CHOCO-001",
            adopter_name="강민수",
            signed_at="2026-04-15T10:00:00",
        )
        insert_schedule_series(
            connection,
            contract_id="CONTRACT-DEMO-CHOCO-001",
            code="CHOCO",
            scheduled_dates=[
                "2026-07-28T09:00:00",
                "2026-08-15T09:00:00",
                "2026-09-15T09:00:00",
                "2026-10-15T09:00:00",
                "2026-11-15T09:00:00",
                "2026-12-15T09:00:00",
            ],
            submitted_rounds={1},
            sent_rounds=set(),
        )
        insert_submission(
            connection,
            submission_id="CERT-DEMO-CHOCO-001",
            pet_id="PET-DEMO-CHOCO-001",
            round_number=1,
            schedule_id="SCHEDULE-DEMO-CHOCO-001",
            sent_at="2026-07-28T09:00:00",
            submitted_at="2026-07-28T13:00:00",
            risk="yellow",
            approval_status="PENDING",
            answers={
                "appetite": "good",
                "condition": "active",
                "toilet": "normal",
                "familyReaction": "stressed",
                "separationReaction": "calm",
            },
            body_symptoms=[],
            text_inputs={
                "petType": "시바견",
                "phone": "010-4444-5555",
                "specialNote": "실내 마루 바닥 긁힘이 있어 펜스 추가 설치가 필요합니다.",
            },
        )

        # 3. 이지은 · 콩이: 1~4회차 승인완료, 5회차 대기
        insert_pet(
            connection,
            pet_id="PET-DEMO-KONGI-001",
            pet_name="콩이",
            adopter_name="이지은",
            adoption_date="2025-07-10",
        )
        insert_contract(
            connection,
            contract_id="CONTRACT-DEMO-KONGI-001",
            pet_id="PET-DEMO-KONGI-001",
            adopter_name="이지은",
            signed_at="2025-07-10T10:00:00",
        )
        insert_schedule_series(
            connection,
            contract_id="CONTRACT-DEMO-KONGI-001",
            code="KONGI",
            scheduled_dates=[
                "2025-08-10T09:00:00",
                "2025-11-10T09:00:00",
                "2026-03-10T09:00:00",
                "2026-06-10T09:00:00",
                "2026-08-10T09:00:00",
                "2027-02-10T09:00:00",
            ],
            submitted_rounds={1, 2, 3, 4},
            sent_rounds=set(),
        )

        kongi_records = [
            (
                1,
                "2025-08-10T11:00:00",
                "적응 기간이 양호하고 배변훈련에 성공했습니다.",
            ),
            (
                2,
                "2025-11-10T11:00:00",
                "중성화 수술을 완료했고 회복 상태가 양호합니다.",
            ),
            (
                3,
                "2026-03-10T11:00:00",
                "종합 예방접종을 완료했고 체중이 정상입니다.",
            ),
            (
                4,
                "2026-06-10T11:00:00",
                "산책 빈도가 증가했고 사회화 교육 상태가 양호합니다.",
            ),
        ]

        for round_number, submitted_at, note in kongi_records:
            insert_submission(
                connection,
                submission_id=f"CERT-DEMO-KONGI-{round_number:03}",
                pet_id="PET-DEMO-KONGI-001",
                round_number=round_number,
                schedule_id=f"SCHEDULE-DEMO-KONGI-{round_number:03}",
                sent_at=scheduled_at_for_kongi(round_number),
                submitted_at=submitted_at,
                risk="green",
                approval_status="APPROVED",
                answers={
                    "appetite": "good",
                    "condition": "active",
                    "toilet": "normal",
                    "familyReaction": "adapted",
                },
                body_symptoms=["healthy"],
                text_inputs={
                    "petType": "푸들",
                    "phone": "010-9876-5432",
                    "specialNote": note,
                },
                manager_actions=["인증 내용 확인 완료"],
                manager_comment="정기 안부 인증을 승인했습니다.",
                reviewed_at=submitted_at,
            )

        # 4. 박서준 · 보리: 15일 미제출, Red 위험 상태
        insert_pet(
            connection,
            pet_id="PET-DEMO-BORI-001",
            pet_name="보리",
            adopter_name="박서준",
            adoption_date="2026-02-01",
        )
        insert_contract(
            connection,
            contract_id="CONTRACT-DEMO-BORI-001",
            pet_id="PET-DEMO-BORI-001",
            adopter_name="박서준",
            signed_at="2026-02-01T10:00:00",
        )
        insert_schedule_series(
            connection,
            contract_id="CONTRACT-DEMO-BORI-001",
            code="BORI",
            scheduled_dates=[
                "2026-02-04T09:00:00",
                "2026-03-01T09:00:00",
                "2026-07-15T09:00:00",
                "2026-08-05T09:00:00",
                "2026-10-01T09:00:00",
                "2027-02-01T09:00:00",
            ],
            submitted_rounds={1, 2},
            sent_rounds={3},
        )
        insert_missing_certification(
            connection,
            missing_id="CERT-DEMO-BORI-003",
            pet_id="PET-DEMO-BORI-001",
            round_number=3,
            schedule_id="SCHEDULE-DEMO-BORI-003",
            sent_at="2026-07-15T09:00:00",
            checked_at="2026-07-30T09:00:00",
        )

    print("시연 데이터 준비 완료")
    print("정다은·두부 / 강민수·초코 / 이지은·콩이 / 박서준·보리")


def scheduled_at_for_kongi(round_number: int) -> str:
    return {
        1: "2025-08-10T09:00:00",
        2: "2025-11-10T09:00:00",
        3: "2026-03-10T09:00:00",
        4: "2026-06-10T09:00:00",
    }[round_number]


if __name__ == "__main__":
    seed_demo_data()
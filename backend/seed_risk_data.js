const { DatabaseSync } = require("node:sqlite");
const { join } = require("node:path");

const db = new DatabaseSync(join(__dirname, "form.db"));

const pets = [
  ["RISK-PET-NORMAL", "보리", "김민지", "2026-07-01", "2026-07-01T09:00:00"],
  ["RISK-PET-OBSERVE", "하늘", "이준호", "2026-07-08", "2026-07-08T10:00:00"],
  ["RISK-PET-CAUTION", "콩이", "박서연", "2026-07-15", "2026-07-15T11:00:00"],
  ["RISK-PET-URGENT", "초코", "최유진", "2026-07-22", "2026-07-22T12:00:00"],
  ["RISK-PET-MISSING", "두부", "정현우", "2026-07-18", "2026-07-18T13:00:00"],
];

const submissions = [
  {
    id: "RISK-SEED-NORMAL-R2",
    petId: "RISK-PET-NORMAL",
    round: 2,
    sentAt: "2026-07-27T09:00:00",
    submittedAt: "2026-07-27T14:10:00",
    risk: "green",
    answers: {
      appetite: "good",
      condition: "active",
      toilet: "normal",
      familyReaction: "adapted",
      separationReaction: "calm",
    },
    symptoms: ["healthy"],
    text: {
      petType: "말티즈",
      behaviorTrait: "식욕과 활동량이 안정적이며 새 가족에게 잘 적응하고 있습니다.",
      specialNote: "산책과 배변 상태 모두 양호합니다.",
      phone: "010-1234-5678",
    },
  },
  {
    id: "RISK-SEED-OBSERVE-R2",
    petId: "RISK-PET-OBSERVE",
    round: 2,
    sentAt: "2026-07-28T09:00:00",
    submittedAt: "2026-07-28T18:20:00",
    risk: "yellow",
    answers: {
      appetite: "slightly_less",
      condition: "active",
      toilet: "normal",
      familyReaction: "adapted",
      separationReaction: "calm",
    },
    symptoms: ["healthy"],
    text: {
      petType: "코리안 숏헤어",
      behaviorTrait: "환경 변화로 식사량이 조금 줄어 단기 관찰이 필요합니다.",
      specialNote: "간식은 먹지만 사료 섭취량이 평소보다 조금 적습니다.",
      phone: "010-2345-6789",
    },
  },
  {
    id: "RISK-SEED-CAUTION-R1",
    petId: "RISK-PET-CAUTION",
    round: 1,
    sentAt: "2026-07-29T09:00:00",
    submittedAt: "2026-07-29T16:40:00",
    risk: "orange",
    answers: {
      appetite: "almost_none",
      condition: "calmer",
      toilet: "normal",
      familyReaction: "stressed",
      separationReaction: "calm",
    },
    symptoms: ["observe"],
    text: {
      petType: "푸들",
      behaviorTrait: "식욕 저하와 활동량 감소가 함께 확인되어 보호자 확인이 필요합니다.",
      specialNote: "오늘 아침부터 사료를 거의 먹지 않고 잠이 늘었습니다.",
      phone: "010-3456-7890",
    },
  },
  {
    id: "RISK-SEED-URGENT-R1",
    petId: "RISK-PET-URGENT",
    round: 1,
    sentAt: "2026-07-30T08:00:00",
    submittedAt: "2026-07-30T11:25:00",
    risk: "red",
    answers: {
      appetite: "almost_none",
      condition: "abnormal",
      toilet: "emergency",
      familyReaction: "stressed",
      separationReaction: "anxious",
    },
    symptoms: ["warning"],
    text: {
      petType: "시바견",
      behaviorTrait: "응급 배변 증상과 식욕 부진이 보고되어 즉시 연락과 병원 내원이 필요합니다.",
      specialNote: "혈변과 반복적인 구토가 있어 가까운 동물병원으로 이동 중입니다.",
      phone: "010-4567-8901",
    },
  },
  {
    id: "RISK-SEED-MISSING-PREVIOUS-R1",
    petId: "RISK-PET-MISSING",
    round: 1,
    sentAt: "2026-07-21T09:00:00",
    submittedAt: "2026-07-21T13:15:00",
    risk: "green",
    answers: {
      appetite: "good",
      condition: "active",
      toilet: "normal",
      familyReaction: "adapted",
      separationReaction: "calm",
    },
    symptoms: ["healthy"],
    text: {
      petType: "비숑 프리제",
      behaviorTrait: "첫 인증 당시 건강과 적응 상태가 모두 양호했습니다.",
      specialNote: "첫 안부 인증은 정상적으로 제출했습니다.",
      phone: "010-5678-9012",
    },
  },
];

const missing = [
  {
    id: "RISK-SEED-MISSING-R1",
    petId: "RISK-PET-MISSING",
    round: 2,
    sentAt: "2026-07-20T09:00:00",
    checkedAt: "2026-07-30T09:00:00",
    risk: "orange",
    label: "[미제출 (7일 지연)]",
  },
];

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS pets (
    pet_id TEXT PRIMARY KEY,
    pet_name TEXT NOT NULL,
    adopter_name TEXT,
    adoption_date TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS certification_submissions (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    round INTEGER NOT NULL,
    sent_at TEXT,
    submitted_at TEXT NOT NULL,
    highest_risk TEXT NOT NULL,
    response_risk TEXT NOT NULL,
    time_risk TEXT NOT NULL,
    final_risk TEXT NOT NULL,
    approval_status TEXT NOT NULL,
    status_label TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    body_symptoms_json TEXT NOT NULL,
    text_inputs_json TEXT NOT NULL,
    files_json TEXT NOT NULL,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
  );
  CREATE TABLE IF NOT EXISTS missing_certifications (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    round INTEGER NOT NULL,
    sent_at TEXT NOT NULL,
    checked_at TEXT NOT NULL,
    time_risk TEXT NOT NULL,
    final_risk TEXT NOT NULL,
    approval_status TEXT NOT NULL,
    status_label TEXT NOT NULL,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
  );
`);

const upsertPet = db.prepare(`
  INSERT INTO pets (pet_id, pet_name, adopter_name, adoption_date, created_at)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(pet_id) DO UPDATE SET
    pet_name = excluded.pet_name,
    adopter_name = excluded.adopter_name,
    adoption_date = excluded.adoption_date
`);

const upsertSubmission = db.prepare(`
  INSERT INTO certification_submissions (
    id, pet_id, round, sent_at, submitted_at, highest_risk, response_risk,
    time_risk, final_risk, approval_status, status_label, answers_json,
    body_symptoms_json, text_inputs_json, files_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    sent_at = excluded.sent_at,
    submitted_at = excluded.submitted_at,
    highest_risk = excluded.highest_risk,
    response_risk = excluded.response_risk,
    time_risk = excluded.time_risk,
    final_risk = excluded.final_risk,
    approval_status = excluded.approval_status,
    status_label = excluded.status_label,
    answers_json = excluded.answers_json,
    body_symptoms_json = excluded.body_symptoms_json,
    text_inputs_json = excluded.text_inputs_json,
    files_json = excluded.files_json
`);

const upsertMissing = db.prepare(`
  INSERT INTO missing_certifications (
    id, pet_id, round, sent_at, checked_at, time_risk, final_risk,
    approval_status, status_label
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    pet_id = excluded.pet_id,
    round = excluded.round,
    sent_at = excluded.sent_at,
    checked_at = excluded.checked_at,
    time_risk = excluded.time_risk,
    final_risk = excluded.final_risk,
    approval_status = excluded.approval_status,
    status_label = excluded.status_label
`);

db.exec("BEGIN");
try {
  for (const pet of pets) upsertPet.run(...pet);
  for (const item of submissions) {
    upsertSubmission.run(
      item.id,
      item.petId,
      item.round,
      item.sentAt,
      item.submittedAt,
      item.risk,
      item.risk,
      "green",
      item.risk,
      "검토 대기 (미승인)",
      "[제출 완료]",
      JSON.stringify(item.answers),
      JSON.stringify(item.symptoms),
      JSON.stringify(item.text),
      "[]",
    );
  }
  for (const item of missing) {
    upsertMissing.run(
      item.id,
      item.petId,
      item.round,
      item.sentAt,
      item.checkedAt,
      item.risk,
      item.risk,
      item.label,
      item.label,
    );
  }
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}

const summary = db.prepare(`
  SELECT
    p.pet_name AS pet,
    p.adopter_name AS adopter,
    COALESCE(s.final_risk, m.final_risk) AS risk,
    CASE WHEN s.id IS NOT NULL THEN 'submitted' ELSE 'missing' END AS situation
  FROM pets p
  LEFT JOIN certification_submissions s ON s.pet_id = p.pet_id
  LEFT JOIN missing_certifications m ON m.pet_id = p.pet_id
  WHERE p.pet_id LIKE 'RISK-PET-%'
  ORDER BY COALESCE(s.submitted_at, m.checked_at) DESC
`).all();

db.close();
console.log(`Seeded ${pets.length} pets, ${submissions.length} submissions, and ${missing.length} missing certification.`);
console.table(summary);

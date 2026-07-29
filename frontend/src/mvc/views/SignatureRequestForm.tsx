"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type SigningMethodType = "EMAIL" | "KAKAO";
type InputMapping = { dataLabel: string; value: string };

type Template = {
  id: string;
  title: string;
  participants?: Array<{
    type: string;
    role: string;
    signingOrder: number;
  }>;
};

type SignatureDocument = {
  id: string;
  title: string;
  status: string;
  participants?: Array<{
    id: string;
    type: string;
    name: string;
    signingOrder: number;
    signingMethod?: {
      type: string;
      value: string;
    };
    locale: string;
  }>;
  createdAt: string;
};

type TemplatesResponse =
  | {
      ok: true;
      count: number;
      templates: Template[];
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

type SignatureResponse =
  | {
      message: string;
      document: SignatureDocument;
    }
  | {
      message: string;
      modusignError?: unknown;
    };

type TemplateDetailResponse =
  | {
      ok: true;
      requesterInputLabels: string[];
      participantFieldLabels: string[];
    }
  | {
      ok: false;
      message: string;
    };

const defaultInputMappings: InputMapping[] = [
  { dataLabel: "근로자명", value: "" },
  { dataLabel: "사업장명", value: "" },
  { dataLabel: "계약시작일", value: "" },
  { dataLabel: "계약종료일", value: "" },
  { dataLabel: "임금", value: "" },
];

const statusLabels: Record<string, string> = {
  DRAFT: "작성 중",
  SCHEDULED: "전송 예약",
  ON_GOING: "진행 중",
  ON_PROCESSING: "처리 중",
  APPROVAL_PENDING: "승인 대기",
  COMPLETED: "완료",
  ABORTED: "중단",
  PROCESSING_FAILED: "처리 실패",
};

export function SignatureRequestForm() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateError, setTemplateError] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("2026_표준근로계약서_홍길동");
  const [role, setRole] = useState("");
  const [name, setName] = useState("홍길동");
  const [signingMethodType, setSigningMethodType] =
    useState<SigningMethodType>("KAKAO");
  const [contact, setContact] = useState("");
  const [inputMappings, setInputMappings] =
    useState<InputMapping[]>(defaultInputMappings);
  const [response, setResponse] = useState<SignatureResponse | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId),
    [templateId, templates],
  );

  useEffect(() => {
    async function loadTemplates() {
      try {
        const result = (await fetch("/api/modusign/templates", {
          cache: "no-store",
        }).then((res) => res.json())) as TemplatesResponse;

        if (!result.ok) {
          setTemplateError(result.message);
          return;
        }

        setTemplates(result.templates);
        setTemplateId(result.templates[0]?.id ?? "");
        setRole(result.templates[0]?.participants?.[0]?.role ?? "");
        setTemplateError(result.templates.length === 0 ? result.message ?? "" : "");
      } catch {
        setTemplateError("템플릿 목록 요청 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingTemplates(false);
      }
    }

    loadTemplates();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResponse(null);

    const filledInputMappings = inputMappings.filter(
      (mapping) => mapping.dataLabel.trim() && mapping.value.trim(),
    );

    const result = await fetch("/api/modusign/request-signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId,
        title,
        participants: [
          {
            role,
            name,
            signingMethod: {
              type: signingMethodType,
              value: contact,
            },
            locale: "ko",
          },
        ],
        inputMappings: filledInputMappings,
      }),
    }).then((res) => res.json() as Promise<SignatureResponse>);

    setResponse(result);
    setIsSubmitting(false);
  }

  function updateInputMapping(
    index: number,
    field: keyof InputMapping,
    value: string,
  ) {
    setInputMappings((current) =>
      current.map((mapping, mappingIndex) =>
        mappingIndex === index ? { ...mapping, [field]: value } : mapping,
      ),
    );
  }

  function addInputMapping() {
    setInputMappings((current) => [...current, { dataLabel: "", value: "" }]);
  }

  function removeInputMapping(index: number) {
    setInputMappings((current) =>
      current.filter((_, mappingIndex) => mappingIndex !== index),
    );
  }

  async function loadTemplateLabels() {
    if (!templateId) {
      setTemplateError("템플릿 ID를 먼저 입력해 주세요.");
      return;
    }

    setIsLoadingLabels(true);
    setTemplateError("");

    try {
      const result = (await fetch(
        `/api/modusign/templates/${encodeURIComponent(templateId)}`,
        { cache: "no-store" },
      ).then((res) => res.json())) as TemplateDetailResponse;

      if (!result.ok) {
        setTemplateError(result.message);
        return;
      }

      const labels = Array.from(new Set(result.requesterInputLabels));

      if (labels.length === 0) {
        setTemplateError(
          "요청자 입력란 데이터 라벨이 없습니다. 모두싸인 템플릿 수정 화면에서 데이터 라벨을 확인해 주세요.",
        );
        return;
      }

      setInputMappings(labels.map((dataLabel) => ({ dataLabel, value: "" })));
    } catch {
      setTemplateError("데이터 라벨 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingLabels(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,480px)_1fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-zinc-200 bg-foreground p-5"
      >
        <div>
          <h2 className="text-xl font-semibold text-zinc-950">
            표준근로계약서 작성
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            템플릿의 데이터 라벨과 값을 입력해 계약서 본문을 채운 뒤 서명
            요청을 보냅니다.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">템플릿</span>
          <select
            value={templateId}
            onChange={(event) => {
              const nextTemplateId = event.target.value;
              const nextTemplate = templates.find(
                (template) => template.id === nextTemplateId,
              );

              setTemplateId(nextTemplateId);
              setRole(nextTemplate?.participants?.[0]?.role ?? "");
            }}
            disabled={isLoadingTemplates || templates.length === 0}
            className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-blue-500"
          >
            {isLoadingTemplates ? (
              <option>불러오는 중</option>
            ) : templates.length === 0 ? (
              <option>템플릿 없음</option>
            ) : (
              templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))
            )}
          </select>
        </label>

        <TextField
          label="템플릿 ID 직접 입력"
          value={templateId}
          onChange={setTemplateId}
          placeholder="모두싸인 템플릿 ID"
        />

        <button
          type="button"
          onClick={loadTemplateLabels}
          disabled={!templateId || isLoadingLabels}
          className="h-10 w-full rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          {isLoadingLabels ? "데이터 라벨 불러오는 중" : "데이터 라벨 불러오기"}
        </button>

        {templateError ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {templateError}
          </p>
        ) : null}

        {selectedTemplate?.participants?.length ? (
          <div className="rounded-md border border-zinc-200 bg-foreground p-3">
            <p className="text-sm font-medium text-zinc-700">템플릿 역할</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTemplate.participants.map((participant) => (
                <button
                  key={`${participant.role}-${participant.signingOrder}`}
                  type="button"
                  onClick={() => setRole(participant.role)}
                  className="rounded-md border border-zinc-200 bg-foreground px-3 py-1.5 text-sm text-zinc-700 hover:border-blue-300"
                >
                  {participant.role}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <TextField label="문서 제목" value={title} onChange={setTitle} />
        <TextField label="역할명" value={role} onChange={setRole} />
        <TextField label="참여자 이름" value={name} onChange={setName} />

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-700">
            요청 방식
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <MethodButton
              active={signingMethodType === "KAKAO"}
              label="카카오톡"
              onClick={() => {
                setSigningMethodType("KAKAO");
                setContact("");
              }}
            />
            <MethodButton
              active={signingMethodType === "EMAIL"}
              label="이메일"
              onClick={() => {
                setSigningMethodType("EMAIL");
                setContact("");
              }}
            />
          </div>
        </fieldset>

        <TextField
          label={signingMethodType === "KAKAO" ? "휴대폰 번호" : "이메일"}
          type={signingMethodType === "KAKAO" ? "tel" : "email"}
          value={contact}
          onChange={setContact}
          placeholder={
            signingMethodType === "KAKAO"
              ? "01012345678"
              : "signer@example.com"
          }
        />

        <div className="space-y-3 rounded-md border border-zinc-200 bg-foreground p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                데이터 라벨
              </h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                모두싸인 템플릿의 입력 필드명과 정확히 같은 라벨을 입력하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={addInputMapping}
              className="h-9 rounded-md border border-zinc-300 bg-foreground px-3 text-sm font-medium text-zinc-700"
            >
              추가
            </button>
          </div>

          <div className="space-y-2">
            {inputMappings.map((mapping, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={mapping.dataLabel}
                  onChange={(event) =>
                    updateInputMapping(index, "dataLabel", event.target.value)
                  }
                  placeholder="dataLabel"
                  className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-blue-500"
                />
                <input
                  value={mapping.value}
                  onChange={(event) =>
                    updateInputMapping(index, "value", event.target.value)
                  }
                  placeholder="값"
                  className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeInputMapping(index)}
                  className="h-10 rounded-md border border-zinc-300 bg-foreground px-3 text-sm text-zinc-600"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !templateId || !role || !contact}
          className="h-11 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isSubmitting ? "요청 중" : "서명 요청 보내기"}
        </button>
      </form>

      <div className="rounded-lg border border-zinc-200 bg-foreground p-5">
        <h2 className="text-xl font-semibold text-zinc-950">응답 결과</h2>
        {!response ? (
          <p className="mt-4 text-sm leading-6 text-zinc-500">
            서명 요청을 보내면 생성된 문서 ID, 상태, 참여자 정보가 여기에
            표시됩니다.
          </p>
        ) : "document" in response ? (
          <DocumentResult document={response.document} />
        ) : (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-900">{response.message}</p>
            {response.modusignError ? (
              <pre className="mt-3 overflow-auto rounded bg-foreground p-3 text-xs text-red-800">
                {JSON.stringify(response.modusignError, null, 2)}
              </pre>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function MethodButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-md border px-3 text-sm font-medium ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-zinc-300 bg-foreground text-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-blue-500"
        required
      />
    </label>
  );
}

function DocumentResult({ document }: { document: SignatureDocument }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-medium text-emerald-900">서명 요청 성공</p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="문서 ID" value={document.id} />
          <Info label="문서 제목" value={document.title} />
          <Info
            label="상태"
            value={statusLabels[document.status] ?? document.status}
          />
          <Info label="생성일" value={formatDate(document.createdAt)} />
        </dl>
      </div>

      {document.participants?.length ? (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">참여자</h3>
          <ul className="mt-2 divide-y divide-zinc-200 rounded-md border border-zinc-200">
            {document.participants.map((participant) => (
              <li key={participant.id} className="p-3 text-sm">
                <p className="font-medium text-zinc-900">
                  {participant.name} · {participant.type}
                </p>
                <p className="mt-1 text-zinc-500">
                  {participant.signingMethod?.type}{" "}
                  {participant.signingMethod?.value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details>
        <summary className="cursor-pointer text-sm font-medium text-zinc-700">
          원본 JSON 보기
        </summary>
        <pre className="mt-3 overflow-auto rounded-md bg-zinc-950 p-4 text-xs text-zinc-50">
          {JSON.stringify(document, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-1 break-all font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

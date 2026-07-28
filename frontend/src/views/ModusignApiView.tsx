"use client";

import { FormEvent, useEffect, useState } from "react";

import { AdminShell, PageHeader } from "@/views/AdminShell";

type SigningMethodType = "KAKAO" | "EMAIL";
type MappingValue = { dataLabel: string; type: string; value: string };

type Template = {
  id: string;
  title: string;
  participants?: Array<{
    role: string;
    signingOrder: number;
  }>;
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

type TemplateDetailResponse =
  | {
      ok: true;
      role?: string;
      allParticipantRoles: string[];
      requesterInputs: Array<{ dataLabel: string; type: string }>;
      participantFields: Array<{
        dataLabel: string;
        type: string;
        role: string;
      }>;
    }
  | {
      ok: false;
      message: string;
    };

type ModusignDocument = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  file?: {
    downloadUrl?: string;
  } | null;
};

type SignatureResponse =
  | {
      message: string;
      document: ModusignDocument;
    }
  | {
      message: string;
      modusignError?: unknown;
    };

type DocumentDetailResponse =
  | {
      ok: true;
      document: ModusignDocument;
    }
  | {
      ok: false;
      message: string;
    };

type EmbeddedViewResponse =
  | {
      ok: true;
      embeddedUrl: string;
    }
  | {
      ok: false;
      message: string;
    };

export function ModusignApiView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("2026_입양계약서_홍길동");
  const [role, setRole] = useState("입양자");
  const [name, setName] = useState("홍길동");
  const [signingMethodType, setSigningMethodType] =
    useState<SigningMethodType>("KAKAO");
  const [contact, setContact] = useState("");
  const [requesterMappings, setRequesterMappings] = useState<MappingValue[]>(
    [],
  );
  const [signerMappings, setSignerMappings] = useState<MappingValue[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<SignatureResponse | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");
  const [documentStatus, setDocumentStatus] = useState("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const result = (await fetch("/api/modusign/templates", {
          cache: "no-store",
        }).then((res) => res.json())) as TemplatesResponse;

        if (!result.ok) {
          setMessage(result.message);
          return;
        }

        setTemplates(result.templates);

        const firstTemplate = result.templates[0];
        if (firstTemplate) {
          const firstRole = getDefaultRole(firstTemplate);

          setTemplate(firstTemplate, firstRole);
          await loadTemplateFields(firstTemplate.id, firstRole);
        } else {
          setRequesterMappings([]);
          setSignerMappings([]);
          setMessage(result.message ?? "조회된 템플릿이 없습니다.");
        }
      } catch {
        setMessage("템플릿 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoadingTemplates(false);
      }
    }

    loadTemplates();
  }, []);

  function setTemplate(template: Template, nextRole = getDefaultRole(template)) {
    setTemplateId(template.id);
    setRole(nextRole);
    setAvailableRoles(template.participants?.map((item) => item.role) ?? []);
    setRequesterMappings([]);
    setSignerMappings([]);
    setResponse(null);
    setDocumentPreviewUrl("");
    setDocumentStatus("");
    setMessage("");
  }

  async function loadTemplateFields(id: string, selectedRole = role) {
    if (!id.trim()) {
      setMessage("템플릿을 먼저 선택해 주세요.");
      setRequesterMappings([]);
      setSignerMappings([]);
      return;
    }

    setIsLoadingLabels(true);
    setMessage("");
    setRequesterMappings([]);
    setSignerMappings([]);

    try {
      const result = (await fetch(
        `/api/modusign/templates/${encodeURIComponent(
          id.trim(),
        )}?role=${encodeURIComponent(selectedRole.trim())}`,
        { cache: "no-store" },
      ).then((res) => res.json())) as TemplateDetailResponse;

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setAvailableRoles(result.allParticipantRoles);
      setRequesterMappings(
        result.requesterInputs.map((input) => ({
          dataLabel: input.dataLabel,
          type: input.type,
          value: "",
        })),
      );
      setSignerMappings(
        result.participantFields.map((field) => ({
          dataLabel: field.dataLabel,
          type: field.type,
          value: "",
        })),
      );
      setMessage(
        `${selectedRole} 역할 기준으로 요청자 입력 ${result.requesterInputs.length}개, 서명자 입력 ${result.participantFields.length}개를 불러왔습니다. NAME/SIGNATURE처럼 API로 미리 채울 수 없는 필드는 제외했습니다.`,
      );
    } catch {
      setMessage("데이터 라벨 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingLabels(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResponse(null);
    setDocumentPreviewUrl("");
    setDocumentStatus("");
    setMessage("");

    const normalizedContact =
      signingMethodType === "KAKAO"
        ? contact.replace(/\D/g, "")
        : contact.trim();

    if (signingMethodType === "KAKAO" && !/^010\d{8}$/.test(normalizedContact)) {
      setMessage("카카오톡 요청은 010으로 시작하는 휴대폰 번호 11자리가 필요합니다.");
      setIsSubmitting(false);
      return;
    }

    const requesterInputMappings = requesterMappings
      .filter((mapping) => mapping.dataLabel.trim() && mapping.value.trim())
      .map((mapping) => ({
        dataLabel: mapping.dataLabel.trim(),
        value: coerceMappingValue(mapping),
      }));
    const fieldMappings = signerMappings
      .filter((mapping) => mapping.dataLabel.trim() && mapping.value.trim())
      .map((mapping) => ({
        dataLabel: mapping.dataLabel.trim(),
        excluded: false,
        prefilledValue: coerceMappingValue(mapping),
      }));

    try {
      const result = (await fetch("/api/modusign/request-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          title,
          participants: [
            {
              role,
              name,
              signingMethod: {
                type: signingMethodType,
                value: normalizedContact,
              },
              fieldMappings,
              locale: "ko",
            },
          ],
          inputMappings: requesterInputMappings,
        }),
      }).then((res) => res.json())) as SignatureResponse;

      setResponse(result);
      if ("document" in result) {
        setDocumentStatus(result.document.status);
        await loadCompletedDocument(result.document.id);
      }
    } catch {
      setMessage("서명 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadCompletedDocument(documentId: string) {
    setIsLoadingDocument(true);
    setMessage("");

    try {
      const detail = (await fetch(
        `/api/modusign/documents/${encodeURIComponent(documentId)}`,
        { cache: "no-store" },
      ).then((res) => res.json())) as DocumentDetailResponse;

      if (!detail.ok) {
        setMessage(detail.message);
        return;
      }

      setDocumentStatus(detail.document.status);

      if (detail.document.file?.downloadUrl) {
        setDocumentPreviewUrl(detail.document.file.downloadUrl);
        return;
      }

      const embedded = (await fetch(
        `/api/modusign/documents/${encodeURIComponent(
          documentId,
        )}/embedded-view`,
        { cache: "no-store" },
      ).then((res) => res.json())) as EmbeddedViewResponse;

      if (embedded.ok) {
        setDocumentPreviewUrl(embedded.embeddedUrl);
      } else {
        setMessage(
          `${detail.document.status} 상태입니다. 문서 보기 URL은 아직 준비되지 않았습니다.`,
        );
      }
    } catch {
      setMessage("문서 보기 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingDocument(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Modusign API"
          title="이전 모두싸인 연동 화면"
          description="공식 문서 기준으로 API로 미리 채울 수 있는 필드 타입만 전송합니다."
        />
        <section className="grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-300">
                템플릿 제목
              </span>
              <select
                value={templateId}
                onChange={async (event) => {
                  const nextTemplate = templates.find(
                    (template) => template.id === event.target.value,
                  );

                  if (!nextTemplate) {
                    return;
                  }

                  const nextRole = getDefaultRole(nextTemplate);

                  setTemplate(nextTemplate, nextRole);
                  await loadTemplateFields(nextTemplate.id, nextRole);
                }}
                disabled={isLoadingTemplates || templates.length === 0}
                className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-blue-500"
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

            <ReadOnlyField label="선택된 템플릿 ID" value={templateId} />

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-300">역할명</span>
              <select
                value={role}
                onChange={async (event) => {
                  const nextRole = event.target.value;
                  setRole(nextRole);
                  await loadTemplateFields(templateId, nextRole);
                }}
                className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-blue-500"
              >
                {availableRoles.length > 0 ? (
                  availableRoles.map((availableRole) => (
                    <option key={availableRole} value={availableRole}>
                      {availableRole}
                    </option>
                  ))
                ) : (
                  <option value={role}>{role}</option>
                )}
              </select>
            </label>

            <button
              type="button"
              onClick={() => loadTemplateFields(templateId, role)}
              disabled={isLoadingLabels || !templateId}
              className="h-10 w-full rounded-md border border-blue-500/40 bg-blue-950/40 px-3 text-sm font-bold text-blue-200 disabled:opacity-50"
            >
              {isLoadingLabels ? "불러오는 중" : "역할 기준 필드 다시 불러오기"}
            </button>

            <TextField label="문서 제목" value={title} onChange={setTitle} />
            <TextField label="참여자 이름" value={name} onChange={setName} />

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

            <MappingSection
              title="요청자 입력"
              emptyMessage="요청자가 API로 미리 채울 수 있는 TEXT 입력란이 없습니다."
              mappings={requesterMappings}
              onAdd={() =>
                setRequesterMappings((current) => [
                  ...current,
                  { dataLabel: "", type: "TEXT", value: "" },
                ])
              }
              onChange={(index, field, value) =>
                updateMapping(setRequesterMappings, index, field, value)
              }
              onRemove={(index) =>
                setRequesterMappings((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />

            <MappingSection
              title={`${role} 서명자 입력`}
              emptyMessage={`${role} 역할에서 API로 미리 채울 수 있는 서명자 입력란이 없습니다.`}
              mappings={signerMappings}
              tone="orange"
              onAdd={() =>
                setSignerMappings((current) => [
                  ...current,
                  { dataLabel: "", type: "TEXT", value: "" },
                ])
              }
              onChange={(index, field, value) =>
                updateMapping(setSignerMappings, index, field, value)
              }
              onRemove={(index) =>
                setSignerMappings((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />

            {message ? (
              <p className="rounded-md border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !templateId || !role || !contact}
              className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isSubmitting ? "요청 중" : "실제 모두싸인 서명 요청"}
            </button>
          </form>

          <ResponsePanel
            response={response}
            documentPreviewUrl={documentPreviewUrl}
            documentStatus={documentStatus}
            isLoadingDocument={isLoadingDocument}
            onRefreshDocument={loadCompletedDocument}
          />
        </section>
      </div>
    </AdminShell>
  );
}

function getDefaultRole(template: Template) {
  return (
    template.participants?.find((participant) => participant.role === "입양자")
      ?.role ??
    template.participants?.[0]?.role ??
    "입양자"
  );
}

function coerceMappingValue(mapping: MappingValue) {
  if (mapping.type === "DATE") {
    return mapping.value.trim();
  }

  return mapping.value.trim();
}

function updateMapping(
  setMappings: React.Dispatch<React.SetStateAction<MappingValue[]>>,
  index: number,
  field: keyof MappingValue,
  value: string,
) {
  setMappings((current) =>
    current.map((mapping, itemIndex) =>
      itemIndex === index ? { ...mapping, [field]: value } : mapping,
    ),
  );
}

function MappingSection({
  title,
  emptyMessage,
  mappings,
  tone = "slate",
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  emptyMessage: string;
  mappings: MappingValue[];
  tone?: "slate" | "orange";
  onAdd: () => void;
  onChange: (index: number, field: keyof MappingValue, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const toneClass =
    tone === "orange"
      ? "border-orange-500/30 bg-orange-950/30"
      : "border-slate-800 bg-slate-950";

  return (
    <div className={`space-y-3 rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="h-8 rounded border border-slate-700 px-3 text-xs"
        >
          수동 추가
        </button>
      </div>

      {mappings.length === 0 ? (
        <p className="rounded-md border border-slate-800 bg-slate-900 p-3 text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        mappings.map((mapping, index) => (
          <MappingRow
            key={`${mapping.dataLabel}-${index}`}
            mapping={mapping}
            onChange={(field, value) => onChange(index, field, value)}
            onRemove={() => onRemove(index)}
          />
        ))
      )}
    </div>
  );
}

function MappingRow({
  mapping,
  onChange,
  onRemove,
}: {
  mapping: MappingValue;
  onChange: (field: keyof MappingValue, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_80px_1fr_auto]">
      <input
        value={mapping.dataLabel}
        onChange={(event) => onChange("dataLabel", event.target.value)}
        className="h-10 rounded border border-slate-700 bg-slate-900 px-3 text-sm"
        placeholder="dataLabel"
      />
      <input
        value={mapping.type}
        onChange={(event) => onChange("type", event.target.value)}
        className="h-10 rounded border border-slate-700 bg-slate-900 px-3 text-sm text-slate-400"
        placeholder="type"
      />
      <input
        value={mapping.value}
        onChange={(event) => onChange("value", event.target.value)}
        className="h-10 rounded border border-slate-700 bg-slate-900 px-3 text-sm"
        placeholder={mapping.type === "DATE" ? "2026-03-01" : "값"}
      />
      <button
        type="button"
        onClick={onRemove}
        className="h-10 rounded border border-slate-700 px-3 text-xs"
      >
        삭제
      </button>
    </div>
  );
}

function ResponsePanel({
  response,
  documentPreviewUrl,
  documentStatus,
  isLoadingDocument,
  onRefreshDocument,
}: {
  response: SignatureResponse | null;
  documentPreviewUrl: string;
  documentStatus: string;
  isLoadingDocument: boolean;
  onRefreshDocument: (documentId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-xl font-extrabold text-white">응답 결과</h2>
      {!response ? (
        <p className="mt-4 text-sm text-slate-400">
          요청 결과가 여기에 표시됩니다.
        </p>
      ) : "document" in response ? (
        <div className="mt-4 rounded-xl border border-green-500/40 bg-green-950/30 p-4">
          <p className="font-bold text-green-200">{response.message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-950 px-2.5 py-1 text-xs font-bold text-slate-300">
              상태: {documentStatus || response.document.status}
            </span>
            <button
              type="button"
              onClick={() => onRefreshDocument(response.document.id)}
              disabled={isLoadingDocument}
              className="h-8 rounded border border-green-500/40 px-3 text-xs font-bold text-green-200 disabled:opacity-50"
            >
              {isLoadingDocument ? "조회 중" : "계약서 보기 새로고침"}
            </button>
          </div>
          {documentPreviewUrl ? (
            <iframe
              src={documentPreviewUrl}
              title="작성된 계약서"
              className="mt-4 h-[560px] w-full rounded-lg border border-slate-700 bg-white"
            />
          ) : (
            <p className="mt-4 rounded bg-slate-950 p-3 text-sm text-slate-300">
              문서가 처리 중이면 잠시 뒤 새로고침하면 계약서 미리보기가
              표시됩니다.
            </p>
          )}
          <pre className="mt-3 overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(response.document, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4">
          <p className="font-bold text-red-200">{response.message}</p>
          {response.modusignError ? (
            <pre className="mt-3 overflow-auto rounded bg-slate-950 p-4 text-xs text-red-100">
              {JSON.stringify(response.modusignError, null, 2)}
            </pre>
          ) : null}
        </div>
      )}
    </div>
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
      className={`h-10 rounded-md border px-3 text-sm font-bold ${
        active
          ? "border-blue-500 bg-blue-950 text-blue-200"
          : "border-slate-700 bg-slate-950 text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <input
        value={value}
        className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-400"
        readOnly
      />
    </label>
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
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-blue-500"
        required
      />
    </label>
  );
}

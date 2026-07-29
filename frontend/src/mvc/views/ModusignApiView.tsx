"use client";

import { useEffect, useState } from "react";

import { AdminShell, PageHeader } from "@/mvc/views/AdminShell";

type SigningMethodType = "KAKAO" | "EMAIL";
type MappingValue = { dataLabel: string; type: string; value: string };

type Template = {
  id: string;
  title: string;
  participants?: Array<{ role: string }>;
};

type TemplatesResponse =
  | { ok: true; count: number; templates: Template[]; message?: string }
  | { ok: false; message: string; status?: number; detail?: unknown };

type TemplateDetailResponse =
  | {
      ok: true;
      role?: string;
      allParticipantRoles: string[];
      requesterInputs: Array<{ dataLabel: string; type: string }>;
      participantFields: Array<{ dataLabel: string; type: string; role: string }>;
    }
  | { ok: false; message: string; status?: number; detail?: unknown };

type SignatureResponse =
  | { message: string; document: { id: string; title: string; status: string } }
  | { message: string; modusignError?: unknown };

export function ModusignApiView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("2026_입양계약서_홍길동");
  const [role, setRole] = useState("입양자");
  const [name, setName] = useState("홍길동");
  const [signingMethodType, setSigningMethodType] =
    useState<SigningMethodType>("KAKAO");
  const [contact, setContact] = useState("");
  const [requesterMappings, setRequesterMappings] = useState<MappingValue[]>([]);
  const [signerMappings, setSignerMappings] = useState<MappingValue[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<SignatureResponse | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
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
        setIsLoadingTemplates(false);

        const firstTemplate = result.templates[0];
        if (firstTemplate) {
          const firstRole = getDefaultRole(firstTemplate);
          setTemplate(firstTemplate, firstRole);
          void loadTemplateFields(firstTemplate.id, firstRole);
        } else {
          setMessage(result.message ?? "조회된 템플릿이 없습니다.");
        }
      } catch {
        setMessage("템플릿 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoadingTemplates(false);
      }
    }

    void loadTemplates();
  }, []);

  function setTemplate(template: Template, nextRole = getDefaultRole(template)) {
    setTemplateId(template.id);
    setRole(nextRole);
    setAvailableRoles(template.participants?.map((item) => item.role) ?? []);
    setRequesterMappings([]);
    setSignerMappings([]);
    setResponse(null);
    setMessage("");
  }

  async function loadTemplateFields(id: string, selectedRole = role) {
    if (!id.trim()) {
      setMessage("템플릿을 먼저 선택해 주세요.");
      return;
    }

    setIsLoadingLabels(true);
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
        `${selectedRole} 역할 기준으로 입력란을 불러왔습니다. API로 미리 채울 수 없는 필드는 제외했습니다.`,
      );
    } catch {
      setMessage("템플릿 데이터 라벨을 불러오지 못했습니다.");
    } finally {
      setIsLoadingLabels(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResponse(null);

    const normalizedContact =
      signingMethodType === "KAKAO" ? contact.replace(/\D/g, "") : contact;

    if (signingMethodType === "KAKAO" && !/^010\d{8}$/.test(normalizedContact)) {
      setMessage("카카오톡 요청은 010으로 시작하는 휴대폰 번호 11자리가 필요합니다.");
      setIsSubmitting(false);
      return;
    }

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
              signingMethod: { type: signingMethodType, value: normalizedContact },
              fieldMappings: signerMappings
                .filter((mapping) => mapping.dataLabel.trim())
                .map((mapping) => ({
                  dataLabel: mapping.dataLabel,
                  excluded: false,
                  prefilledValue: mapping.value.trim(),
                })),
              locale: "ko",
            },
          ],
          inputMappings: requesterMappings
            .filter((mapping) => mapping.dataLabel.trim())
            .map((mapping) => ({
              dataLabel: mapping.dataLabel,
              value: mapping.value.trim(),
            })),
        }),
      }).then((res) => res.json())) as SignatureResponse;

      setResponse(result);
      setMessage("");
    } catch {
      setResponse({ message: "서명 요청 중 오류가 발생했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Modusign API"
          title="모두싸인 템플릿 서명 요청"
          description="템플릿 제목을 선택하고 역할에 맞는 입력값을 채운 뒤 서명 요청을 테스트합니다."
        />

        <section className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-200 bg-foreground p-5"
          >
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-700">템플릿 제목</span>
              <select
                value={templateId}
                onChange={async (event) => {
                  const nextTemplate = templates.find(
                    (template) => template.id === event.target.value,
                  );
                  if (!nextTemplate) return;
                  const nextRole = getDefaultRole(nextTemplate);
                  setTemplate(nextTemplate, nextRole);
                  await loadTemplateFields(nextTemplate.id, nextRole);
                }}
                disabled={isLoadingTemplates || templates.length === 0}
                className="h-11 w-full rounded-md border border-slate-300 bg-foreground px-3 text-sm outline-none focus:border-blue-500"
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

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-700">역할명</span>
              <select
                value={role}
                onChange={async (event) => {
                  const nextRole = event.target.value;
                  setRole(nextRole);
                  await loadTemplateFields(templateId, nextRole);
                }}
                className="h-11 w-full rounded-md border border-slate-300 bg-foreground px-3 text-sm outline-none focus:border-blue-500"
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
              className="h-10 w-full rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-700 disabled:opacity-50"
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
              emptyMessage="요청자가 API로 미리 채울 수 있는 입력란이 없습니다."
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
            />

            <MappingSection
              title={`${role} 서명자 입력`}
              emptyMessage={`${role} 역할에서 API로 미리 채울 수 있는 입력란이 없습니다.`}
              mappings={signerMappings}
              onAdd={() =>
                setSignerMappings((current) => [
                  ...current,
                  { dataLabel: "", type: "TEXT", value: "" },
                ])
              }
              onChange={(index, field, value) =>
                updateMapping(setSignerMappings, index, field, value)
              }
            />

            {message ? (
              <p className="rounded-md border border-slate-200 bg-foreground p-3 text-sm text-slate-700">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !templateId || !role || !contact}
              className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white disabled:bg-slate-300"
            >
              {isSubmitting ? "요청 중" : "실제 모두싸인 서명 요청"}
            </button>
          </form>

          <ResponsePanel response={response} />
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
  onAdd,
  onChange,
}: {
  title: string;
  emptyMessage: string;
  mappings: MappingValue[];
  onAdd: () => void;
  onChange: (index: number, field: keyof MappingValue, value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-foreground p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="h-8 rounded border border-slate-300 px-3 text-xs"
        >
          수동 추가
        </button>
      </div>

      {mappings.length === 0 ? (
        <p className="rounded-md border border-slate-200 bg-foreground p-3 text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        mappings.map((mapping, index) => (
          <MappingRow
            key={`${mapping.dataLabel}-${index}`}
            mapping={mapping}
            onChange={(field, value) => onChange(index, field, value)}
          />
        ))
      )}
    </div>
  );
}

function MappingRow({
  mapping,
  onChange,
}: {
  mapping: MappingValue;
  onChange: (field: keyof MappingValue, value: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input
        value={mapping.dataLabel}
        onChange={(event) => onChange("dataLabel", event.target.value)}
        className="h-10 rounded border border-slate-300 bg-foreground px-3 text-sm"
        placeholder="dataLabel"
      />
      <input
        value={mapping.value}
        onChange={(event) => onChange("value", event.target.value)}
        className="h-10 rounded border border-slate-300 bg-foreground px-3 text-sm"
        placeholder={mapping.type === "DATE" ? "2026-03-01" : "값"}
      />
    </div>
  );
}

function ResponsePanel({ response }: { response: SignatureResponse | null }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-foreground p-5">
      <h2 className="text-xl font-extrabold text-slate-950">응답 결과</h2>
      {!response ? (
        <p className="mt-4 text-sm text-slate-400">
          요청 결과가 여기에 표시됩니다.
        </p>
      ) : "document" in response ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="font-bold text-green-700">{response.message}</p>
          <pre className="mt-3 overflow-auto rounded bg-white p-4 text-xs text-slate-700">
            {JSON.stringify(response.document, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-bold text-red-700">{response.message}</p>
          {response.modusignError ? (
            <pre className="mt-3 overflow-auto rounded bg-white p-4 text-xs text-red-700">
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
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-slate-300 bg-foreground text-slate-700"
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
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-slate-300 bg-foreground px-3 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}

import { NextRequest, NextResponse } from "next/server";

import {
  ModusignApiError,
  getModusignTemplate,
  getModusignTemplates,
  requestSignatureWithTemplate,
} from "@/lib/modusign/modusign.client";

import type {
  ModusignAttachmentMapping,
  ModusignInputMapping,
  ModusignParticipantMapping,
  ModusignTemplateRequest,
} from "@/lib/modusign/modusign.types";

interface RequestSignatureBody {
  templateId?: string;
  title: string;
  participants: ModusignParticipantMapping[];
  inputMappings?: ModusignInputMapping[];
  attachmentMappings?: ModusignAttachmentMapping[];
}

function isValidRequestBody(body: unknown): body is RequestSignatureBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const value = body as Partial<RequestSignatureBody>;

  return (
    typeof value.title === "string" &&
    value.title.trim().length >= 1 &&
    value.title.trim().length <= 100 &&
    Array.isArray(value.participants) &&
    value.participants.length >= 1 &&
    value.participants.length <= 30
  );
}

function createFreshDocumentTitle(title: string) {
  const requestStamp = new Date()
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14);
  const suffix = `-${requestStamp}`;
  const normalizedTitle = title.trim();
  const maxBaseLength = 100 - suffix.length;

  return `${normalizedTitle.slice(0, maxBaseLength)}${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isValidRequestBody(body)) {
      return NextResponse.json(
        { message: "요청 데이터가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const configuredTemplateId =
      body.templateId || process.env.MODUSIGN_TEMPLATE_ID;
    const templateId =
      configuredTemplateId || (await getOnlyTemplateId());

    if (!templateId) {
      return NextResponse.json(
        { message: "모두싸인 계정에 사용할 템플릿이 없습니다." },
        { status: 400 },
      );
    }

    const template = await getModusignTemplate(templateId);
    const defaultRole = template.participants?.[0]?.role;
    const inputValues = new Map(
      (body.inputMappings ?? []).map((mapping) => [
        mapping.dataLabel,
        mapping.value,
      ]),
    );
    const participants = body.participants.map((participant) => ({
      ...participant,
      role: participant.role?.trim() || defaultRole || "",
      fieldMappings: [
        ...(participant.fieldMappings ?? []).map((mapping) => ({
          ...mapping,
          excluded: mapping.excluded ?? false,
        })),
        ...(template.participants
          ?.find(
            (templateParticipant) =>
              templateParticipant.role ===
              (participant.role?.trim() || defaultRole),
          )
          ?.fields?.flatMap((field) => {
            if (!field.dataLabel || !inputValues.has(field.dataLabel)) {
              return [];
            }

            return [
              {
                dataLabel: field.dataLabel,
                excluded: false,
                prefilledValue: inputValues.get(field.dataLabel),
              },
            ];
          }) ?? []),
      ],
    }));

    if (participants.some((participant) => !participant.role)) {
      return NextResponse.json(
        { message: "모두싸인 템플릿에서 서명자 역할을 찾지 못했습니다." },
        { status: 400 },
      );
    }

    const requestId = crypto.randomUUID();
    const payload: ModusignTemplateRequest = {
      templateId,
      document: {
        title: createFreshDocumentTitle(body.title),
        participantMappings: participants,
        requesterInputMappings: (body.inputMappings ?? []).filter(
          (mapping) =>
            template.requesterInputs?.some(
              (input) => input.dataLabel === mapping.dataLabel,
            ) ?? false,
        ),
        requesterAttachmentMappings: body.attachmentMappings ?? [],
        metadatas: [
          { key: "requestId", value: requestId },
          { key: "sourceTitle", value: body.title.trim().slice(0, 255) },
        ],
      },
    };

    const document = await requestSignatureWithTemplate(payload);

    return NextResponse.json(
      {
        message: "서명 요청이 전송되었습니다.",
        document,
        requestId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ModusignApiError) {
      const detail = getModusignResponseMessage(error.responseBody);
      return NextResponse.json(
        {
          message: [getModusignErrorMessage(error.status), detail]
            .filter(Boolean)
            .join(" "),
          modusignError: error.responseBody,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "서명 요청 중 서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

function getModusignResponseMessage(responseBody: unknown): string {
  if (!responseBody || typeof responseBody !== "object") return "";

  const body = responseBody as Record<string, unknown>;
  const directMessage = body.message ?? body.error ?? body.detail;

  if (typeof directMessage === "string") return directMessage;

  if (Array.isArray(directMessage)) {
    return directMessage
      .map((item) =>
        typeof item === "string"
          ? item
          : JSON.stringify(item),
      )
      .join(", ");
  }

  return "";
}

async function getOnlyTemplateId() {
  const result = await getModusignTemplates({ limit: 1 });

  return result.templates?.[0]?.id;
}

function getModusignErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return "모두싸인 API 인증에 실패했습니다.";
    case 403:
      return "모두싸인 API 사용 권한 또는 사용량을 확인하세요.";
    case 404:
      return "모두싸인 템플릿을 찾을 수 없습니다.";
    case 422:
      return "요청 데이터가 유효하지 않습니다. 템플릿 역할명, 연락처, 데이터를 확인하세요.";
    case 429:
      return "모두싸인 API 호출 한도를 초과했습니다.";
    default:
      return "모두싸인 서명 요청에 실패했습니다.";
  }
}

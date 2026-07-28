import { NextRequest, NextResponse } from "next/server";

import {
  ModusignApiError,
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

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isValidRequestBody(body)) {
      return NextResponse.json(
        { message: "요청 데이터가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const templateId = body.templateId || process.env.MODUSIGN_TEMPLATE_ID;

    if (!templateId) {
      return NextResponse.json(
        { message: "템플릿을 선택하거나 MODUSIGN_TEMPLATE_ID를 설정해 주세요." },
        { status: 400 },
      );
    }

    const payload: ModusignTemplateRequest = {
      templateId,
      document: {
        title: body.title.trim(),
        participantMappings: body.participants,
        requesterInputMappings: body.inputMappings ?? [],
        requesterAttachmentMappings: body.attachmentMappings ?? [],
      },
    };

    const document = await requestSignatureWithTemplate(payload);

    return NextResponse.json(
      {
        message: "서명 요청을 전송했습니다.",
        document,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ModusignApiError) {
      return NextResponse.json(
        {
          message: getModusignErrorMessage(error.status),
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

function getModusignErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return "모두싸인 API 인증에 실패했습니다.";
    case 403:
      return "모두싸인 API 사용 권한 또는 사용량을 확인하세요.";
    case 404:
      return "모두싸인 템플릿을 찾을 수 없습니다.";
    case 422:
      return "요청 데이터가 유효하지 않습니다. 템플릿 역할명, 연락처, 데이터 라벨을 확인하세요.";
    case 429:
      return "모두싸인 API 호출 한도를 초과했습니다.";
    default:
      return "모두싸인 서명 요청에 실패했습니다.";
  }
}

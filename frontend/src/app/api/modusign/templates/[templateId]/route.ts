import { NextRequest, NextResponse } from "next/server";

import {
  ModusignApiError,
  getModusignTemplate,
} from "@/lib/modusign/modusign.client";

type TemplateField = {
  type?: string;
  dataLabel?: string;
};

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

const PREFILLABLE_REQUESTER_TYPES = new Set(["TEXT"]);
const PREFILLABLE_SIGNER_TYPES = new Set([
  "TEXT",
  "COMPANY_NAME",
  "DATE",
  "DROPDOWN",
]);

export async function GET(request: NextRequest, context: RouteContext) {
  const { templateId } = await context.params;
  const role = request.nextUrl.searchParams.get("role")?.trim();

  try {
    const template = await getModusignTemplate(templateId);
    const requesterInputs =
      template.requesterInputs
        ?.filter(
          (input) =>
            input.dataLabel &&
            (!input.type || PREFILLABLE_REQUESTER_TYPES.has(input.type)),
        )
        .map((input) => ({
          dataLabel: input.dataLabel,
          type: input.type ?? "TEXT",
        })) ?? [];
    const matchingParticipants =
      template.participants?.filter((participant) =>
        role ? participant.role === role : true,
      ) ?? [];
    const participantFields = matchingParticipants.flatMap((participant) =>
      (participant.fields ?? [])
        .filter(
          (field: TemplateField) =>
            field.dataLabel &&
            field.type &&
            PREFILLABLE_SIGNER_TYPES.has(field.type),
        )
        .map((field: TemplateField) => ({
          dataLabel: field.dataLabel,
          type: field.type,
          role: participant.role,
        })),
    );
    const allParticipantRoles =
      template.participants?.map((participant) => participant.role) ?? [];

    return NextResponse.json({
      ok: true,
      role,
      allParticipantRoles,
      requesterInputs: dedupeByDataLabel(requesterInputs),
      participantFields: dedupeByDataLabel(participantFields),
    });
  } catch (error) {
    if (error instanceof ModusignApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: "템플릿 상세 정보를 가져오지 못했습니다.",
          status: error.status,
          detail: error.responseBody,
        },
        { status: error.status },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: false, message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

function dedupeByDataLabel<T extends { dataLabel?: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (!item.dataLabel || seen.has(item.dataLabel)) {
      return false;
    }

    seen.add(item.dataLabel);
    return true;
  });
}

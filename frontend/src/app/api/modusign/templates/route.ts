import { NextResponse } from "next/server";

import {
  ModusignApiError,
  getModusignTemplates,
} from "@/lib/modusign/modusign.client";

export async function GET() {
  try {
    const result = await getModusignTemplates({ limit: 20 });
    const templates = result.templates ?? [];

    return NextResponse.json({
      ok: true,
      count: result.count ?? result.totalCount ?? templates.length,
      templates,
      message:
        templates.length > 0
          ? "템플릿 목록을 가져왔습니다."
          : "조회된 템플릿이 없습니다. 모두싸인에 템플릿을 만들거나 MODUSIGN_TEMPLATE_ID를 설정해 주세요.",
    });
  } catch (error) {
    if (error instanceof ModusignApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: "템플릿 목록을 가져오지 못했습니다.",
          status: error.status,
          detail: error.responseBody,
        },
        { status: error.status },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: false, message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

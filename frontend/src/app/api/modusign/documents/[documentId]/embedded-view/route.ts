import { NextRequest, NextResponse } from "next/server";

import {
  ModusignApiError,
  getModusignEmbeddedView,
} from "@/lib/modusign/modusign.client";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { documentId } = await context.params;

  try {
    const result = await getModusignEmbeddedView(documentId);

    return NextResponse.json({
      ok: true,
      embeddedUrl: result.embeddedUrl,
    });
  } catch (error) {
    if (error instanceof ModusignApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: "문서 보기 URL을 가져오지 못했습니다.",
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

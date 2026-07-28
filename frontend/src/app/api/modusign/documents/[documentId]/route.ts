import { NextRequest, NextResponse } from "next/server";

import {
  ModusignApiError,
  getModusignDocument,
} from "@/lib/modusign/modusign.client";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { documentId } = await context.params;

  try {
    const document = await getModusignDocument(documentId);

    return NextResponse.json({
      ok: true,
      document,
    });
  } catch (error) {
    if (error instanceof ModusignApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: "문서 상세 정보를 가져오지 못했습니다.",
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

import { NextResponse } from "next/server";

import {
  ModusignApiError,
  getModusignDocuments,
} from "@/lib/modusign/modusign.client";

export async function GET() {
  try {
    const result = await getModusignDocuments({ limit: 20 });

    return NextResponse.json({
      ok: true,
      totalCount: result.totalCount ?? result.count ?? 0,
      documents: result.documents ?? [],
    });
  } catch (error) {
    if (error instanceof ModusignApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: "계약서 목록을 가져오지 못했습니다.",
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
      {
        ok: false,
        message: "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

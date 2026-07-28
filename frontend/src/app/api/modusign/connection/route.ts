import { NextResponse } from "next/server";

import {
  ModusignApiError,
  checkModusignConnection,
} from "@/lib/modusign/modusign.client";

export async function GET() {
  try {
    const result = await checkModusignConnection();

    return NextResponse.json({
      ok: true,
      message: "모두싸인 API 연결에 성공했습니다.",
      ...result,
    });
  } catch (error) {
    if (error instanceof ModusignApiError) {
      return NextResponse.json(
        {
          ok: false,
          message: "모두싸인 API 연결에 실패했습니다.",
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

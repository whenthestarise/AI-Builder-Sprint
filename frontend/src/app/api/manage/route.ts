import { NextResponse } from "next/server";

import { getManageViewModel } from "@/mvc/controllers/adminController";

export function GET() {
  return NextResponse.json({
    ok: true,
    data: getManageViewModel(),
  });
}

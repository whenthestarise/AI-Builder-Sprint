import { NextResponse } from "next/server";

import { getManageViewModel } from "@/mvc/controllers/adminController";

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: await getManageViewModel(),
  });
}

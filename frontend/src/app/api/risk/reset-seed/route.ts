import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

export async function POST() {
  try {
    const backendReset = await resetViaBackend();

    if (backendReset.ok) {
      return NextResponse.json({ ok: true });
    }

    await resetViaSeedScript();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "데이터셋 초기화 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

async function resetViaBackend() {
  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/api/risk/reset-seed`,
      {
        method: "POST",
        cache: "no-store",
      },
    );

    return { ok: response.ok };
  } catch {
    return { ok: false };
  }
}

async function resetViaSeedScript() {
  await execFileAsync(
    "python",
    ["-m", "scripts.seed_demo_data"],
    {
      cwd: getBackendDirectory(),
      windowsHide: true,
      timeout: 30_000,
    },
  );
}

function getBackendDirectory() {
  return path.resolve(process.cwd(), "..", "backend");
}

function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://113.131.34.14:8000"
  ).replace(/\/$/, "");
}

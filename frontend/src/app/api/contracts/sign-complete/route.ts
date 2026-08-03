import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SignCompletePayload = {
  contractId: string;
  petId: string;
  petName: string;
  adopterName: string;
  applicantPhone?: string;
  signedAt: string;
};

function isValidPayload(value: unknown): value is SignCompletePayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<SignCompletePayload>;

  return (
    typeof payload.contractId === "string" &&
    typeof payload.petId === "string" &&
    typeof payload.petName === "string" &&
    typeof payload.adopterName === "string" &&
    typeof payload.signedAt === "string"
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload: unknown = await request.json();

    if (!isValidPayload(payload)) {
      return NextResponse.json(
        { detail: "계약 완료 요청 데이터가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const { response, tried } = await postSignComplete(payload);
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        result ?? {
          detail: `계약 완료 처리에 실패했습니다. Tried: ${tried.join(", ")}`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(result ?? { ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "계약 완료 처리 중 서버 오류가 발생했습니다.",
      },
      { status: 502 },
    );
  }
}

async function postSignComplete(payload: SignCompletePayload) {
  const tried: string[] = [];
  let lastError: unknown = null;

  for (const baseUrl of getBackendBaseUrls()) {
    const url = `${baseUrl}/api/contracts/sign-complete`;
    tried.push(url);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      return { response, tried };
    } catch (error) {
      lastError = error;
    }
  }

  const cause =
    lastError instanceof Error ? lastError.message : "fetch failed";

  throw new Error(
    `Backend sign-complete API is unavailable. Tried: ${tried.join(", ")}. ${cause}`,
  );
}

function getBackendBaseUrls() {
  return Array.from(
    new Set(
      [
        process.env.NEXT_PUBLIC_API_BASE_URL,
        process.env.API_BASE_URL,
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://192.168.56.1:8000",
        "http://113.131.34.14:8000",
      ]
        .filter((value): value is string => Boolean(value?.trim()))
        .map((value) => value.trim().replace(/\/$/, "")),
    ),
  );
}

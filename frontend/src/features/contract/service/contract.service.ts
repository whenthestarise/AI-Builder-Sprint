import type {
  ModusignAttachmentMapping,
  ModusignDocumentResponse,
  ModusignInputMapping,
  ModusignParticipantMapping,
} from "@/lib/modusign/modusign.types";

/* ==============================
 * 서명 요청
 * ============================== */

export interface RequestContractSignatureParams {
  title: string;
  participants: ModusignParticipantMapping[];
  inputMappings?: ModusignInputMapping[];
  attachmentMappings?: ModusignAttachmentMapping[];
}

export interface RequestContractSignatureResponse {
  message: string;
  document: ModusignDocumentResponse;
}

/* ==============================
 * 계약서 목록 조회
 * ============================== */

export type ContractDocumentStatus =
  | "ON_PROCESSING"
  | "PROCESSING_FAILED"
  | "DRAFT"
  | "SCHEDULED"
  | "ON_GOING"
  | "APPROVAL_PENDING"
  | "ABORTED"
  | "COMPLETED";

export interface GetContractDocumentsParams {
  offset?: number;
  limit?: number;
  status?: ContractDocumentStatus;
  title?: string;
  orderBy?: "createdAt" | "updatedAt" | "title";
  orderDirection?: "asc" | "desc";
}

export interface GetContractDocumentsResponse {
  documents: ModusignDocumentResponse[];
  totalCount?: number;
  offset?: number;
  limit?: number;
}

/* ==============================
 * 공통 응답 처리
 * ============================== */

interface ApiErrorResponse {
  message?: string;
  error?: unknown;
}

async function parseResponse<T>(
  response: Response,
  defaultErrorMessage: string,
): Promise<T> {
  const responseText = await response.text();

  let result: T | ApiErrorResponse | null = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText) as T | ApiErrorResponse;
    } catch {
      if (!response.ok) {
        throw new Error(defaultErrorMessage);
      }
    }
  }

  if (!response.ok) {
    const errorResult = result as ApiErrorResponse | null;

    throw new Error(
      errorResult?.message ?? defaultErrorMessage,
    );
  }

  if (!result) {
    throw new Error("서버 응답 데이터가 없습니다.");
  }

  return result as T;
}

/* ==============================
 * 템플릿으로 서명 요청
 * ============================== */

export async function requestContractSignature(
  params: RequestContractSignatureParams,
): Promise<RequestContractSignatureResponse> {
  const response = await fetch(
    "/api/modusign/request-signature",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
  );

  return parseResponse<RequestContractSignatureResponse>(
    response,
    "전자계약 요청에 실패했습니다.",
  );
}

/* ==============================
 * 계약서 목록 가져오기
 * ============================== */

export async function getContractDocuments(
  params: GetContractDocumentsParams = {},
): Promise<GetContractDocumentsResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set(
    "offset",
    String(params.offset ?? 0),
  );

  searchParams.set(
    "limit",
    String(params.limit ?? 10),
  );

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.title?.trim()) {
    searchParams.set("title", params.title.trim());
  }

  if (params.orderBy) {
    searchParams.set("orderBy", params.orderBy);
  }

  if (params.orderDirection) {
    searchParams.set(
      "orderDirection",
      params.orderDirection,
    );
  }

  const response = await fetch(
    `/api/modusign/documents?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  return parseResponse<GetContractDocumentsResponse>(
    response,
    "계약서 목록을 불러오지 못했습니다.",
  );
}

/* ==============================
 * 특정 계약서 가져오기
 * ============================== */

export async function getContractDocument(
  documentId: string,
): Promise<ModusignDocumentResponse> {
  const normalizedDocumentId = documentId.trim();

  if (!normalizedDocumentId) {
    throw new Error("문서 ID가 필요합니다.");
  }

  const response = await fetch(
    `/api/modusign/documents/${encodeURIComponent(
      normalizedDocumentId,
    )}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  return parseResponse<ModusignDocumentResponse>(
    response,
    "계약서 정보를 불러오지 못했습니다.",
  );
}
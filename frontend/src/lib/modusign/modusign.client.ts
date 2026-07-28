import type {
  ModusignDocumentResponse,
  ModusignDocumentsResponse,
  ModusignTemplateDetailResponse,
  ModusignTemplateRequest,
  ModusignTemplatesResponse,
} from "./modusign.types";

const MODUSIGN_BASE_URL = "https://api.modusign.co.kr";

export class ModusignApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody: unknown,
  ) {
    super(message);
    this.name = "ModusignApiError";
  }
}

function getAuthorizationHeader() {
  const email = process.env.MODUSIGN_EMAIL;
  const apiKey = process.env.MODUSIGN_API_KEY;

  if (!email || !apiKey) {
    throw new Error(
      "MODUSIGN_EMAIL과 MODUSIGN_API_KEY를 .env.local에 설정해 주세요.",
    );
  }

  const credentials = Buffer.from(`${email}:${apiKey}`).toString("base64");

  return `Basic ${credentials}`;
}

async function requestModusign<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${MODUSIGN_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: getAuthorizationHeader(),
      ...init.headers,
    },
  });

  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ModusignApiError(
      "Modusign API request failed.",
      response.status,
      responseBody,
    );
  }

  return responseBody as T;
}

export async function getModusignTemplates({
  offset = 0,
  limit = 20,
}: {
  offset?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  const response = await requestModusign<ModusignTemplatesResponse>(
    `/templates?${params.toString()}`,
  );
  const fallbackTemplateId = process.env.MODUSIGN_TEMPLATE_ID;

  if (
    fallbackTemplateId &&
    (!response.templates || response.templates.length === 0)
  ) {
    return {
      ...response,
      count: 1,
      templates: [
        {
          id: fallbackTemplateId,
          title: "환경변수에 설정된 템플릿",
        },
      ],
    };
  }

  return response;
}

export async function getModusignTemplate(templateId: string) {
  return requestModusign<ModusignTemplateDetailResponse>(
    `/templates/${templateId}`,
  );
}

export async function getModusignDocuments({
  offset = 0,
  limit = 20,
}: {
  offset?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  return requestModusign<ModusignDocumentsResponse>(
    `/documents?${params.toString()}`,
  );
}

export async function getModusignDocument(documentId: string) {
  return requestModusign<ModusignDocumentResponse>(
    `/documents/${encodeURIComponent(documentId)}`,
  );
}

export async function getModusignEmbeddedView(documentId: string) {
  return requestModusign<{ embeddedUrl: string }>(
    `/documents/${encodeURIComponent(documentId)}/embedded-view`,
  );
}

export async function checkModusignConnection() {
  const documents = await getModusignDocuments({ limit: 1 });

  return {
    documentCount: documents.totalCount ?? documents.count,
  };
}

export async function requestSignatureWithTemplate(
  payload: ModusignTemplateRequest,
) {
  return requestModusign<ModusignDocumentResponse>(
    "/documents/request-with-template",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    },
  );
}

export type SigningMethodType =
  | "EMAIL"
  | "KAKAO"
  | "SECURE_LINK";

export interface ModusignSigningMethod {
  type: SigningMethodType;
  value: string;
}

export interface ModusignMobileIdentification {
  name: string;
  phoneNumber: string;
  allowOptions: Array<"SIMPLE_AUTH" | "SMS_OR_PASS">;
}

export interface ModusignVerification {
  password?: {
    value: string;
  };
  mobileIdentification?: ModusignMobileIdentification;
}

export interface ModusignAttachmentRequest {
  dataLabel: string;
  excluded?: boolean;
  required?: boolean;
}

export interface ModusignParticipantMapping {
  role: string;
  name?: string;
  signingMethod?: ModusignSigningMethod;
  signingDuration?: number;
  fieldMappings?: Array<{
    dataLabel: string;
    excluded?: boolean;
    prefilledValue?: string | boolean;
  }>;
  verification?: ModusignVerification;
  attachmentRequests?: ModusignAttachmentRequest[];
  locale?: "ko" | "en";
  excluded?: boolean;
}

export interface ModusignInputMapping {
  dataLabel: string;
  value: string | boolean;
}

export interface ModusignUploadedFile {
  fileId: string;
  token: string;
  name: string;
}

export interface ModusignAttachmentMapping {
  dataLabel: string;
  file: ModusignUploadedFile;
}

export interface ModusignCarbonCopy {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ModusignMetadata {
  key: string;
  value: string;
}

export interface ModusignTemplateRequest {
  templateId: string;
  brandId?: string;

  document: {
    title: string;
    participantMappings?: ModusignParticipantMapping[];
    requesterInputMappings?: ModusignInputMapping[];
    requesterAttachmentMappings?: ModusignAttachmentMapping[];
    carbonCopies?: ModusignCarbonCopy[];
    metadatas?: ModusignMetadata[];
  };
}

export type ModusignDocumentStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ON_GOING"
  | "ON_PROCESSING"
  | "APPROVAL_PENDING"
  | "ABORTED"
  | "COMPLETED"
  | "PROCESSING_FAILED";

export interface ModusignParticipantResponse {
  id: string;
  type: string;
  name: string;
  signingOrder: number;
  signingMethod: ModusignSigningMethod;
  locale: string;
}

export interface ModusignDocumentResponse {
  id: string;
  title: string;
  status: ModusignDocumentStatus;
  requester?: {
    email: string;
    name: string;
  };
  participants?: ModusignParticipantResponse[];
  currentSigningOrder?: number;
  file?: {
    downloadUrl?: string;
  } | null;
  createdAt: string;
}

export interface ModusignTemplateParticipant {
  type: string;
  role: string;
  signingOrder: number;
}

export interface ModusignTemplateResponse {
  id: string;
  title: string;
  requesterInputs?: Array<{
    type: string;
    dataLabel?: string;
    value?: string | boolean;
    required?: boolean;
  }>;
  participants?: ModusignTemplateParticipant[];
  createdAt?: string;
}

export interface ModusignTemplateDetailResponse
  extends ModusignTemplateResponse {
  participants?: Array<
    ModusignTemplateParticipant & {
      fields?: Array<{
        type: string;
        dataLabel?: string;
        required?: boolean;
      }>;
    }
  >;
}

export interface ModusignTemplatesResponse {
  count?: number;
  totalCount?: number;
  templates?: ModusignTemplateResponse[];
}

export interface ModusignDocumentsResponse {
  totalCount?: number;
  count?: number;
  documents?: ModusignDocumentResponse[];
}

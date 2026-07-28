"use client";

import { useState } from "react";

type ContractParticipant = {
  role: string;
  name: string;
  signingMethod: {
    type: string;
    value: string;
  };
  locale: string;
};

type InputMapping = {
  dataLabel: string;
  value: string | boolean;
};

type SignatureRequestPayload = {
  title: string;
  participants: ContractParticipant[];
  inputMappings: InputMapping[];
};

type ContractResponse = {
  document: {
    id: string;
  };
};

async function requestContractSignature(
  payload: SignatureRequestPayload,
): Promise<ContractResponse> {
  const response = await fetch("/api/contract/signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "서명 요청에 실패했습니다.");
  }

  return response.json();
}

export default function ContractRequestButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRequestSignature = async () => {
    try {
      setIsLoading(true);
      setMessage("");

      const result = await requestContractSignature({
        title: "유기동물_입양계약서_홍길동",
        participants: [
          {
            role: "입양자",
            name: "홍길동",
            signingMethod: {
              type: "EMAIL",
              value: "hong@example.com",
            },
            locale: "ko",
          },
        ],
        inputMappings: [
          {
            dataLabel: "입양자_주소",
            value: "부산광역시 수영구 광안해변로 448",
          },
          {
            dataLabel: "동물_이름",
            value: "초코",
          },
          {
            dataLabel: "책임입양_동의",
            value: true,
          },
        ],
      });

      setMessage(
        `서명 요청 완료: ${result.document.id}`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "서명 요청에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleRequestSignature}
        disabled={isLoading}
      >
        {isLoading
          ? "서명 요청 중..."
          : "전자계약 서명 요청"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
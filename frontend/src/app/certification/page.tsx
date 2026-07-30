import { CertificationFormView } from "@/mvc/views/CertificationFormView";
import type { CertificationRound } from "@/mvc/views/CertificationFormView";

type CertificationPageProps = {
  searchParams?: Promise<{
    round?: string;
    petId?: string;
    petName?: string;
    adopterName?: string;
    adoptionDate?: string;
  }>;
};

export default async function CertificationPage({
  searchParams,
}: CertificationPageProps) {
  const params = await searchParams;

  return (
    <CertificationFormView
      petId={params?.petId}
      round={parseRound(params?.round)}
      petName={params?.petName ?? "바오"}
      adopterName={params?.adopterName ?? "김민수"}
      adoptionDate={params?.adoptionDate}
    />
  );
}

function parseRound(round?: string): CertificationRound {
  const parsedRound = Number(round);

  if (
    parsedRound === 1 ||
    parsedRound === 2 ||
    parsedRound === 3 ||
    parsedRound === 4 ||
    parsedRound === 5 ||
    parsedRound === 6
  ) {
    return parsedRound;
  }

  return 3;
}

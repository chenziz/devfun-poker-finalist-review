import type { Metadata } from "next";
import { CandidatePool } from "../CandidatePool";

export const metadata: Metadata = {
  title: "30-Player Candidate Pool · Final Table Investigator",
  description: "Internal comparison board for 30 AI poker finalist candidates.",
};

export default function CandidatesPage() {
  return <CandidatePool />;
}

import type { Metadata } from "next";
import { FinalistHighlights } from "../FinalistHighlights";

export const metadata: Metadata = {
  title: "Finalist Highlight Review · Arena",
  description: "Internal review room for eight AI poker finalists and 80 representative replay clips.",
};

export default function FinalistHighlightsPage() {
  return <FinalistHighlights />;
}

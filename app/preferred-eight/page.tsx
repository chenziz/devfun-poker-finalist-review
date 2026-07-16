import type { Metadata } from "next";
import { PreferredEight } from "../PreferredEight";

export const metadata: Metadata = {
  title: "Preferred 8 Review Room · Final Table Investigator",
  description: "Fast internal review of eight preferred AI poker finalists and two comparison candidates.",
};

export default function PreferredEightPage() {
  return <PreferredEight />;
}

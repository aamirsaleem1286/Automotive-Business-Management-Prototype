import type { Metadata } from "next";
import { QuotesView } from "./QuotesView";

export const metadata: Metadata = {
  title: "Quotes & Approvals",
};

export default function QuotesPage() {
  return <QuotesView />;
}

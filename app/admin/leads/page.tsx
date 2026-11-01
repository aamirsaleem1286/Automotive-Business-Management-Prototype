import type { Metadata } from "next";
import { LeadsView } from "./LeadsView";

export const metadata: Metadata = {
  title: "Leads & CRM",
};

export default function LeadsPage() {
  return <LeadsView />;
}

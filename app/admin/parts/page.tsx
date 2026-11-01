import type { Metadata } from "next";
import { PartsView } from "./PartsView";

export const metadata: Metadata = {
  title: "Parts & Inventory",
};

export default function PartsPage() {
  return <PartsView />;
}

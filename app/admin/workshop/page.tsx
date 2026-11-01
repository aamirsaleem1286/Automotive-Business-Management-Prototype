import type { Metadata } from "next";
import { WorkshopView } from "./WorkshopView";

export const metadata: Metadata = {
  title: "Workshop Planner",
};

export default function WorkshopPage() {
  return <WorkshopView />;
}

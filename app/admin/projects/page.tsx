import type { Metadata } from "next";
import { ProjectsView } from "./ProjectsView";

export const metadata: Metadata = {
  title: "Restoration Jobs",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}

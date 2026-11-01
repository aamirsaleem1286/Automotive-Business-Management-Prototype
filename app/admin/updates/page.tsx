import type { Metadata } from "next";
import { UpdatesView } from "./UpdatesView";

export const metadata: Metadata = {
  title: "Customer Updates",
};

export default function UpdatesPage() {
  return <UpdatesView />;
}

import type { Metadata } from "next";
import { SettingsView } from "./SettingsView";

export const metadata: Metadata = {
  title: "System Setup",
};

export default function SettingsPage() {
  return <SettingsView />;
}

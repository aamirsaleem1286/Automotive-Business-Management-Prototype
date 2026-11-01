import type { Metadata } from "next";
import { StoreView } from "./StoreView";

export const metadata: Metadata = {
  title: "Online Store",
};

export default function StorePage() {
  return <StoreView />;
}

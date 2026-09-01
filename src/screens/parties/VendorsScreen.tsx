import { PartyManager } from "./PartyManager";

// Vendors = parties on the AP side (reuses the same manager as customers).
export function VendorsScreen() {
  return <PartyManager title="Vendors" endpoint="/vendors" noun="Vendor" dataKey="vendors" />;
}

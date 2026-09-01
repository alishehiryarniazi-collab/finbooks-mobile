import { PartyManager } from "./PartyManager";

// Customers = parties on the AR side.
export function CustomersScreen() {
  return <PartyManager title="Customers" endpoint="/customers" noun="Customer" dataKey="customers" />;
}

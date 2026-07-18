import { getVehicles, getVehicleEvents, getVehicleExpenses, getParkingTickets } from "@/lib/module-data";
import { CarHubPageClient } from "@/components/car/car-hub-page-client";

export default async function CarPage() {
  const [vehicles, events, expenses, tickets] = await Promise.all([
    getVehicles(), getVehicleEvents(), getVehicleExpenses(), getParkingTickets(),
  ]);
  return <CarHubPageClient vehicle={vehicles[0] ?? null} events={events} expenses={expenses} tickets={tickets} />;
}

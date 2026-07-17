import { getVehicles, getVehicleEvents, getVehicleExpenses } from "@/lib/module-data";
import { CarHubPageClient } from "@/components/car/car-hub-page-client";

export default async function CarPage() {
  const [vehicles, events, expenses] = await Promise.all([
    getVehicles(), getVehicleEvents(), getVehicleExpenses(),
  ]);
  return <CarHubPageClient vehicle={vehicles[0] ?? null} events={events} expenses={expenses} />;
}

"use client";

import { useMemo, useState } from "react";
import { Car, Plus, Pencil, Wrench, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CountdownBadge } from "@/components/shared/countdown-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormSelect } from "@/components/shared/form-field";
import { VEHICLE_EVENT_TYPES, VEHICLE_EVENT_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  createVehicle,
  updateVehicle,
  createVehicleEvent,
  createVehicleExpense,
} from "@/actions/modules";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Vehicle, VehicleEvent, VehicleExpense } from "@/lib/types";

const EXPENSE_CATEGORIES = ["fuel", "maintenance", "insurance", "tax", "parking", "other"] as const;

export function CarHubPageClient({
  vehicle,
  events,
  expenses,
}: {
  vehicle: Vehicle | null;
  events: VehicleEvent[];
  expenses: VehicleExpense[];
}) {
  const { run, isPending } = useRefreshAction();
  const [tab, setTab] = useState("profile");
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()),
    [events]
  );

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()),
    [expenses]
  );

  const expenseTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  async function handleVehicleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      vehicle ? updateVehicle(vehicle.id, formData) : createVehicle(formData)
    );
    if (result?.error) { toast.error("Could not save vehicle"); return; }
    toast.success(vehicle ? "Vehicle updated" : "Vehicle added");
    setVehicleDialogOpen(false);
  }

  async function handleEventSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!vehicle) return;
    const formData = new FormData(e.currentTarget);
    formData.set("vehicle_id", vehicle.id);
    const result = await run(() => createVehicleEvent(formData));
    if (result?.error) { toast.error("Could not save event"); return; }
    toast.success("Event logged");
    setEventDialogOpen(false);
  }

  async function handleExpenseSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!vehicle) return;
    const formData = new FormData(e.currentTarget);
    formData.set("vehicle_id", vehicle.id);
    const result = await run(() => createVehicleExpense(formData));
    if (result?.error) { toast.error("Could not save expense"); return; }
    toast.success("Expense added");
    setExpenseDialogOpen(false);
  }

  if (!vehicle) {
    return (
      <>
        <PageHeader
          title="Car Hub"
          description="MOT, insurance, service history, and running costs in one place."
        />
        <EmptyState
          icon={Car}
          title="No vehicle yet"
          description="Add your car to track MOT, insurance, road tax, service history, and expenses."
          action={
            <Button onClick={() => setVehicleDialogOpen(true)} className="rounded-xl">
              <Plus className="h-4 w-4 mr-1" /> Add Vehicle
            </Button>
          }
        />
        <VehicleDialog
          open={vehicleDialogOpen}
          onOpenChange={setVehicleDialogOpen}
          vehicle={null}
          onSubmit={handleVehicleSubmit}
          isPending={isPending}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Car Hub"
        description={`${vehicle.make} ${vehicle.model}${vehicle.registration ? ` · ${vehicle.registration}` : ""}`}
        action={
          <Button variant="outline" onClick={() => setVehicleDialogOpen(true)} className="rounded-xl">
            <Pencil className="h-4 w-4 mr-1" /> Edit Vehicle
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="touch-manipulation">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {vehicle.make} {vehicle.model}
                    {vehicle.year && <span className="text-muted-foreground font-normal"> ({vehicle.year})</span>}
                  </h2>
                  {vehicle.registration && (
                    <p className="text-sm text-muted-foreground mt-1">{vehicle.registration}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                    {vehicle.mileage > 0 && <span>{vehicle.mileage.toLocaleString()} miles</span>}
                    {vehicle.fuel_type && <span className="capitalize">{vehicle.fuel_type}</span>}
                    {vehicle.garage && <span>Garage: {vehicle.garage}</span>}
                  </div>
                  {vehicle.insurance_provider && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Insured with {vehicle.insurance_provider}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                {vehicle.mot_date && <CountdownBadge date={vehicle.mot_date} label="MOT" />}
                {vehicle.insurance_expiry && <CountdownBadge date={vehicle.insurance_expiry} label="Insurance" />}
                {vehicle.tax_date && <CountdownBadge date={vehicle.tax_date} label="Road Tax" />}
              </div>

              {vehicle.notes && (
                <p className="text-sm text-muted-foreground mt-6 pt-4 border-t border-border/50">{vehicle.notes}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setEventDialogOpen(true)} className="rounded-xl" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Log Event
            </Button>
          </div>

          {sortedEvents.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No events yet"
              description="Log services, repairs, MOTs, and other maintenance."
              action={
                <Button onClick={() => setEventDialogOpen(true)} className="rounded-xl" size="sm">
                  Log Event
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {sortedEvents.map((event) => (
                <Card key={event.id} className="transition-all active:scale-[0.98] touch-manipulation">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge variant="outline" className="border-0 bg-muted">
                            {VEHICLE_EVENT_LABELS[event.event_type] ?? event.event_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{formatDate(event.event_date)}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          {event.mileage != null && <span>{event.mileage.toLocaleString()} miles</span>}
                          {event.garage && <span>{event.garage}</span>}
                          {event.cost > 0 && <span>{formatCurrency(event.cost)}</span>}
                        </div>
                        {event.parts_replaced && (
                          <p className="text-xs text-muted-foreground mt-1">Parts: {event.parts_replaced}</p>
                        )}
                        {event.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
              <p className="text-2xl font-bold">{formatCurrency(expenseTotal)}</p>
              <p className="text-xs text-muted-foreground">Total expenses</p>
            </div>
            <Button onClick={() => setExpenseDialogOpen(true)} className="rounded-xl" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Expense
            </Button>
          </div>

          {sortedExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Track fuel, maintenance, insurance, and other running costs."
              action={
                <Button onClick={() => setExpenseDialogOpen(true)} className="rounded-xl" size="sm">
                  Add Expense
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {sortedExpenses.map((expense) => (
                <Card key={expense.id} className="transition-all active:scale-[0.98] touch-manipulation">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{expense.title}</h3>
                        <Badge variant="outline" className="border-0 bg-muted capitalize">
                          {expense.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{formatDate(expense.expense_date)}</p>
                      {expense.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{expense.notes}</p>
                      )}
                    </div>
                    <p className="text-lg font-semibold shrink-0">{formatCurrency(expense.amount)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <VehicleDialog
        open={vehicleDialogOpen}
        onOpenChange={setVehicleDialogOpen}
        vehicle={vehicle}
        onSubmit={handleVehicleSubmit}
        isPending={isPending}
      />

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Event</DialogTitle></DialogHeader>
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <FormSelect
              label="Event type"
              name="event_type"
              defaultValue="service"
              options={VEHICLE_EVENT_TYPES.map((t) => ({ value: t, label: VEHICLE_EVENT_LABELS[t] ?? t }))}
            />
            <div><Label>Title</Label><Input name="title" required className="mt-1" /></div>
            <div><Label>Date</Label><Input name="event_date" type="date" required className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mileage</Label><Input name="mileage" type="number" min="0" className="mt-1" /></div>
              <div><Label>Cost (£)</Label><Input name="cost" type="number" step="0.01" min="0" defaultValue="0" className="mt-1" /></div>
            </div>
            <div><Label>Garage</Label><Input name="garage" className="mt-1" /></div>
            <div><Label>Parts replaced</Label><Input name="parts_replaced" className="mt-1" /></div>
            <div><Label>Notes</Label><Textarea name="notes" className="mt-1" /></div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : "Save Event"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div><Label>Title</Label><Input name="title" required className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (£)</Label><Input name="amount" type="number" step="0.01" min="0" required className="mt-1" /></div>
              <FormSelect
                label="Category"
                name="category"
                defaultValue="fuel"
                options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div><Label>Date</Label><Input name="expense_date" type="date" required className="mt-1" /></div>
            <div><Label>Notes</Label><Textarea name="notes" className="mt-1" /></div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : "Save Expense"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function VehicleDialog({
  open,
  onOpenChange,
  vehicle,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Make</Label><Input name="make" defaultValue={vehicle?.make} required className="mt-1" /></div>
            <div><Label>Model</Label><Input name="model" defaultValue={vehicle?.model} required className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Year</Label><Input name="year" type="number" defaultValue={vehicle?.year ?? ""} className="mt-1" /></div>
            <div><Label>Registration</Label><Input name="registration" defaultValue={vehicle?.registration ?? ""} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Mileage</Label><Input name="mileage" type="number" min="0" defaultValue={vehicle?.mileage ?? 0} className="mt-1" /></div>
            <div><Label>Fuel type</Label><Input name="fuel_type" defaultValue={vehicle?.fuel_type ?? ""} placeholder="petrol, diesel, electric" className="mt-1" /></div>
          </div>
          <div><Label>Insurance provider</Label><Input name="insurance_provider" defaultValue={vehicle?.insurance_provider ?? ""} className="mt-1" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label>MOT date</Label><Input name="mot_date" type="date" defaultValue={vehicle?.mot_date ?? ""} className="mt-1" /></div>
            <div><Label>Insurance expiry</Label><Input name="insurance_expiry" type="date" defaultValue={vehicle?.insurance_expiry ?? ""} className="mt-1" /></div>
            <div><Label>Road tax date</Label><Input name="tax_date" type="date" defaultValue={vehicle?.tax_date ?? ""} className="mt-1" /></div>
          </div>
          <div><Label>Garage</Label><Input name="garage" defaultValue={vehicle?.garage ?? ""} className="mt-1" /></div>
          <div><Label>Notes</Label><Textarea name="notes" defaultValue={vehicle?.notes ?? ""} className="mt-1" /></div>
          <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
            {isPending ? "Saving…" : "Save Vehicle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

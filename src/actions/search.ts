"use server";

import { getTasks, getReminders, getProjects, getIdeas, getGoals, getContacts, getNotes, getWaitingItems } from "@/lib/data";
import {
  getSubscriptions, getVehicles, getVehicleEvents, getParkingTickets, getMonthlyReviews, getDocuments,
  getStratonClients, getStratonProjects, getStratonInvoices, getStratonHosting,
} from "@/lib/module-data";
import { searchAllEntities } from "@/lib/briefing-utils";

export async function globalSearch(query: string) {
  const [
    tasks, reminders, projects, ideas, goals, contacts, notes, waitingItems,
    subscriptions, vehicles, vehicleEvents, parkingTickets, monthlyReviews, documents,
    stratonClients, stratonProjects, stratonInvoices, stratonHosting,
  ] = await Promise.all([
    getTasks(), getReminders(), getProjects(), getIdeas(), getGoals(),
    getContacts(), getNotes(), getWaitingItems(),
    getSubscriptions(), getVehicles(), getVehicleEvents(), getParkingTickets(), getMonthlyReviews(), getDocuments(),
    getStratonClients(), getStratonProjects(), getStratonInvoices(), getStratonHosting(),
  ]);

  return searchAllEntities({
    query, tasks, reminders, projects, ideas, goals, contacts, notes, waitingItems,
    subscriptions, vehicles, vehicleEvents, parkingTickets, monthlyReviews, documents,
    stratonClients, stratonProjects, stratonInvoices, stratonHosting,
  });
}

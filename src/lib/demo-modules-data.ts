import { DEMO_USER_ID } from "./form-helpers";
import type {
  Document,
  MonthlyReview,
  StratonActivity,
  StratonClient,
  StratonClientReminder,
  StratonHosting,
  StratonInvoice,
  StratonProject,
  Subscription,
  Vehicle,
  VehicleEvent,
  VehicleExpense,
} from "./types";

export const demoSubscriptions: Subscription[] = [
  {
    id: "sub1", user_id: DEMO_USER_ID, name: "Notion", provider: "Notion Labs", cost: 10,
    billing_cycle: "monthly", renewal_date: "2026-07-01", category: "software",
    payment_method: "bank", auto_renew: true, status: "active", reminder_days_before: 7,
    notes: "Team workspace", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "sub2", user_id: DEMO_USER_ID, name: "Figma", provider: "Figma Inc", cost: 15,
    billing_cycle: "monthly", renewal_date: "2026-07-15", category: "software",
    payment_method: "bank", auto_renew: true, status: "active", reminder_days_before: 7,
    notes: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "sub3", user_id: DEMO_USER_ID, name: "Vercel Pro", provider: "Vercel", cost: 20,
    billing_cycle: "monthly", renewal_date: "2026-06-28", category: "hosting",
    payment_method: "bank", auto_renew: true, status: "active", reminder_days_before: 3,
    notes: "Client sites", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "sub4", user_id: DEMO_USER_ID, name: "Netflix", provider: "Netflix", cost: 17.99,
    billing_cycle: "monthly", renewal_date: "2026-07-10", category: "entertainment",
    payment_method: "bank", auto_renew: true, status: "active", reminder_days_before: 7,
    notes: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "sub5", user_id: DEMO_USER_ID, name: "Adobe CC", provider: "Adobe", cost: 54.99,
    billing_cycle: "monthly", renewal_date: "2026-06-20", category: "software",
    payment_method: "bank", auto_renew: false, status: "cancelled", reminder_days_before: 7,
    notes: "Cancelled June 2026", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
];

export const demoVehicles: Vehicle[] = [
  {
    id: "v1", user_id: DEMO_USER_ID, make: "BMW", model: "320d", year: 2019,
    registration: "AB19 XYZ", mileage: 48500, fuel_type: "Diesel",
    insurance_provider: "Admiral", insurance_expiry: "2026-09-15",
    mot_date: "2026-09-22", tax_date: "2026-08-01", garage: "BMW Specialist Garage",
    notes: "Main daily driver", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
];

export const demoVehicleEvents: VehicleEvent[] = [
  {
    id: "ve1", user_id: DEMO_USER_ID, vehicle_id: "v1", event_type: "service",
    title: "Annual service", event_date: "2026-03-15", mileage: 47200,
    garage: "BMW Specialist Garage", parts_replaced: "Oil filter, air filter",
    cost: 285, notes: "Full service", created_at: "2026-03-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "ve2", user_id: DEMO_USER_ID, vehicle_id: "v1", event_type: "repair",
    title: "Brake pads replaced", event_date: "2025-11-20", mileage: 44100,
    garage: "Kwik Fit", parts_replaced: "Front brake pads",
    cost: 180, notes: null, created_at: "2025-11-20T00:00:00Z", updated_at: "2025-11-20T00:00:00Z",
  },
  {
    id: "ve3", user_id: DEMO_USER_ID, vehicle_id: "v1", event_type: "mot",
    title: "MOT passed", event_date: "2025-09-22", mileage: 42000,
    garage: "Local MOT centre", parts_replaced: null,
    cost: 54.85, notes: "No advisories", created_at: "2025-09-22T00:00:00Z", updated_at: "2025-09-22T00:00:00Z",
  },
];

export const demoVehicleExpenses: VehicleExpense[] = [
  { id: "vx1", user_id: DEMO_USER_ID, vehicle_id: "v1", title: "Fuel - June", amount: 120, category: "fuel", expense_date: "2026-06-01", notes: null, created_at: "2026-06-01T00:00:00Z" },
  { id: "vx2", user_id: DEMO_USER_ID, vehicle_id: "v1", title: "Car wash", amount: 12, category: "maintenance", expense_date: "2026-06-10", notes: null, created_at: "2026-06-10T00:00:00Z" },
];

export const demoDocuments: Document[] = [
  {
    id: "doc1", user_id: DEMO_USER_ID, file_name: "acme-contract.pdf", file_type: "application/pdf",
    file_size: 245000, storage_path: null, file_url: null,
    linked_entity_type: "straton_client", linked_entity_id: "sc1", tags: ["contract"],
    created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "doc2", user_id: DEMO_USER_ID, file_name: "mot-certificate-2025.pdf", file_type: "application/pdf",
    file_size: 89000, storage_path: null, file_url: null,
    linked_entity_type: "vehicle", linked_entity_id: "v1", tags: ["mot"],
    created_at: "2025-09-22T00:00:00Z", updated_at: "2025-09-22T00:00:00Z",
  },
];

export const demoMonthlyReviews: MonthlyReview[] = [
  {
    id: "mr1", user_id: DEMO_USER_ID, year: 2026, month: 5,
    income_total: 8500, expense_total: 3200, net_balance: 5300,
    largest_expense: "Office rent", largest_expense_amount: 800,
    tasks_completed: 24, overdue_tasks: 3, projects_progressed: 2,
    goals_progress: "Emergency fund at 62%", biggest_win: "Signed Acme Corp retainer",
    biggest_challenge: "SaaS onboarding drop-off", next_month_focus: "Ship SaaS v2 onboarding",
    notes: "Strong month overall.", archived: true,
    created_at: "2026-06-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
];

export const demoStratonClients: StratonClient[] = [
  {
    id: "sc1", user_id: DEMO_USER_ID, client_name: "James Mitchell", business_name: "Acme Corp",
    contact_person: "James Mitchell", email: "james@acme.io", phone: "+44 7700 900123",
    website_url: "https://acme.io", industry: "SaaS", status: "active",
    start_date: "2025-06-01", key_info: "Retainer £3k/month", notes: "Very responsive client",
    created_at: "2025-06-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "sc2", user_id: DEMO_USER_ID, client_name: "Sarah Chen", business_name: "Bloom Studio",
    contact_person: "Sarah Chen", email: "sarah@bloomstudio.co.uk", phone: "+44 7700 900456",
    website_url: "https://bloomstudio.co.uk", industry: "Design", status: "active",
    start_date: "2025-11-01", key_info: "Website rebuild project", notes: null,
    created_at: "2025-11-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "sc3", user_id: DEMO_USER_ID, client_name: "Tom Richards", business_name: "Richards Plumbing",
    contact_person: "Tom Richards", email: "tom@richardsplumbing.co.uk", phone: null,
    website_url: null, industry: "Trades", status: "lead",
    start_date: null, key_info: "Needs new website", notes: "Referred by Sarah",
    created_at: "2026-06-15T00:00:00Z", updated_at: "2026-06-15T00:00:00Z",
  },
];

export const demoStratonProjects: StratonProject[] = [
  {
    id: "sp1", user_id: DEMO_USER_ID, client_id: "sc1", name: "Product Strategy Retainer",
    description: "Monthly strategy and product consulting", status: "in_progress",
    start_date: "2025-06-01", deadline: "2026-12-31", price_quoted: 36000, amount_paid: 24000,
    notes: "Ongoing retainer", created_at: "2025-06-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "sp2", user_id: DEMO_USER_ID, client_id: "sc2", name: "Website Rebuild",
    description: "Full website redesign and build on Next.js", status: "review",
    start_date: "2026-02-01", deadline: "2026-07-15", price_quoted: 8500, amount_paid: 4250,
    notes: "Client reviewing final designs", created_at: "2026-02-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
];

export const demoStratonInvoices: StratonInvoice[] = [
  {
    id: "si1", user_id: DEMO_USER_ID, client_id: "sc1", project_id: "sp1",
    invoice_number: "INV-2026-006", amount: 3000, issue_date: "2026-06-01", due_date: "2026-06-15",
    paid_date: "2026-06-10", status: "paid", document_id: null, notes: "June retainer",
    created_at: "2026-06-01T00:00:00Z", updated_at: "2026-06-10T00:00:00Z",
  },
  {
    id: "si2", user_id: DEMO_USER_ID, client_id: "sc2", project_id: "sp2",
    invoice_number: "INV-2026-007", amount: 4250, issue_date: "2026-06-15", due_date: "2026-06-29",
    paid_date: null, status: "sent", document_id: null, notes: "Milestone 2 payment",
    created_at: "2026-06-15T00:00:00Z", updated_at: "2026-06-15T00:00:00Z",
  },
  {
    id: "si3", user_id: DEMO_USER_ID, client_id: "sc1", project_id: "sp1",
    invoice_number: "INV-2026-008", amount: 3000, issue_date: "2026-06-20", due_date: "2026-06-10",
    paid_date: null, status: "overdue", document_id: null, notes: "July retainer - sent early",
    created_at: "2026-06-20T00:00:00Z", updated_at: "2026-06-20T00:00:00Z",
  },
];

export const demoStratonHosting: StratonHosting[] = [
  {
    id: "sh1", user_id: DEMO_USER_ID, client_id: "sc1", domain_name: "acme.io",
    registrar: "Namecheap", hosting_provider: "Vercel", hosting_plan: "Pro",
    renewal_date: "2026-07-01", cost: 20, client_charge: 50, auto_renew: true,
    ssl_expiry: "2026-12-01", dns_provider: "Cloudflare", nameservers: "ns1.cloudflare.com",
    login_notes: "Vercel team access", reminder_date: "2026-06-24", status: "expiring_soon",
    created_at: "2025-06-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "sh2", user_id: DEMO_USER_ID, client_id: "sc2", domain_name: "bloomstudio.co.uk",
    registrar: "123-reg", hosting_provider: "SiteGround", hosting_plan: "GrowBig",
    renewal_date: "2026-09-15", cost: 120, client_charge: 200, auto_renew: true,
    ssl_expiry: "2026-09-15", dns_provider: "123-reg", nameservers: null,
    login_notes: null, reminder_date: "2026-09-01", status: "active",
    created_at: "2025-11-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
];

export const demoStratonReminders: StratonClientReminder[] = [
  {
    id: "sr1", user_id: DEMO_USER_ID, client_id: "sc2", project_id: "sp2",
    title: "Chase milestone 2 payment", reminder_type: "chase_payment",
    due_date: "2026-06-28", completed: false, notes: "Invoice INV-2026-007",
    created_at: "2026-06-15T00:00:00Z", updated_at: "2026-06-15T00:00:00Z",
  },
  {
    id: "sr2", user_id: DEMO_USER_ID, client_id: "sc1", project_id: null,
    title: "Renew acme.io hosting", reminder_type: "renew_hosting",
    due_date: "2026-06-24", completed: false, notes: null,
    created_at: "2026-06-01T00:00:00Z", updated_at: "2026-06-01T00:00:00Z",
  },
];

export const demoStratonActivity: StratonActivity[] = [
  { id: "sa1", user_id: DEMO_USER_ID, client_id: "sc1", activity_type: "client_created", title: "Client added", description: "Acme Corp onboarded", entity_type: "client", entity_id: "sc1", created_at: "2025-06-01T00:00:00Z" },
  { id: "sa2", user_id: DEMO_USER_ID, client_id: "sc1", activity_type: "project_added", title: "Project created", description: "Product Strategy Retainer", entity_type: "project", entity_id: "sp1", created_at: "2025-06-01T00:00:00Z" },
  { id: "sa3", user_id: DEMO_USER_ID, client_id: "sc1", activity_type: "invoice_paid", title: "Invoice paid", description: "INV-2026-006 — £3,000", entity_type: "invoice", entity_id: "si1", created_at: "2026-06-10T00:00:00Z" },
  { id: "sa4", user_id: DEMO_USER_ID, client_id: "sc2", activity_type: "project_added", title: "Project created", description: "Website Rebuild", entity_type: "project", entity_id: "sp2", created_at: "2026-02-01T00:00:00Z" },
  { id: "sa5", user_id: DEMO_USER_ID, client_id: "sc2", activity_type: "invoice_uploaded", title: "Invoice sent", description: "INV-2026-007 — £4,250", entity_type: "invoice", entity_id: "si2", created_at: "2026-06-15T00:00:00Z" },
];

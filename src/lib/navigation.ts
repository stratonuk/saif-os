import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  CheckSquare,
  Bell,
  Target,
  Lightbulb,
  StickyNote,
  Wallet,
  CreditCard,
  CalendarCheck,
  Car,
  Users,
  FileText,
  FolderKanban,
  Settings,
  Briefcase,
  LayoutGrid,
  Receipt,
  Server,
  Clock,
  User,
} from "lucide-react";

export type WorkspaceId = "personal" | "straton";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, the item is active for any path starting with `href`. Defaults to true for non-root items. */
  matchPrefix?: boolean;
}

export interface NavGroup {
  id: string;
  heading?: string;
  items: NavItem[];
  /** Collapsible groups render a toggle and remember open state. */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface WorkspaceMeta {
  id: WorkspaceId;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Landing route when switching into this workspace. */
  homeHref: string;
}

export const WORKSPACES: Record<WorkspaceId, WorkspaceMeta> = {
  personal: {
    id: "personal",
    name: "Personal",
    description: "Personal workspace",
    icon: User,
    homeHref: "/dashboard",
  },
  straton: {
    id: "straton",
    name: "Straton",
    description: "Client workspace",
    icon: Briefcase,
    homeHref: "/straton",
  },
};

const SETTINGS_GROUP: NavGroup = {
  id: "settings",
  items: [{ href: "/settings", label: "Settings", icon: Settings }],
};

export const PERSONAL_GROUPS: NavGroup[] = [
  {
    id: "home",
    heading: "Home",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, matchPrefix: false },
      { href: "/inbox", label: "Inbox", icon: Inbox },
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/schedule", label: "Schedule", icon: CalendarCheck },
    ],
  },
  {
    id: "planning",
    heading: "Planning",
    items: [
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/reminders", label: "Reminders", icon: Bell },
      { href: "/goals", label: "Goals", icon: Target },
      { href: "/ideas", label: "Idea Vault", icon: Lightbulb },
      { href: "/notes", label: "Notes", icon: StickyNote },
    ],
  },
  {
    id: "finance",
    heading: "Finance",
    items: [
      { href: "/money", label: "Finance", icon: Wallet },
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/monthly-reset", label: "Monthly Review", icon: CalendarCheck },
    ],
  },
  {
    id: "life",
    heading: "Life",
    items: [
      { href: "/car", label: "Garage", icon: Car },
      { href: "/contacts", label: "People", icon: Users },
      { href: "/documents", label: "Files", icon: FileText },
    ],
  },
  {
    id: "projects",
    heading: "My Projects",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/waiting-on", label: "Waiting On", icon: Clock },
    ],
  },
  SETTINGS_GROUP,
];

export const STRATON_GROUPS: NavGroup[] = [
  {
    id: "straton",
    heading: "Straton",
    items: [
      { href: "/straton", label: "Dashboard", icon: LayoutGrid, matchPrefix: false },
      { href: "/straton/clients", label: "Clients", icon: Users },
      { href: "/straton/projects", label: "Projects", icon: Briefcase },
      { href: "/straton/invoices", label: "Invoices", icon: Receipt },
      { href: "/straton/hosting", label: "Hosting", icon: Server },
      { href: "/straton/documents", label: "Files", icon: FileText },
      { href: "/straton/reminders", label: "Reminders", icon: Clock },
    ],
  },
  SETTINGS_GROUP,
];

export function getWorkspaceForPath(pathname: string): WorkspaceId {
  return pathname.startsWith("/straton") ? "straton" : "personal";
}

export function getNavGroups(workspace: WorkspaceId): NavGroup[] {
  return workspace === "straton" ? STRATON_GROUPS : PERSONAL_GROUPS;
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  const usePrefix = item.matchPrefix ?? true;
  if (!usePrefix) return false;
  return pathname.startsWith(item.href + "/");
}

// ─── Mobile navigation ───────────────────────────────────────
export const MOBILE_BOTTOM_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, matchPrefix: false },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/money", label: "Finance", icon: Wallet },
];

/** Everything reachable from the mobile "More" sheet, grouped to mirror the desktop sidebar. */
export const MOBILE_MORE_GROUPS: NavGroup[] = [
  {
    id: "planning",
    heading: "Planning",
    items: [
      { href: "/reminders", label: "Reminders", icon: Bell },
      { href: "/goals", label: "Goals", icon: Target },
      { href: "/ideas", label: "Idea Vault", icon: Lightbulb },
      { href: "/notes", label: "Notes", icon: StickyNote },
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/schedule", label: "Schedule", icon: CalendarCheck },
    ],
  },
  {
    id: "finance",
    heading: "Finance",
    items: [
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/monthly-reset", label: "Monthly Review", icon: CalendarCheck },
    ],
  },
  {
    id: "life",
    heading: "Life",
    items: [
      { href: "/car", label: "Garage", icon: Car },
      { href: "/contacts", label: "People", icon: Users },
      { href: "/documents", label: "Files", icon: FileText },
    ],
  },
  {
    id: "projects",
    heading: "Projects",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/waiting-on", label: "Waiting On", icon: Clock },
    ],
  },
  {
    id: "straton",
    heading: "Straton",
    items: [
      { href: "/straton", label: "Straton", icon: Briefcase, matchPrefix: false },
      { href: "/straton/clients", label: "Clients", icon: Users },
      { href: "/straton/invoices", label: "Invoices", icon: Receipt },
      { href: "/straton/hosting", label: "Hosting", icon: Server },
    ],
  },
  {
    id: "settings",
    heading: "Workspace",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

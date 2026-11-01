import {
  BarChart3,
  Boxes,
  CalendarDays,
  Car,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      {
        href: "/admin",
        label: "Overview",
        shortLabel: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/admin/leads",
        label: "Leads & CRM",
        shortLabel: "Leads",
        icon: Users,
      },
      {
        href: "/admin/projects",
        label: "Restoration Jobs",
        shortLabel: "Jobs",
        icon: Car,
      },
      {
        href: "/admin/workshop",
        label: "Workshop Planner",
        shortLabel: "Planner",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        href: "/admin/quotes",
        label: "Quotes & Approvals",
        shortLabel: "Quotes",
        icon: FileText,
      },
      {
        href: "/admin/parts",
        label: "Parts & Inventory",
        shortLabel: "Parts",
        icon: Boxes,
      },
      {
        href: "/admin/store",
        label: "Online Store",
        shortLabel: "Store",
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: "Relationships",
    items: [
      {
        href: "/admin/updates",
        label: "Customer Updates",
        shortLabel: "Updates",
        icon: MessagesSquare,
      },
      {
        href: "/admin/reports",
        label: "Reports",
        shortLabel: "Reports",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/admin/settings",
        label: "System Setup",
        shortLabel: "Setup",
        icon: Settings,
      },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

export const mobileNavItems: NavItem[] = [
  navItems[0],
  navItems[1],
  navItems[2],
  navItems[4],
  navItems[9],
];

export function isNavActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

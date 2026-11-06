import type { LucideIcon } from "lucide-react";

export type StaffRole =
  | "director"
  | "administrative"
  | "pedagogical"
  | "finance";

export interface NavigationItem {
  label: string;
  icon: LucideIcon;
  roles: StaffRole[];
  badge?: string;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
  roles?: StaffRole[];
}
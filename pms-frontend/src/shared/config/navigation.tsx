import type { ReactNode } from "react";
import {
  BarChart3,
  Flag,
  Home,
  Kanban,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import { NavMenuIcon } from "@/shared/components/icons";

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  /** true = đã có API backend */
  live?: boolean;
  badge?: string;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const MAIN_NAV: NavSection[] = [
  {
    items: [
      {
        id: "dashboard",
        label: "Tổng quan",
        path: "/",
        icon: <NavMenuIcon icon={Home} />,
        live: true,
      },
      {
        id: "my-tasks",
        label: "Công việc của tôi",
        path: "/my-tasks",
        icon: <NavMenuIcon icon={ListChecks} />,
        live: true,
      },
    ],
  },
  {
    title: "Công cụ",
    items: [
      {
        id: "board",
        label: "Bảng Kanban",
        path: "/board",
        icon: <NavMenuIcon icon={Kanban} />,
        badge: "Sắp có",
      },
      {
        id: "milestones",
        label: "Milestone",
        path: "/milestones",
        icon: <NavMenuIcon icon={Flag} />,
        badge: "Sắp có",
      },
    ],
  },
  {
    title: "Báo cáo & Hệ thống",
    items: [
      {
        id: "reports",
        label: "Báo cáo",
        path: "/reports",
        icon: <NavMenuIcon icon={BarChart3} />,
        badge: "Sắp có",
      },
      {
        id: "members",
        label: "Thành viên",
        path: "/members",
        icon: <NavMenuIcon icon={Users} />,
        badge: "Sắp có",
      },
      {
        id: "settings",
        label: "Cài đặt",
        path: "/settings",
        icon: <NavMenuIcon icon={Settings} />,
        live: true,
      },
    ],
  },
];

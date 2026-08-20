"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  Rocket,
  SquareUserRound,
  Banknote,
  Heart
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TNavigation } from "@/types/navigation"
import { Avatar } from "./ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"

type User = {
  role?: string;
  companyId?: string | null;
  [key: string]: unknown;
}

const navigations: TNavigation[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/users",
    icon: SquareUserRound,
    items: [
      {
        title: "My Profile",
        url: "/users/my-profile",
      },
      {
        title: "Members",
        url: "/users/members",
        adminOnly: true,
      },
    ]
  },
  {
    title: "Knowledge Base",
    url: "/knowledge-base",
    icon: BookOpen,
    items: [
      {
        title: "Articles",
        url: "/knowledge-base/articles",
      },
      {
        title: "Playlist",
        url: "/knowledge-base/playlist",
      },
    ],
  },
  {
    title: "Community Projects",
    url: "/community-projects",
    icon: Rocket,
    items: [
      {
        title: "Ongoing Projects",
        url: "/community-projects/ongoing",
      },
      {
        title: "Completed Projects",
        url: "/community-projects/completed",
      },
    ],
  },
  {
    title: "Events and Meetups",
    url: "/events",
    icon: CalendarDays,
    items: [
      {
        title: "Upcoming Events",
        url: "/events/upcoming",
      },
      {
        title: "Past Events",
        url: "/events/past",
      },
      {
        title: "Manage Events",
        url: "/events/manage",
        adminOnly: true,
      },
      {
        title: "Event Types",
        url: "/events/event-types",
        adminOnly: true,
      },
    ],
  },
  {
    title: "Job Board",
    url: "/jobs",
    icon: Briefcase,
    items: [
      {
        title: "Available Jobs",
        url: "/jobs/available",
      },
      {
        title: "Company Profile",
        url: "/dashboard/company-profile",
        mitraOrAdminOnly: true,
      },
      {
        title: "Manage Partners",
        url: "/dashboard/companies",
        adminOnly: true,
      },
      {
        title: "Manage Categories",
        url: "/dashboard/job-categories",
        adminOnly: true,
      },
      {
        title: "Manage Jobs",
        url: "/jobs/post",
        mitraOrAdminOnly: true,
      },
      {
        title: "Applications",
        url: "/jobs/applications",
        mitraOrAdminOnly: true,
      },
    ],
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: Banknote,
  },
  {
    title: "Sponsors",
    url: "/sponsors",
    icon: Heart,
    adminOnly: true,
    items: [
      {
        title: "Manage Sponsors",
        url: "/sponsors/manage",
        adminOnly: true,
      },
    ],
  },
];

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const role = user?.role || "USER";
  const isAdmin = role === "ADMIN";
  const isMitra = role === "MITRA";
  const isMitraOrAdmin = isAdmin || isMitra;
  const hasCompany = !!user?.companyId || isMitra;

  const hasAccess = (item: {
    adminOnly?: boolean;
    mitraOrAdminOnly?: boolean;
    companyOnly?: boolean;
    roles?: ('ADMIN' | 'MODERATOR' | 'USER' | 'MITRA')[];
  }) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.mitraOrAdminOnly && !isMitraOrAdmin) return false;
    if (item.companyOnly && !hasCompany) return false;
    if (item.roles && !item.roles.includes(role as 'ADMIN' | 'MODERATOR' | 'USER' | 'MITRA')) return false;
    return true;
  };

  const filteredNavigations = navigations
    .filter((nav) => hasAccess(nav))
    .map((nav) => {
      if (!nav.items) return nav;
      return {
        ...nav,
        items: nav.items.filter((item) => hasAccess(item)),
      };
    })
    .filter((nav) => {
      // If a section originally had sub-items, but after filtering all of them are hidden, hide the section
      if (nav.items && nav.items.length === 0) {
        return false;
      }
      return true;
    });

  return (
    <Sidebar collapsible="icon" user={user} {...props}>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all rounded-lg group">
          <Avatar className="w-8 h-8 shrink-0 transition-transform group-hover:scale-105">
            <AvatarImage
              src={"/images/logo-square.png"}
              className="object-cover object-top"
            />
          </Avatar>
          <div className="grid flex-1 text-left text-xl leading-tight opacity-100 group-data-[collapsible=icon]:opacity-0 transition-opacity">
            <span className="truncate font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
              Lampung Dev
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain nav={filteredNavigations} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

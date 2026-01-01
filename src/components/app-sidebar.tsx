"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  Rocket,
  // Settings2,
  SquareUserRound
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
  // {
  //   title: "Admin Panel",
  //   url: "/dashboard/admin",
  //   icon: Settings2,
  //   items: [
  //     {
  //       title: "Member Management",
  //       url: "/dashboard/admin/members",
  //     },
  //     {
  //       title: "Content Moderation",
  //       url: "/dashboard/admin/moderation",
  //     },
  //     {
  //       title: "Analytics",
  //       url: "/dashboard/admin/analytics",
  //     },
  //   ],
  // },
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
        title: "Post a Job",
        url: "/jobs/post",
      },
    ],
  },
];


export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const filteredNavigations = navigations.map((nav) => ({
    ...nav,
    items: nav.items?.filter((item) => {
      if (item.adminOnly) {
        return user?.role === "ADMIN";
      }
      return true;
    }),
  }));

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

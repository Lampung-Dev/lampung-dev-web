"use client"

import * as React from "react"
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


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <Avatar className="w-6 data-[state=open]:w-36 h-6 data-[state=open]:h-36 mr-2">
            <AvatarImage
              src={"/images/logo-square.png"}
              className="object-cover object-top"
            />
          </Avatar>
          <div className="grid flex-1 text-left text-xl leading-tight">
            <span className="truncate font-semibold">
              Lampung Dev
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain nav={navigations} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

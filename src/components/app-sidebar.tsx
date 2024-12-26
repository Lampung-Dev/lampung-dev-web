"use client"

import * as React from "react"
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  MessageCircle,
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
    title: "Profiles",
    url: "/dashboard/my-profile",
    icon: SquareUserRound,
  },
  {
    title: "Knowledge Base",
    url: "/dashboard/knowledge-base",
    icon: BookOpen,
    items: [
      {
        title: "Articles",
        url: "/dashboard/knowledge-base/articles",
      },
      {
        title: "Guides",
        url: "/dashboard/knowledge-base/guides",
      },
    ],
  },
  {
    title: "Community Projects",
    url: "/dashboard/community-projects",
    icon: Rocket,
    items: [
      {
        title: "Ongoing Projects",
        url: "/dashboard/community-projects/ongoing",
      },
      {
        title: "Completed Projects",
        url: "/dashboard/community-projects/completed",
      },
      {
        title: "Post a Project",
        url: "/dashboard/community-projects/post",
      },
    ],
  },
  {
    title: "Forums",
    url: "/dashboard/forums",
    icon: MessageCircle,
    items: [
      {
        title: "Q&A",
        url: "/dashboard/forums/q-and-a",
      },
      {
        title: "Discussions",
        url: "/dashboard/forums/discussions",
      },
    ],
  },
  {
    title: "Events and Meetups",
    url: "/dashboard/events",
    icon: CalendarDays,
    items: [
      {
        title: "Upcoming Events",
        url: "/dashboard/events/upcoming",
      },
      {
        title: "Past Events",
        url: "/dashboard/events/past",
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
    url: "/dashboard/job-board",
    icon: Briefcase,
    items: [
      {
        title: "Available Jobs",
        url: "/dashboard/job-board/available",
      },
      {
        title: "Post a Job",
        url: "/dashboard/job-board/post",
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

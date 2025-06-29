import { redirect } from "next/navigation";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/next-auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import BreadCrumbDashboard from "./__components/bread-crumb-dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user?.name as string,
    email: session.user?.email as string,
    avatar: session.user?.image as string,
    role: session.user?.role || null,
  };

  return (
    <div className="flex flex-col">
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b backdrop-blur-sm bg-black/10 fixed top-0 z-20 w-full">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadCrumbDashboard />
            </div>
          </header>
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto mt-16 p-4 h-screen">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

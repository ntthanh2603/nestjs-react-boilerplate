import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/layout/app-sidebar";
import { Link, Outlet, useMatches } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { navigationAdminData } from "@/components/admin/layouts/navigation-admin";
import Notification from "@/components/common/layout/notification";
import { formatLabel } from "@/lib/helper";

export default function LayoutAdmin() {
  const matches = useMatches();

  // Get the current route and its parent
  const currentRoute = matches[matches.length - 1];
  const parentRoute = matches.length > 1 ? matches[matches.length - 2] : null;

  return (
    <SidebarProvider>
      <AppSidebar navItems={navigationAdminData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {parentRoute &&
                  !parentRoute.pathname.endsWith("/") &&
                  !currentRoute.pathname.endsWith("/") && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to={parentRoute.pathname}>
                            {formatLabel(
                              parentRoute.pathname,
                              navigationAdminData
                            )}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link className="font-semibold" to={currentRoute.pathname}>
                      {formatLabel(currentRoute.pathname, navigationAdminData)}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* <div className="relative flex-1 max-w-2xl mx-4">
            <SearchForm />
          </div> */}

          <div className="flex items-center gap-2 px-2 sm:px-4">
            <Notification />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

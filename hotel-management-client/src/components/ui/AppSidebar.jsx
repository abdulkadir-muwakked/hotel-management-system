import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function AppSidebar() {
  const pathname = usePathname();
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-6">
          <span className="text-2xl">
            {/* Building icon */}
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <rect width="24" height="24" rx="6" fill="#2563eb" />
              <path
                d="M7 10h2v2H7v-2Zm0 4h2v2H7v-2Zm4-4h2v2h-2v-2Zm0 4h2v2h-2v-2Zm4-4h2v2h-2v-2Zm0 4h2v2h-2v-2Z"
                fill="#fff"
              />
            </svg>
          </span>
          <span className="font-bold text-xl tracking-tight">ResidenceHub</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroupLabel className="px-4 pt-2 pb-1 text-xs text-muted-foreground tracking-widest">
            MAIN
          </SidebarGroupLabel>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/dashboard"
              isActive={pathname === "/dashboard"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#2563eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 6v6l4 2"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                Dashboard
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/calendar"
              isActive={pathname === "/calendar"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="16"
                      rx="2"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 3v4M8 3v4"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                Calendar
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/rooms"
              isActive={pathname === "/rooms"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M3 21V3h18v18" stroke="#64748b" strokeWidth="2" />
                    <path d="M9 21V9h6v12" stroke="#64748b" strokeWidth="2" />
                  </svg>
                </span>
                Rooms
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/Reservations"
              isActive={pathname === "/Reservations"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M7 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm-2 8a6 6 0 0 1 12 0"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                Reservations
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarGroupLabel className="px-4 pt-4 pb-1 text-xs text-muted-foreground tracking-widest">
            MANAGEMENT
          </SidebarGroupLabel>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/users"
              isActive={pathname === "/users"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M7 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm-2 8a6 6 0 0 1 12 0"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                Users
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/brokers"
              isActive={pathname === "/brokers"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M16 17v-1a4 4 0 0 0-8 0v1"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <path
                      d="M22 21v-2a4 4 0 0 0-3-3.87"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <path
                      d="M2 21v-2a4 4 0 0 1 3-3.87"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                Brokers
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/reports"
              isActive={pathname === "/reports"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M3 3h18v18H3V3Zm3 6h12M9 3v18"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                Reports
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarGroupLabel className="px-4 pt-4 pb-1 text-xs text-muted-foreground tracking-widest">
            SETTINGS
          </SidebarGroupLabel>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/settings/general"
              isActive={pathname === "/settings/general"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v4l3 3"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                General
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              href="/settings/notifications"
              isActive={pathname === "/settings/notifications"}
            >
              <a>
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <path
                      d="M13.73 21a2 2 0 0 1-3.46 0"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                Notifications
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <span className="text-xs text-muted-foreground px-4 py-2 block">
          © 2025 ResidenceHub
        </span>
      </SidebarFooter>
    </>
  );
}

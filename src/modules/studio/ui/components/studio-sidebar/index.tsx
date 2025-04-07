"use client";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOutIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StudioSidebarHeader } from "./studio-sidebar-header";

// Sidebar component for the Studio page
export const StudioSidebar = () => {
  const pathname = usePathname(); // Get the current route path

  return (
    // Sidebar with styling and collapsible functionality
    <Sidebar className="pt-16 z-40" collapsible="icon">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarMenu>
            {/* Custom header component */}
            <StudioSidebarHeader />
            {/* Content section */}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === "/studio"} // Highlights active section
                tooltip={"Content"} // Tooltip for accessibility
                asChild
              >
                <Link prefetch href={"/studio"}>
                  <VideoIcon className="size-5" />
                  <span className="text-sm">Content</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Visual separator */}
            <Separator />
            {/* Exit studio button */}
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={"Exit studio"} asChild>
                <Link prefetch href={"/"}>
                  <LogOutIcon className="size-5" />
                  <span className="text-sm">Exit studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

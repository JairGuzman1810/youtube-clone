"use client"; // Enables client-side rendering

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth, useClerk } from "@clerk/nextjs";
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Personal navigation items - Array of navigation links related to the user's content
const items = [
  {
    title: "History", // Name of the link
    url: "/playlists/history", // URL to navigate to
    icon: HistoryIcon, // Icon to display for the link
    auth: true, // Requires authentication to access this link
  },
  {
    title: "Liked videos", // Name of the link
    url: "/playlists/liked", // URL to navigate to
    icon: ThumbsUpIcon, // Icon to display for the link
    auth: true, // Requires authentication to access this link
  },
  {
    title: "All playlists", // Name of the link
    url: "/playlists", // URL to navigate to
    icon: ListVideoIcon, // Icon to display for the link
    auth: true, // Requires authentication to access this link
  },
];

// Personal section inside the sidebar - Displays user-specific navigation links
export const PersonalSection = () => {
  const clerk = useClerk(); // Clerk instance for handling authentication
  const { isSignedIn } = useAuth(); // Hook to check if the user is signed in
  const pathname = usePathname(); // Get the current path to highlight active menu items

  return (
    <SidebarGroup>
      {/* Section title for personal navigation */}
      <SidebarGroupLabel>You</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title} // Show tooltip with the item title
                asChild
                isActive={pathname === item.url} // Highlight active menu item based on current path
                onClick={(e) => {
                  if (!isSignedIn && item.auth) {
                    e.preventDefault(); // Prevent navigation if not signed in and authentication is required
                    return clerk.openSignIn(); // Prompt sign-in if the user is not authenticated
                  }
                }}
              >
                {/* Navigates to the specified URL */}
                <Link
                  prefetch
                  href={item.url}
                  className="flex items-center gap-4"
                >
                  {/* Render the icon */}
                  <item.icon />
                  {/* Render the title */}
                  <span className="text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

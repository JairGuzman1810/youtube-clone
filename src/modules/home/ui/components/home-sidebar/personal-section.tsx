"use client"; // Enables client-side rendering

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"; // Sidebar UI components
import { useAuth, useClerk } from "@clerk/nextjs"; // Authentication hooks from Clerk
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react"; // Icons
import Link from "next/link"; // Next.js link component

// Personal navigation items (requires authentication)
const items = [
  {
    title: "History",
    url: "/playlists/history",
    icon: HistoryIcon,
    auth: true, // Requires authentication
  },
  {
    title: "Liked videos",
    url: "/playlists/liked",
    icon: ThumbsUpIcon,
    auth: true, // Requires authentication
  },
  {
    title: "All playlists",
    url: "/playlists",
    icon: ListVideoIcon,
    auth: true, // Requires authentication
  },
];

// Personal section inside the sidebar (includes user-specific navigation)
export const PersonalSection = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth(); // Check if the user is signed in

  return (
    <SidebarGroup>
      <SidebarGroupLabel>You</SidebarGroupLabel> {/* Section title */}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={false} // TODO: Update logic to check the current pathname
                onClick={(e) => {
                  if (!isSignedIn && item.auth) {
                    e.preventDefault();
                    return clerk.openSignIn(); // Prompt sign-in if required
                  }
                }}
              >
                <Link href={item.url} className="flex items-center gap-4">
                  <item.icon />
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

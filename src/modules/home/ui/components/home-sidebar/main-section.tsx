"use client"; // Enables client-side rendering

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth, useClerk } from "@clerk/nextjs";
import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Main navigation items - Defines an array of objects representing the navigation links in the sidebar
const items = [
  {
    title: "Home", // Name of the link
    url: "/", // URL to navigate to
    icon: HomeIcon, // Icon to display for the link
  },
  {
    title: "Subscribed", // Name of the link
    url: "/feed/subscribed", // URL to navigate to
    icon: PlaySquareIcon, // Icon to display for the link
    auth: true, // Requires authentication to access this link
  },
  {
    title: "Trending", // Name of the link
    url: "/feed/trending", // URL to navigate to
    icon: FlameIcon, // Icon to display for the link
  },
];

// Main navigation section inside the sidebar - Displays main navigation links
export const MainSection = () => {
  const clerk = useClerk(); // Clerk instance for handling authentication actions
  const { isSignedIn } = useAuth(); // Hook to check if the user is signed in
  const pathname = usePathname(); // Get the current path to highlight active menu items

  return (
    <SidebarGroup>
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
                    return clerk.openSignIn(); // Prompt sign-in if required
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

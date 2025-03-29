"use client"; // Enables client-side rendering

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"; // Sidebar UI components
import { useAuth, useClerk } from "@clerk/nextjs"; // Authentication hooks from Clerk
import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react"; // Icons
import Link from "next/link"; // Next.js link component

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

// Main navigation section inside the sidebar
export const MainSection = () => {
  const clerk = useClerk(); // Clerk instance for authentication actions
  const { isSignedIn } = useAuth(); // Hook to check if the user is signed in

  return (
    <SidebarGroup>
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
                {/* Navigates to the specified URL */}
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

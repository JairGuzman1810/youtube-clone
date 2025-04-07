"use client"; // Enables client-side rendering

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Loading skeleton - Placeholder UI shown while subscriptions are loading
export const LoadingSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4].map((item) => (
        <SidebarMenuItem key={item}>
          <SidebarMenuButton disabled>
            {/* Avatar placeholder */}
            <Skeleton className="size-6 rounded-full shrink-0" />
            {/* Name placeholder */}
            <Skeleton className="h-4 w-full" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
};

// Subscriptions section inside the sidebar - Displays a list of users the current user is subscribed to
export const SubscriptionsSection = () => {
  const pathname = usePathname(); // Get the current path to highlight active menu items

  // Fetch paginated subscriptions for the current user
  const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT, // Limit the number of subscriptions fetched per request
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor, // Determines the next page cursor for pagination
    }
  );

  return (
    <SidebarGroup>
      {/* Section title for subscriptions navigation */}
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Show skeleton while loading */}
          {isLoading && <LoadingSkeleton />}
          {/* Render each subscribed user as a sidebar item */}
          {!isLoading &&
            data?.pages
              .flatMap((page) => page.items)
              .map((subscription) => (
                <SidebarMenuItem
                  key={`${subscription.creatorId}-${subscription.viewerId}`}
                >
                  <SidebarMenuButton
                    tooltip={subscription.user.name} // Show tooltip with the creator's name
                    asChild
                    isActive={pathname === `/users/${subscription.user.id}`} // Highlight if current page matches
                  >
                    {/* Navigates to the subscribed user's profile */}
                    <Link
                      prefetch
                      href={`/users/${subscription.user.id}`}
                      className="flex items-center gap-4"
                    >
                      {/* Render the creator's avatar */}
                      <UserAvatar
                        size="xs"
                        imageUrl={subscription.user.imageUrl}
                        name={subscription.user.name}
                      />
                      {/* Render the creator's name */}
                      <span className="text-sm">{subscription.user.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          {/* Link to view all subscriptions */}
          {!isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/subscriptions"} // Highlight if on the subscriptions page
              >
                {/* Navigates to the subscriptions list page */}
                <Link
                  prefetch
                  href="/subscriptions"
                  className="flex items-center gap-4"
                >
                  <ListIcon className="size-4" />
                  <span>All subscriptions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { UserGetOneOutput } from "../../types";

// UserPageInfoProps - Defines the properties for the UserPageInfo component
interface UserPageInfoProps {
  user: UserGetOneOutput; // User data to display on the page
}

// UserPageInfoSkeleton - Displays a loading skeleton for the user information section
export const UserPageInfoSkeleton = () => {
  return (
    <div className="py-6">
      {/* Mobile layout: Skeleton for user avatar, name, subscriber count, and subscription button */}
      <div className="flex flex-col gap-4 md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="h-[60px] w-[60px] rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-3 rounded-full" />
      </div>
      {/* Desktop layout: Skeleton for larger user avatar and user details */}
      <div className="hidden md:flex items-start gap-4">
        <Skeleton className="h-[160px] w-[160px] rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48 mt-4" />
          <Skeleton className="h-10 w-32 mt-3 rounded-full" />
        </div>
      </div>
    </div>
  );
};

// UserPageInfo - Displays user information such as name, avatar, subscription button, and other details
export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const { userId, isLoaded } = useAuth(); // Get the current logged-in user information
  const clerk = useClerk(); // Access Clerk for user profile management

  // Manages subscription state and click handling
  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
  });

  return (
    <div className="py-6">
      {/* Mobile layout: Displays user's avatar, name, subscriber count, and subscription button */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-end gap-3">
          {/* Renders the user avatar with click functionality */}
          <UserAvatar
            size={"lg"}
            imageUrl={user.imageUrl}
            name={user.name}
            className="h-[60px] w-[60px]"
            onClick={() => {
              // If the logged-in user is the owner, open their profile
              if (user.clerkId === userId) {
                clerk.openUserProfile();
              }
            }}
          />
          <div className="flex-1 min-w-0">
            {/* Display user name */}
            <h1 className="text-xl font-bold"> {user.name}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {/* Display subscriber count and video count */}
              <span>{user.subscriberCount} subscribers</span>
              <span>•</span>
              <span>{user.videoCount} videos</span>
            </div>
          </div>
        </div>
        {/* Display "Go to studio" button if the current user is the profile owner, otherwise show subscription button */}
        {userId === user.clerkId ? (
          <Button
            variant="secondary"
            className="w-full rounded-full mt-3"
            asChild
          >
            <Link prefetch href="/studio">
              Go to studio
            </Link>
          </Button>
        ) : (
          <SubscriptionButton
            className="w-full mt-3"
            isSubscribed={user.viewerSubscribed}
            disabled={isPending || !isLoaded}
            onClick={onClick}
          />
        )}
      </div>

      {/* Desktop layout: Displays larger avatar, name, and subscriber/video counts */}
      <div className="hidden md:flex items-start gap-4">
        <UserAvatar
          size={"xl"}
          imageUrl={user.imageUrl}
          name={user.name}
          className={cn(
            userId === user.clerkId &&
              "cursor-pointer hover:opacity-80 transition-opacity duration-300"
          )}
          onClick={() => {
            // If the logged-in user is the profile owner, open their profile
            if (user.clerkId === userId) {
              clerk.openUserProfile();
            }
          }}
        />
        <div className="flex-1 min-w-0">
          {/* Display user name and video/subscriber counts */}
          <h1 className="text-4xl font-bold"> {user.name}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
            <span>{user.subscriberCount} subscribers</span>
            <span>•</span>
            <span>{user.videoCount} videos</span>
          </div>
          {/* Display appropriate button: "Go to studio" or Subscription button */}
          {userId === user.clerkId ? (
            <Button variant="secondary" className="mt-3 rounded-full" asChild>
              <Link prefetch href="/studio">
                Go to studio
              </Link>
            </Button>
          ) : (
            <SubscriptionButton
              className=" mt-3"
              isSubscribed={user.viewerSubscribed}
              disabled={isPending || !isLoaded}
              onClick={onClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

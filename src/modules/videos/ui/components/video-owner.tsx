import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { VideoGetOneOutput } from "../../types";

// VideoOwnerProps - Defines the props for the VideoOwner component
interface VideoOwnerProps {
  user: VideoGetOneOutput["user"]; // The user who uploaded the video
  videoId: string; // ID of the video
}

// VideoOwner component - Displays video uploader details and subscription/edit options
export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId: clerkUserId, isLoaded } = useAuth(); // Get the currently authenticated user ID

  // useSubscription hook - Manages subscription logic for the video owner
  const { isPending, onClick } = useSubscription({
    userId: user.id, // The ID of the video's uploader
    isSubscribed: user.viewerSubscribed, // Whether the current user is subscribed
    fromVideoId: videoId, // ID of the video being viewed
  });

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      {/* Link to the user's profile */}
      <Link prefetch href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size={"lg"} imageUrl={user.imageUrl} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo size={"lg"} name={user.name} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {user.subscriberCount} subscribers
            </span>
          </div>
        </div>
      </Link>

      {/* Show "Edit Video" button if the user owns the video, otherwise show subscription button */}
      {clerkUserId === user.clerkId ? (
        <Button variant={"secondary"} className="rounded-full">
          <Link prefetch href={`/studio/videos/${videoId}`}>
            Edit video
          </Link>
        </Button>
      ) : (
        // SubscriptionButton - Allows the user to subscribe/unsubscribe from the video owner
        <SubscriptionButton
          onClick={onClick} // Handles subscription toggle
          disabled={isPending || !isLoaded} // Disable button while processing
          isSubscribed={user.viewerSubscribed} // Current subscription status
          className="flex-none"
        />
      )}
    </div>
  );
};

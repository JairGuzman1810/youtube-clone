import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { VideoGetOneOutput } from "../../server/types";

// VideoOwnerProps - Defines the props for the VideoOwner component
interface VideoOwnerProps {
  user: VideoGetOneOutput["user"]; // The user who uploaded the video
  videoId: string; // ID of the video
}

// VideoOwner component - Displays video uploader details and subscription/edit options
export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId } = useAuth(); // Get the currently authenticated user ID

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      {/* Link to the user's profile */}
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size={"lg"} imageUrl={user.imageUrl} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo size={"lg"} name={user.name} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {/* TODO: Fetch and display actual subscriber count */}
              {0} subscribers
            </span>
          </div>
        </div>
      </Link>

      {/* Show "Edit Video" button if the user owns the video, otherwise show subscription button */}
      {userId === user.clerkId ? (
        <Button variant={"secondary"} className="rounded-full">
          <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={() => {}}
          disabled={false}
          isSubscribed={false}
          className="flex-none"
        />
      )}
    </div>
  );
};

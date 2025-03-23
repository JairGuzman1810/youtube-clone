import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

// UseSubscriptionProps - Defines the props for the useSubscriptions hook
interface UseSubscriptionProps {
  userId: string; // The ID of the user to subscribe/unsubscribe from
  isSubscribed: boolean; // Whether the current user is subscribed
  fromVideoId?: string; // The ID of the video from which the subscription is triggered (optional)
}

// useSubscriptions hook - Handles subscribing and unsubscribing logic
export const useSubscriptions = ({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubscriptionProps) => {
  const clerk = useClerk(); // Access Clerk authentication functions
  const utils = trpc.useUtils(); // TRPC utilities for cache invalidation

  // subscribe - Handles subscribing to a user
  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscribed"); // Show success message

      // TODO: Invalidate subscriptions.getMany, users.getOne

      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId }); // Invalidate video cache if triggered from a video
      }
    },
    onError: (error) => {
      toast.error("Something went wrong"); // Show error message

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn(); // Prompt user to sign in if unauthorized
      }
    },
  });

  // unsubscribe - Handles unsubscribing from a user
  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed"); // Show success message

      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId }); // Invalidate video cache if triggered from a video
      }
    },
    onError: (error) => {
      toast.error("Something went wrong"); // Show error message

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn(); // Prompt user to sign in if unauthorized
      }
    },
  });

  const isPending = subscribe.isPending || unsubscribe.isPending; // Track mutation loading state

  // onClick - Toggles subscription status when clicked
  const onClick = () => {
    if (isSubscribed) {
      unsubscribe.mutate({ userId }); // Unsubscribe if already subscribed
    } else {
      subscribe.mutate({ userId }); // Subscribe if not already subscribed
    }
  };

  return { isPending, onClick }; // Return state and handler function
};

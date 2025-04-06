// Ensures this component runs on the client side
"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import {
  SubscriptionItem,
  SubscriptionItemSkeleton,
} from "../ui/components/subscription-item";

// SubscriptionsSection component - Handles rendering the user's subscriptions list with suspense and error boundaries
export const SubscriptionsSection = () => {
  return (
    <Suspense fallback={<SubscriptionsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <SubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

// SubscriptionsSectionSkeleton - Displays a loading skeleton while the user's subscriptions are being fetched
const SubscriptionsSectionSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SubscriptionItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

// SubscriptionsSectionSuspense - Fetches and renders the user's subscriptions list with infinite scroll support
const SubscriptionsSectionSuspense = () => {
  const utils = trpc.useUtils();
  // Fetch subscriptions using suspense-enabled infinite query
  const [subscriptions, query] =
    trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
      { limit: DEFAULT_LIMIT },
      {
        // Determines the next page cursor for pagination
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  // Handles unsubscribing from a user
  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: (data) => {
      toast.success("Unsubscribed"); // Show success message

      utils.subscriptions.getMany.invalidate();

      // Invalidate the cache for subscribed videos to refresh the list after unsubscribing
      utils.videos.getManySubscribed.invalidate();

      // Invalidate the user cache to ensure the user's data is updated after unsubscribing
      utils.users.getOne.invalidate({ id: data.creatorId });
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-4">
        {subscriptions.pages
          .flatMap((page) => page.items) // Flattens paginated results into a single array
          .map((subscription) => (
            <Link
              key={subscription.creatorId}
              href={`/users/${subscription.user.id}`}
            >
              <SubscriptionItem
                name={subscription.user.name}
                imageUrl={subscription.user.imageUrl}
                subscriberCount={subscription.user.subscriberCount}
                onUnsubscribe={() =>
                  unsubscribe.mutate({ userId: subscription.creatorId })
                }
                disabled={unsubscribe.isPending}
              />
            </Link>
          ))}
      </div>
      {/* Infinite scrolling component to load more subscriptions when scrolling */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage} // Checks if there are more pages of subscriptions
        isFetchingNextPage={query.isFetchingNextPage} // Indicates if the next page is currently being fetched
        fetchNextPage={query.fetchNextPage} // Fetches the next page of subscriptions
      />
    </div>
  );
};

// Ensures this component runs on the client side
"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  PlaylistGridCard,
  PlaylistGridCardSkeleton,
} from "../components/playlist-grid-card";

// PlaylistsSection - Displays a grid of user-created playlists with suspense and error handling
export const PlaylistsSection = () => {
  return (
    <Suspense fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <PlaylistsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

// PlaylistsSectionSkeleton - Displays a loading skeleton while the playlists are being fetched
const PlaylistsSectionSkeleton = () => {
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
      {Array.from({ length: 18 }).map((_, index) => (
        <PlaylistGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

// PlaylistsSectionSuspense - Fetches and renders the user's playlists with infinite scroll support
const PlaylistsSectionSuspense = () => {
  // Fetch user playlists using suspense-enabled infinite query
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    {
      // Determines the next page cursor for pagination
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      {/* Render user-created playlists in a grid */}
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {playlists.pages
          .flatMap((page) => page.items)
          .map((playlist) => (
            <PlaylistGridCard key={playlist.id} data={playlist} />
          ))}
      </div>
      {/* Infinite scrolling component to load more playlists when scrolling */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage} // Checks if more playlists are available
        isFetchingNextPage={query.isFetchingNextPage} // Indicates if the next page is being fetched
        fetchNextPage={query.fetchNextPage} // Fetches the next page of playlists
      />
    </div>
  );
};

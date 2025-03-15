// Ensures this component runs on the client side
"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// VideosSection handles error boundaries and suspense while loading video data
export const VideosSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <VideosSectionsSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

// VideosSectionsSuspense fetches and displays a paginated list of videos
const VideosSectionsSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT, // Number of videos to fetch per request
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor, // Determines the cursor for the next page
    }
  );

  return (
    <div>
      {/* Table container with border styling */}
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Column headers for video data */}
              <TableHead className="w-[510px] pl-6">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="pr-6 text-right">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages
              .flatMap((page) => page.items) // Flatten paginated results into a single array
              .map((video) => (
                <Link
                  href={`/studio/videos/${video.id}`} // Links to the specific video page
                  key={video.id}
                  legacyBehavior // Ensures backward compatibility with older Next.js versions
                >
                  <TableRow className="cursor-pointer">
                    {/* Table cells currently display placeholder text instead of actual data */}
                    <TableCell>{video.title}</TableCell>
                    <TableCell>visibility</TableCell> {/* Should use video.visibility */}
                    <TableCell>status</TableCell> {/* Should use video.status */}
                    <TableCell>date</TableCell> {/* Should use video.createdAt */}
                    <TableCell>views</TableCell> {/* Should use video.views */}
                    <TableCell>comments</TableCell> {/* Should use video.comments */}
                    <TableCell>likes</TableCell> {/* Should use video.likes */}
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      {/* Infinite scrolling component for loading more videos */}
      <InfiniteScroll
        isManual // Requires user action to load more results
        hasNextPage={query.hasNextPage} // Determines if more videos are available
        isFetchingNextPage={query.isFetchingNextPage} // Indicates if more videos are being fetched
        fetchNextPage={query.fetchNextPage} // Function to load the next page
      />
    </div>
  );
};

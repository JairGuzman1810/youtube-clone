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
import { snakeCaseToTitle } from "@/lib/utils";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { trpc } from "@/trpc/client";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// VideosSection wraps the video list with suspense and error boundaries for better UX
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
      limit: DEFAULT_LIMIT, // Number of videos fetched per request
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor, // Determines cursor for the next page
    }
  );

  return (
    <div>
      {/* Table container with border styling */}
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
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
              .flatMap((page) => page.items) // Flattens paginated results into a single array
              .map((video) => (
                <Link
                  href={`/studio/videos/${video.id}`} // Links to the specific video page
                  key={video.id}
                  legacyBehavior // Ensures backward compatibility with older Next.js versions
                >
                  <TableRow className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-36 shrink-0">
                          {/* Video thumbnail component with preview */}
                          <VideoThumbnail
                            imageUrl={video.thumbnailUrl}
                            previewUrl={video.previewUrl}
                            title={video.title}
                            duration={video.duration || 0}
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden gap-y-1">
                          {/* Video title */}
                          <span className="text-sm line-clamp-1">
                            {video.title}
                          </span>
                          {/* Video description or placeholder if missing */}
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {video.description || "No description"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Display visibility with icon */}
                      <div className="flex items-center">
                        {video.visibility === "private" ? (
                          <LockIcon className="size-4 mr-2" />
                        ) : (
                          <Globe2Icon className="size-4 mr-2" />
                        )}
                        {snakeCaseToTitle(video.visibility)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Display video processing status */}
                      <div className="flex items-center">
                        {snakeCaseToTitle(video.muxStatus || "error")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm truncate">
                      {/* Display formatted creation date */}
                      {format(video.createdAt, "d MMM, yyyy")}
                    </TableCell>
                    <TableCell>
                      {/* Placeholder for video views count */}
                      views
                    </TableCell>
                    <TableCell>
                      {/* Placeholder for video comments count */}
                      comments
                    </TableCell>
                    <TableCell>
                      {/* Placeholder for video likes count */}
                      likes
                    </TableCell>
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

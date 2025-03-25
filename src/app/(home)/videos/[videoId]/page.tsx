import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Defines the expected structure of route parameters
interface PageProps {
  params: Promise<{ videoId: string }>; // Contains the video ID extracted from the URL
}

// Async page component that fetches video details based on the provided video ID
const Page = async ({ params }: PageProps) => {
  const { videoId } = await params; // Await route parameters to extract videoId

  // Prefetch video data for better performance and hydration
  void trpc.videos.getOne.prefetch({ id: videoId });

  // Prefetch comments for the given video to optimize data fetching
  void trpc.comments.getMany.prefetchInfinite({
    videoId: videoId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      {/* Ensures server-fetched data is available on the client */}
      <VideoView videoId={videoId} />
      {/* Render the video player with the fetched video data */}
    </HydrateClient>
  );
};

export default Page;

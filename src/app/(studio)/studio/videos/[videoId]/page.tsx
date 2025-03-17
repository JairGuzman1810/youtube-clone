import { VideoView } from "@/modules/studio/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Defines the expected structure of route parameters
interface PageProps {
  params: Promise<{ videoId: string }>;
}

// Define the Video page component
const Page = async ({ params }: PageProps) => {
  const { videoId } = await params; // Extracts videoId from the route parameters

  // Prefetch video and category data for improved performance
  void trpc.studio.getOne.prefetch({ id: videoId });
  void trpc.categories.getMany.prefetch();

  return (
    <HydrateClient>
      {/* Renders the video view component */}
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;

import { DEFAULT_LIMIT } from "@/constants";
import { UserView } from "@/modules/users/ui/views/user-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Defines the properties for the user page
interface PageProps {
  params: Promise<{ userId: string }>; // Contains the user ID from the URL
}

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Page component for viewing a specific user's profile
const Page = async ({ params }: PageProps) => {
  const { userId } = await params;

  // Pre-fetch user details for faster client-side rendering
  void trpc.users.getOne.prefetch({
    id: userId,
  });

  // Pre-fetch videos from the user with pagination support
  void trpc.videos.getMany.prefetchInfinite({
    userId,
    limit: DEFAULT_LIMIT, // Limit the number of videos per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available for client-side components
    <HydrateClient>
      {/* Render the UserView component to display the user's profile */}
      <UserView userId={userId} />
    </HydrateClient>
  );
};

export default Page;

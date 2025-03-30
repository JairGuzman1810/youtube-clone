import { LikedVideosSection } from "../sections/liked-videos-section";

// LikedView component - Renders the liked videos section with a header
export const LikedView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Render the liked videos section header */}
      <div>
        <h1 className="text-2xl font-bold">Liked</h1>
        <p className="text-xs text-muted-foreground">Videos you have liked</p>
      </div>

      {/* Renders the liked videos section */}
      <LikedVideosSection />
    </div>
  );
};

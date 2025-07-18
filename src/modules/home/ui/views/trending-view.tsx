import { TrendingVideosSection } from "../sections/trending-videos-section";

// TrendingView component - Renders the trending videos section with a header
export const TrendingView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Render the trending section header */}
      <div>
        <h1 className="text-2xl font-bold">Trending</h1>
        <p className="text-xs text-muted-foreground">
          Most popular videos at the moment
        </p>
      </div>

      {/* Renders the trending videos section */}
      <TrendingVideosSection />
    </div>
  );
};

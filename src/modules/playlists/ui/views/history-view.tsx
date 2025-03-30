import { HistoryVideosSection } from "../sections/history-videos-section";

// HistoryView component - Renders the video history section with a header
export const HistoryView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Render the history section header */}
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-xs text-muted-foreground">Videos you have watched</p>
      </div>

      {/* Renders the watched videos section */}
      <HistoryVideosSection />
    </div>
  );
};

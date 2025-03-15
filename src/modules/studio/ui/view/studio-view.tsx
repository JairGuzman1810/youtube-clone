import { VideosSection } from "../sections/videos-section";

// StudioView component - Serves as the main content area for the studio interface
export const StudioView = () => {
  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      {/* Header section with title and description */}
      <div className="px-4">
        <h1 className="text-2xl font-bold">Channel content</h1>
        <p className="text-xs text-muted-foreground">
          Manage your channel content and videos
        </p>
      </div>
      <VideosSection /> {/* Renders the section displaying uploaded videos */}
    </div>
  );
};

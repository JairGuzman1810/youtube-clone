import { FormSection } from "../sections/form-section";

// Defines the structure for the videoId prop
interface PageProps {
  videoId: string;
}

// VideoView component - Renders the video details form section
export const VideoView = ({ videoId }: PageProps) => {
  return (
    <div className="px-4 pt-2.5 max-w-screen-lg">
      {/* Renders the form section for video details */}
      <FormSection videoId={videoId} />
    </div>
  );
};

import { UserSection } from "../sections/user-section";
import { VideosSection } from "../sections/videos-section";

// UserViewProps - Defines the properties for the UserView component
interface UserViewProps {
  // userId - Unique identifier for the user whose profile and videos are being displayed
  userId: string;
}

// UserView component - Renders the user profile and their videos
export const UserView = ({ userId }: UserViewProps) => {
  return (
    <div className="flex flex-col max-w-[1300px] px-4 pt-2.5 mx-auto mb-10 gap-y-6">
      {/* Renders the user profile section */}
      <UserSection userId={userId} />
      {/* Renders the videos section for the user */}
      <VideosSection userId={userId} />
    </div>
  );
};

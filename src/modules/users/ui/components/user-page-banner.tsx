import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Edit2Icon } from "lucide-react";
import { useState } from "react";
import { UserGetOneOutput } from "../../types";
import { BannerUploadModal } from "./banner-upload-modal";

// UserPageBannerProps - Defines the properties for the UserPageBanner component
interface UserPageBannerProps {
  user: UserGetOneOutput; // Contains the user data to display in the banner
}

// UserPageBannerSkeleton - Displays a loading skeleton for the user banner
export const UserPageBannerSkeleton = () => {
  return <Skeleton className="w-full max-h-[200px] h-[15vh] md:h-[25vh]" />;
};

// UserPageBanner - Displays the user's banner with the option to edit it (only if the user is logged in and matches the current user)
export const UserPageBanner = ({ user }: UserPageBannerProps) => {
  const { userId } = useAuth(); // Fetch the current logged-in user’s ID
  const [isOpenBannerUploadModal, setIsOpenBannerUploadModal] = useState(false); // Controls the open state of the banner upload modal

  return (
    <div className="relative group">
      {/* Modal for uploading a new banner image */}
      <BannerUploadModal
        userId={user.id}
        open={isOpenBannerUploadModal}
        onOpenChange={setIsOpenBannerUploadModal}
      />

      {/* Banner background */}
      <div
        className={cn(
          "w-full max-h-[200px] h-[15vh] md:h-[25vh] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl",
          user.bannerUrl ? "bg-cover bg-center" : "bg-gray-100"
        )}
        style={{
          backgroundImage: user.bannerUrl
            ? `url(${user.bannerUrl})`
            : undefined,
        }}
      >
        {/* Edit button */}
        {user.clerkId === userId && (
          <Button
            type="button"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-transparent/50 hover:bg-black/50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => setIsOpenBannerUploadModal(true)}
          >
            <Edit2Icon className="size-4 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};

import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

// BannerUploadModalProps - Defines props for the BannerUploadModal component
interface BannerUploadModalProps {
  userId: string; // The ID of the user for whom the banner is being uploaded
  open: boolean; // Controls whether the modal is open or closed
  onOpenChange: (open: boolean) => void; // Callback function when the modal open state changes
}

// BannerUploadModal - Modal for uploading a user profile banner
export const BannerUploadModal = ({
  userId,
  open,
  onOpenChange,
}: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  // Handles actions to take after a successful upload
  const onUploadComplete = () => {
    onOpenChange(false); // Closes the modal after the upload is complete
    utils.users.getOne.invalidate({ id: userId }); // Refresh the specific user details
  };

  return (
    <ResponsiveModal
      title="Upload a banner"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="bannerUploader" // Specifies the UploadThing endpoint for uploading banners
        onClientUploadComplete={onUploadComplete} // Handles actions after a successful upload
      />
    </ResponsiveModal>
  );
};

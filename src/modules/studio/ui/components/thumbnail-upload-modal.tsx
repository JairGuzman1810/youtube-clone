import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

// Defines props for the ThumbnailUploadModal component
interface ThumbnailUploadModalProps {
  videoId: string; // The ID of the video for which the thumbnail is being uploaded
  open: boolean; // Controls whether the modal is open or closed
  onOpenChange: (open: boolean) => void; // Callback function when the modal open state changes
}

// ThumbnailUploadModal - Modal for uploading a video thumbnail
export const ThumbnailUploadModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils();

  // Handles actions to take after a successful upload
  const onUploadComplete = () => {
    onOpenChange(false); // Closes the modal after the upload is complete
    utils.studio.getMany.invalidate(); // Refresh the list of videos in the studio
    utils.studio.getOne.invalidate({ id: videoId }); // Refresh the specific video details
  };

  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="thumbnailUploader" // Specifies the UploadThing endpoint for uploading thumbnails
        input={{ videoId }} // Passes the video ID as input for the upload
        onClientUploadComplete={onUploadComplete} // Handles actions after a successful upload
      />
    </ResponsiveModal>
  );
};

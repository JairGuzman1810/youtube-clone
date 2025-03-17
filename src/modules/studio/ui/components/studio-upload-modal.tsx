"use client"; // Enable client-side rendering

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";

// StudioUploadModal component - Handles video creation and uploading in the studio
export const StudioUploadModal = () => {
  const router = useRouter(); // Hook for navigating between pages
  const utils = trpc.useUtils(); // Utility functions for cache management

  // Mutation hook for creating a new video entry
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created"); // Show success message on creation
      utils.studio.getMany.invalidate(); // Refresh studio videos list to reflect new upload
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message if creation fails
    },
  });

  // onSuccess function - Redirects to the newly created video's page
  const onSuccess = () => {
    if (!create.data?.video.id) return; // Ensure a valid video ID exists
    create.reset(); // Reset mutation state after successful creation
    router.push(`/studio/videos/${create.data.video.id}`); // Navigate to the new video page
  };

  return (
    <>
      {/* Modal for uploading a video */}
      <ResponsiveModal
        title="Upload a video"
        open={!!create.data?.url} // Open modal when a new upload URL is available
        onOpenChange={() => {
          create.reset(); // Reset mutation state when modal closes
        }}
      >
        {/* Show upload component if a valid upload URL exists */}
        {create.data?.url ? (
          <StudioUploader
            endpoint={create.data.url} // Upload endpoint provided by the backend
            onSuccess={onSuccess} // Callback to handle successful upload
          />
        ) : (
          <Loader2Icon /> // Show loader icon while waiting for upload URL
        )}
      </ResponsiveModal>

      {/* Button to initiate video creation */}
      <Button
        variant="secondary"
        onClick={() => create.mutate()} // Trigger video creation on click
        disabled={create.isPending} // Disable button while request is pending
      >
        {/* Show loading spinner while request is processing */}
        {create.isPending ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <PlusIcon /> // Show plus icon when ready to create
        )}
        Create
      </Button>
    </>
  );
};

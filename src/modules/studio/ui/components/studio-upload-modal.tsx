"use client"; // Enable client-side rendering

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

// StudioUploadModal component - Handles video creation in the studio
export const StudioUploadModal = () => {
  const utils = trpc.useUtils(); // Utility functions for cache management

  // Mutation hook for creating a new video
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created"); // Show success message
      utils.studio.getMany.invalidate(); // Refresh studio videos list
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message
    },
  });

  return (
    <Button
      variant="secondary"
      onClick={() => create.mutate()} // Trigger video creation
      disabled={create.isPending} // Disable button while request is pending
    >
      {/* Show loading spinner while request is processing */}
      {create.isPending ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <PlusIcon /> // Show plus icon when ready
      )}
      Create
    </Button>
  );
};

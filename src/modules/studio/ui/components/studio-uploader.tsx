import { Button } from "@/components/ui/button";
import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";

interface StudioUploaderProps {
  endpoint?: string | null; // Mux upload endpoint
  onSuccess: () => void; // Callback function triggered when upload succeeds
}

const UPLOADER_ID = "video-uploader"; // Unique ID for the Mux uploader instance

// StudioUploader component - Handles video file selection and upload process
export const StudioUploader = ({
  endpoint,
  onSuccess,
}: StudioUploaderProps) => {
  return (
    <div>
      {/* Hidden uploader instance for handling file uploads */}
      <MuxUploader
        onSuccess={onSuccess} // Callback when upload is successful
        endpoint={endpoint} // Mux upload endpoint
        id={UPLOADER_ID} // Identifier for the uploader
        className="hidden group/uploader"
      />

      {/* Dropzone UI for drag-and-drop file uploads */}
      <MuxUploaderDrop muxUploader={UPLOADER_ID} className="group/drop">
        <div slot="heading" className="flex flex-col items-center gap-6">
          {/* Icon placeholder for file drop area */}
          <div className="flex items-center justify-center gap-2 rounded-full bg-muted h-32 w-32">
            <UploadIcon className="group/drop-[&[active]]:animate-bounce size-10 text-muted-foreground transition-all duration-300" />
          </div>

          {/* Upload instructions */}
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm">Drag and drop video files to upload</p>
            <p className="text-xs text-muted-foreground">
              Your videos will be private until you publish them
            </p>
          </div>

          {/* Button to manually select files */}
          <MuxUploaderFileSelect muxUploader={UPLOADER_ID}>
            <Button type="button" className="rounded-full">
              Select Files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        {/* Upload progress indicators */}
        <span slot="separator" className="hidden" />
        <MuxUploaderStatus muxUploader={UPLOADER_ID} className="text-sm" />
        <MuxUploaderProgress
          muxUploader={UPLOADER_ID}
          className="text-sm"
          type="percentage" // Show upload progress as percentage
        />
        <MuxUploaderProgress muxUploader={UPLOADER_ID} type="bar" />
        {/* Show upload progress as a bar */}
      </MuxUploaderDrop>
    </div>
  );
};

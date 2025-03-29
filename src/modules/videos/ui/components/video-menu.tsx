import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_URL } from "@/constants";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

// VideoMenuProps - Defines the props for the VideoMenu component
interface VideoMenuProps {
  videoId: string; // ID of the video
  variant?: "ghost" | "secondary"; // Button variant style
  onRemove?: () => void; // Optional function to handle video removal
}

// VideoMenu component - Provides options for sharing, adding to playlists, and removing a video
export const VideoMenu = ({
  videoId,
  variant = "ghost",
  onRemove,
}: VideoMenuProps) => {
  // Copies the video URL to the clipboard and shows a success notification
  const onShare = () => {
    // Constructs the full video URL using the APP_URL constant
    const fullUrl = `${APP_URL}/videos/${videoId}`;

    // Copies the video URL to the user's clipboard
    navigator.clipboard.writeText(fullUrl);

    // Displays a success toast notification
    toast.success("Link copied to the clipboard");
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={"icon"} className="rounded-full">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {/* Share video option */}
        <DropdownMenuItem onClick={onShare}>
          <ShareIcon className="mr-2 size-4" />
          Share
        </DropdownMenuItem>

        {/* Add to playlist option */}
        <DropdownMenuItem onClick={() => {}}>
          <ListPlusIcon className="mr-2 size-4" />
          Add to playlist
        </DropdownMenuItem>

        {/* Remove video option (if onRemove is provided) */}
        {onRemove && (
          <DropdownMenuItem onClick={() => {}}>
            <Trash2Icon className="mr-2 size-4" />
            Remove
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

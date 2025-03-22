import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

// VideoDescriptionProps - Defines the props for the VideoDescription component
interface VideoDescriptionProps {
  compactViews: string; // Compact format for video views (e.g., "1K")
  expandedViews: string; // Expanded format for video views (e.g., "1,000")
  compactDate: string; // Compact format for video date (e.g., "2 days ago")
  expandedDate: string; // Expanded format for video date (e.g., "March 10, 2025")
  description?: string | null; // Video description (optional)
}

// VideoDescription - Displays the video description with expandable/collapsible functionality
export const VideoDescription = ({
  compactViews,
  expandedViews,
  compactDate,
  expandedDate,
  description,
}: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false); // State to toggle description expansion

  return (
    <div
      onClick={() => setIsExpanded((current) => !current)}
      className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
    >
      {/* Displays view count and video upload date */}
      <div className="flex gap-2 text-sm mb-2">
        <span className="font-medium">
          {isExpanded ? expandedViews : compactViews} views
        </span>
        <span className="font-medium">
          {isExpanded ? expandedDate : compactDate}
        </span>
      </div>

      {/* Video description with expandable behavior */}
      <div className="relative">
        <p
          className={cn(
            "text-sm whitespace-pre-wrap",
            !isExpanded && "line-clamp-2"
          )}
        >
          {description || "No description"}
        </p>

        {/* Toggle button to expand/collapse the description */}
        <div className="flex items-center gap-1 mt-4 text-sm font-medium">
          {isExpanded ? (
            <>
              Show less
              <ChevronUpIcon className="size-4" />
            </>
          ) : (
            <>
              Show more
              <ChevronDownIcon className="size-4" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

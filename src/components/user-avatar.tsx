import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Avatar, AvatarImage } from "./ui/avatar";

// Define avatar size variants using class-variance-authority
const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-9 w-9", // Default avatar size
      xs: "h-4 w-4", // Extra small avatar
      sm: "h-6 w-6", // Small avatar
      lg: "h-10 w-10", // Large avatar
      xl: "h-[160px] w-[160px]", // Extra large avatar
    },
  },
  defaultVariants: {
    size: "default", // Use default size if none is specified
  },
});

// Define the props for the UserAvatar component
interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string; // URL of the user's avatar image
  name: string; // Name of the user (for accessibility)
  className?: string; // Additional custom class names
  onClick?: () => void; // Optional click event handler
}

// UserAvatar component - displays a user's profile picture
export const UserAvatar = ({
  imageUrl,
  name,
  size,
  className,
  onClick,
}: UserAvatarProps) => {
  return (
    <Avatar
      className={cn(avatarVariants({ size, className }))} // Apply size variant and custom classes
      onClick={onClick} // Handle click event if provided
    >
      <AvatarImage src={imageUrl} alt={name} />
      {/* Display user avatar image */}
    </Avatar>
  );
};

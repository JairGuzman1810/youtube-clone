import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// SubscriptionButtonProps - Defines the props for the SubscriptionButton component
interface SubscriptionButtonProps {
  onClick: ButtonProps["onClick"]; // Click handler for the button
  disabled: boolean; // Whether the button is disabled
  isSubscribed: boolean; // Whether the user is subscribed
  className?: string; // Additional CSS classes
  size?: ButtonProps["size"]; // Size of the button
}

// SubscriptionButton component - Allows users to subscribe/unsubscribe from a channel
export const SubscriptionButton = ({
  onClick,
  disabled,
  isSubscribed,
  className,
  size,
}: SubscriptionButtonProps) => {
  return (
    <Button
      size={size}
      variant={isSubscribed ? "secondary" : "default"}
      className={cn("rounded-full", className)}
      onClick={onClick}
      disabled={disabled}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};

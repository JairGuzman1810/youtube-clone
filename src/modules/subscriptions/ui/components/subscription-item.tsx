import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { SubscriptionButton } from "./subscription-button";

interface SubscriptionItemProps {
  name: string;
  imageUrl: string;
  subscriberCount: number;
  onUnsubscribe: () => void;
  disabled: boolean;
}

// SubscriptionItemSkeleton component - Displays a loading skeleton for a subscription item
export const SubscriptionItemSkeleton = () => {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="size-10 rounded-full" />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-20" />
          </div>

          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
};

// SubscriptionItem component - Renders an individual subscription item with user info and the unsubscribe button
export const SubscriptionItem = ({
  name,
  imageUrl,
  subscriberCount,
  onUnsubscribe,
  disabled,
}: SubscriptionItemProps) => {
  return (
    <div className="flex items-start gap-4">
      {/* User avatar */}
      <UserAvatar size={"lg"} imageUrl={imageUrl} name={name} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            {/* Display user's name */}
            <h3 className="text-sm">{name}</h3>
            {/* Display subscriber count */}
            <p className="text-xs text-muted-foreground">
              {subscriberCount.toLocaleString()} subscribers
            </p>
          </div>
          <SubscriptionButton
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault(); // Prevent default action and trigger unsubscribe
              onUnsubscribe();
            }}
            disabled={disabled} // Disable button based on the 'disabled' prop
            isSubscribed
          />
        </div>
      </div>
    </div>
  );
};

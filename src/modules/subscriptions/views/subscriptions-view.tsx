import { SubscriptionsSection } from "../sections/subscriptions-section";

// SubscriptionsView component - Renders the subscriptions section with a header
export const SubscriptionsView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Render the subscriptions section header */}
      <div>
        <h1 className="text-2xl font-bold">All subscriptions</h1>
        <p className="text-xs text-muted-foreground">
          View and manage all your subscriptions
        </p>
      </div>

      {/* Renders the subscriptions section */}
      <SubscriptionsSection />
    </div>
  );
};

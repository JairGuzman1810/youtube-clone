// Ensures this component runs on the client side
"use client";

import { Separator } from "@/components/ui/separator";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  UserPageBanner,
  UserPageBannerSkeleton,
} from "../components/user-page-banner";
import {
  UserPageInfo,
  UserPageInfoSkeleton,
} from "../components/user-page-info";

// UserSectionProps - Defines the properties for the UserSection component
interface UserSectionProps {
  userId: string; // userId - Unique identifier for the user whose information is being fetched
}

// UserSection component - Renders the user profile banner and information with suspense and error boundaries
export const UserSection = (props: UserSectionProps) => {
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <UserSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// UserSectionSkeleton - Displays a loading skeleton while the user data is being fetched
const UserSectionSkeleton = () => {
  return (
    <div className="flex flex-col">
      <UserPageBannerSkeleton />
      <UserPageInfoSkeleton />
      <Separator />
    </div>
  );
};

// UserSectionSuspense - Fetches and renders the user's profile banner and information
const UserSectionSuspense = ({ userId }: UserSectionProps) => {
  // Fetch user details using the provided userId
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

  return (
    <div className="flex flex-col">
      {/* Renders the user profile banner with user-specific data */}
      <UserPageBanner user={user} />
      {/* Renders the user profile information (e.g., bio, stats) */}
      <UserPageInfo user={user} />
      {/* A separator element to visually separate sections */}
      <Separator />
    </div>
  );
};

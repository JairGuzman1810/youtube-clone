// Ensures this component runs on the client side
"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps {
  categoryId?: string;
}

// CategoriesSection wraps the content inside Suspense and ErrorBoundary
export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Skeleton loader displayed while categories are loading
const CategoriesSkeleton = () => {
  return <FilterCarousel isLoading data={[]} onSelectAction={() => {}} />;
};

// Fetches and displays categories inside the carousel
const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  const router = useRouter();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  // Format categories data for the filter carousel
  const data = categories.map(({ name, id }) => ({ value: id, label: name }));

  // Handle category selection and update the URL
  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);

    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }

    router.push(url.toString());
  };

  return (
    <FilterCarousel onSelectAction={onSelect} value={categoryId} data={data} />
  );
};

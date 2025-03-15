"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components//ui/carousel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

// Props definition for FilterCarousel component
interface FilterCarouselProps {
  value?: string | null; // Currently selected category ID (optional)
  isLoading?: boolean; // Loading state flag
  onSelectAction: (value: string | null) => void; // Callback function for when a category is selected
  data: {
    value: string;
    label: string;
  }[]; // Array of category options
}

// Component to render a horizontally scrollable category filter
export const FilterCarousel = ({
  value,
  onSelectAction,
  data,
  isLoading,
}: FilterCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>(); // State to store carousel API instance
  const [current, setCurrent] = useState(0); // Tracks the current visible carousel item index
  const [count, setCount] = useState(0); // Tracks total number of scrollable items

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length); // Get the total number of scrollable items
    setCurrent(api.selectedScrollSnap() + 1); // Get the current index

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="relative w-full">
      {/* Left gradient fade effect for visual aesthetics */}
      <div
        className={cn(
          "absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none",
          current === 1 && "hidden" // Hide gradient when at the first item
        )}
      />

      {/* Carousel component for scrolling categories */}
      <Carousel
        setApi={setApi} // Set carousel API reference
        opts={{ align: "start", dragFree: true }} // Carousel behavior settings
        className="w-full px-12"
      >
        <CarouselContent className="-ml-3">
          {isLoading ? (
            // Render skeleton loaders while data is loading
            Array.from({ length: 14 }).map((_, index) => (
              <CarouselItem key={index} className="basis-auto pl-3">
                <Skeleton className="h-full w-[100px] rounded-lg px-3 py-1 text-sm font-semibold">
                  &nbsp;
                </Skeleton>
              </CarouselItem>
            ))
          ) : (
            <>
              {/* "All" category button, resets selection */}
              <CarouselItem
                onClick={() => onSelectAction(null)}
                className="basis-auto pl-3"
              >
                <Badge
                  variant={!value ? "default" : "secondary"} // Highlight when no category is selected
                  className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-1 text-sm"
                >
                  All
                </Badge>
              </CarouselItem>

              {/* Render category options dynamically */}
              {data.map((item) => (
                <CarouselItem
                  onClick={() => onSelectAction(item.value)} // Handle category selection
                  key={item.value}
                  className="basis-auto pl-3"
                >
                  <Badge
                    variant={value === item.value ? "default" : "secondary"} // Highlight selected category
                    className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-1 text-sm"
                  >
                    {item.label}
                  </Badge>
                </CarouselItem>
              ))}
            </>
          )}
        </CarouselContent>

        {/* Navigation buttons for carousel scrolling */}
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20" />
      </Carousel>

      {/* Right gradient fade effect for visual aesthetics */}
      <div
        className={cn(
          "absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none",
          current === count && "hidden" // Hide gradient when at the last item
        )}
      />
    </div>
  );
};

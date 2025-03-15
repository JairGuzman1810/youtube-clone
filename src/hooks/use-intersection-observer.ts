import { useEffect, useRef, useState } from "react";

// Custom hook to track whether an element is visible in the viewport using Intersection Observer
export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false); // State to track if the element is in view
  const targetRef = useRef<HTMLDivElement>(null); // Reference to the target element

  useEffect(() => {
    // Create an IntersectionObserver instance
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting); // Update state based on intersection status
    }, options);

    // Start observing the target element if it exists
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    // Cleanup function to disconnect the observer when the component unmounts
    return () => observer.disconnect();
  }, [options]); // Re-run effect if options change

  // Return the ref to be assigned to an element and the intersection state
  return { targetRef, isIntersecting };
};

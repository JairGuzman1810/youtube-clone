"use client";

import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constants";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// SearchInput component - Handles user search input functionality, redirects to search results page
export const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");

  // Handles the search form submission, redirects to the search results page with query
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Constructs the URL for search with query parameter
    const url = new URL(
      "/search",
      APP_URL ? `https://${APP_URL}` : "http://localhost:3000"
    );
    const newQuery = value.trim();

    // Sets the query parameter if not empty, otherwise removes it
    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (newQuery === "") {
      url.searchParams.delete("query");
    }

    setValue(newQuery); // Update the value state

    // Navigate to the search results page
    router.push(url.toString());
  };

  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div className="relative w-full">
        {/* Search input field */}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)} // Update value on input change
          type="text"
          placeholder="Search"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
        />
        {value && (
          // Clear button for the search input field
          <Button
            type={"button"}
            variant={"ghost"}
            size={"icon"}
            onClick={() => setValue("")} // Clears the input field
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
          >
            <XIcon className="text-gray-500" />
          </Button>
        )}
      </div>
      {/* Search button */}
      <button
        disabled={!value.trim()} // Disable button if input is empty
        type="submit"
        className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Search icon */}
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};

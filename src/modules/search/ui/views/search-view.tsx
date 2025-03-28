import { CategoriesSection } from "../sections/categories-section";
import { ResultsSection } from "../sections/results-section";

// Defines the structure for the search query and categoryId props
interface SearchViewProps {
  query: string | undefined; // The search query provided by the user
  categoryId: string | undefined; // The category ID for filtering search results (optional)
}

// SearchView component - Renders the search interface with categories and results sections
export const SearchView = ({ query, categoryId }: SearchViewProps) => {
  return (
    <div className="max-w-[1300px] mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
      {/* Renders the category filter section */}
      <CategoriesSection categoryId={categoryId} />

      {/* Renders the search results section */}
      <ResultsSection query={query} categoryId={categoryId} />
    </div>
  );
};

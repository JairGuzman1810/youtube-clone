// HomeView component acts as the main view for the home page
import { CategoriesSection } from "../sections/categories-section";

interface HomeViewProps {
  categoryId?: string; // Optional category ID to filter categories
}

// HomeView renders the categories section
export const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <CategoriesSection categoryId={categoryId} />
    </div>
  );
};

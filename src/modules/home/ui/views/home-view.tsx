import { CategoriesSection } from "../sections/categories-section";
import { HomeVideosSection } from "../sections/home-videos-section";

// Defines the structure for the HomeView component props
interface HomeViewProps {
  categoryId?: string; // Optional category ID to filter categories
}

// HomeView component - Renders the home page interface with categories and videos sections
export const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Renders the categories section */}
      <CategoriesSection categoryId={categoryId} />

      {/* Renders the home videos section */}
      <HomeVideosSection categoryId={categoryId} />
    </div>
  );
};

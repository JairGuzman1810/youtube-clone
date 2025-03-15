import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainSection } from "./main-section";
import { PersonalSection } from "./personal-section";

// Sidebar component for the Home page
export const HomeSidebar = () => {
  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
      <SidebarContent className="bg-background">
        <MainSection /> {/* Renders the main navigation section */}
        <Separator /> {/* Visual separator between sections */}
        <PersonalSection /> {/* Renders the personal navigation section */}
      </SidebarContent>
    </Sidebar>
  );
};

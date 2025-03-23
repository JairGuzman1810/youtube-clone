import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";

// Define props type for the StudioLayout component
interface StudioLayoutProps {
  children: React.ReactNode; // Represents the child components (main content)
}

// StudioLayout component - Provides layout structure for the studio interface
export const StudioLayout = ({ children }: StudioLayoutProps) => {
  return (
    <SidebarProvider>
      {/* Provides context for sidebar state */}
      <div className="w-full">
        {/* Top navigation bar */}
        <StudioNavbar />
        <div className="flex min-h-screen pt-[4rem]">
          {/* Sidebar navigation */}
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
          {/* Main content area */}
        </div>
      </div>
    </SidebarProvider>
  );
};

import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "../components/home-navbar";
import { HomeSidebar } from "../components/home-sidebar";

// Define the props interface for HomeLayout
interface HomeLayoutProps {
  children: React.ReactNode; // Represents the nested content inside the layout
}

// Home page layout component
export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    // Wrap the entire layout in SidebarProvider to manage sidebar state
    <SidebarProvider>
      <div className="w-full">
        {/* Render the home page navbar */}
        <HomeNavbar />

        {/* Main content area with sidebar and dynamic page content */}
        <div className="flex min-h-screen pt-[4rem]">
          {/* Sidebar for navigation */}
          <HomeSidebar />

          {/* Main content section - dynamically displays children components */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

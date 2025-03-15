import { HomeLayout } from "@/modules/home/ui/layouts/home-layout";
import { TRPCProvider } from "@/trpc/client";

// Define the props interface for the layout component
interface LayoutProps {
  children: React.ReactNode; // Accepts React nodes as children
}

// Main layout component wrapping pages with a home layout and TRPC provider
const Layout = ({ children }: LayoutProps) => {
  return (
    <HomeLayout>
      {/* Wraps content inside the home layout */}
      <TRPCProvider>
        {/* Provides API functionality to all child components */}
        {children} {/* Render the page content */}
      </TRPCProvider>
    </HomeLayout>
  );
};

export default Layout;

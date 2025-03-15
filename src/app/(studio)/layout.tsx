import { StudioLayout } from "@/modules/studio/ui/layouts/studio-layout";
import { TRPCProvider } from "@/trpc/client";

// Define the props interface for the layout component
interface LayoutProps {
  children: React.ReactNode; // Accepts React nodes as children
}

// Studio layout component wrapping pages with a studio-specific layout and TRPC provider
const Layout = ({ children }: LayoutProps) => {
  return (
    <StudioLayout>
      {/* Wraps content inside the studio layout */}
      <TRPCProvider>
        {/* Provides API functionality to all child components */}
        {children} {/* Render the page content */}
      </TRPCProvider>
    </StudioLayout>
  );
};

export default Layout;

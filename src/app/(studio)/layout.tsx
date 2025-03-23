import { StudioLayout } from "@/modules/studio/ui/layouts/studio-layout";
import { TRPCProvider } from "@/trpc/client";

// Define the props interface for the layout component
interface LayoutProps {
  children: React.ReactNode; // Accepts React nodes as children
}

// Studio layout component wrapping pages with a studio-specific layout and TRPC provider
const Layout = ({ children }: LayoutProps) => {
  return (
    //* Wraps content inside the studio layout
    <StudioLayout>
      {/* Provides API functionality to all child components */}
      <TRPCProvider>
        {/* Render the page content */}
        {children}
      </TRPCProvider>
    </StudioLayout>
  );
};

export default Layout;

import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { SignedIn } from "@clerk/nextjs";
import { MainSection } from "./main-section";
import { PersonalSection } from "./personal-section";
import { SubscriptionsSection } from "./subscriptions-section";

// Sidebar component for the Home page
export const HomeSidebar = () => {
  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
      <SidebarContent className="bg-background">
        {/* Renders the main navigation section */}
        <MainSection />
        {/* Visual separator between sections */}
        <Separator />
        {/* Renders the personal navigation section */}
        <PersonalSection />
        {/* Only render subscriptions section if the user is signed in */}
        <SignedIn>
          <>
            {/* Visual separator between personal and subscriptions sections */}
            <Separator />
            {/* Renders the subscriptions navigation section */}
            <SubscriptionsSection />
          </>
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  );
};

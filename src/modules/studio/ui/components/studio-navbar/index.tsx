import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import Image from "next/image";
import Link from "next/link";
import { StudioUploadModal } from "../studio-upload-modal";

// Navbar component for the Studio page
export const StudioNavbar = () => {
  return (
    // Fixed navbar at the top with styling for layout and visibility
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50 border-b shadow-md">
      <div className="flex items-center gap-4 w-full">
        {/* Sidebar trigger and logo section */}
        <div className="flex items-center flex-shrink-0">
          {/* Button to toggle sidebar */}
          <SidebarTrigger />
          <Link prefetch href={"/studio"} className="hidden md:block">
            <div className="p-4 flex items-center gap-1">
              <Image src={"/logo.svg"} width={50} height={50} alt="Logo" />
              <p className="text-xl font-semibold tracking-tight">Studio</p>
            </div>
          </Link>
        </div>

        {/* Spacer to push elements to the right */}
        <div className="flex-1" />

        {/* Action buttons section: Upload modal and authentication */}
        <div className="flex-shrink-0 items-center flex gap-4">
          {/* Opens upload modal */}
          <StudioUploadModal />
          {/* User authentication button */}
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

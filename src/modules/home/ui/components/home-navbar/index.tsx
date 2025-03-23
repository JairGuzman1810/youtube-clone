import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import Image from "next/image";
import Link from "next/link";
import { SearchInput } from "./search-input";

// HomeNavbar component - Displays the main navigation bar at the top of the page
export const HomeNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full">
        {/* Menu and Logo Section */}
        <div className="flex items-center flex-shrink-0">
          {/* Sidebar navigation trigger */}
          <SidebarTrigger />
          <Link href={"/"}>
            <div className="p-4 flex items-center gap-1">
              <Image src={"/logo.svg"} width={50} height={50} alt="Logo" />
              <p className="text-xl font-semibold tracking-tight">New Tube</p>
            </div>
          </Link>
        </div>

        {/* Search bar Section */}
        <div className="flex-1 flex justify-center max-w-[720px] mx-auto">
          {/* Search input field */}
          <SearchInput />
        </div>

        {/* Authentication Button Section */}
        <div className="flex-shrink-0 items-center flex gap-4">
          {/* Displays login or user profile button */}
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ClapperboardIcon, UserCircleIcon, UserIcon } from "lucide-react";

// Authentication button component - Handles user login/logout and profile actions
export const AuthButton = () => {
  return (
    <>
      <SignedIn>
        {/* When the user is signed in, display the profile button with menu options */}
        <UserButton>
          <UserButton.MenuItems>
            {/* Link to the My profile page */}
            <UserButton.Link
              label="My profile"
              href="/users/current"
              labelIcon={<UserIcon className="size-4" />}
            />
            {/* Link to the Studio page */}
            <UserButton.Link
              label="Studio"
              href="/studio"
              labelIcon={<ClapperboardIcon className="size-4" />}
            />
            {/* Account management action */}
            <UserButton.Action label="manageAccount" />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
      <SignedOut>
        {/* When the user is signed out, display a sign-in button */}
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none [&_svg]:size-5"
          >
            <UserCircleIcon />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};

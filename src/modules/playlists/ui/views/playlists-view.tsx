"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { PlaylistCreateModal } from "../components/playlist-create-modal";
import { PlaylistsSection } from "../sections/playlists-section";

// PlaylistsView component - Renders the playlists section with a header and create button
export const PlaylistsView = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="max-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Playlist creation modal for adding new playlists */}
      <PlaylistCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {/* Header section for the playlists page */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-xs text-muted-foreground">
            Collections you have created
          </p>
        </div>

        {/* Button to open the playlist creation modal */}
        <Button
          variant={"outline"}
          size={"icon"}
          className="rounded-full"
          onClick={() => setCreateModalOpen(true)}
        >
          <PlusIcon />
        </Button>
      </div>

      {/* Section displaying the user's playlists */}
      <PlaylistsSection />
    </div>
  );
};

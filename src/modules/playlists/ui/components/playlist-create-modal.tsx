import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Defines props for the PlaylistCreateModal component
interface PlaylistCreateModalProps {
  open: boolean; // Controls whether the modal is open or closed
  onOpenChange: (open: boolean) => void; // Callback function to handle modal state changes
}

// Form validation schema for playlist creation
const formSchema = z.object({
  name: z.string().min(1), // Requires a non-empty playlist name
});

// PlaylistCreateModal - Modal for creating a new playlist
export const PlaylistCreateModal = ({
  open,
  onOpenChange,
}: PlaylistCreateModalProps) => {
  // Initialize form handling with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Use Zod for form validation
    defaultValues: {
      name: "", // Default value for the playlist name input
    },
  });

  const utils = trpc.useUtils(); // Utility functions for TRPC cache management

  // Mutation for creating a new playlist
  const create = trpc.playlists.create.useMutation({
    onSuccess: () => {
      utils.playlists.getMany.invalidate(); // Invalidate cache to refresh playlist list
      toast.success("Playlist created"); // Show success message
      form.reset(); // Reset form fields
      onOpenChange(false); // Close the modal
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message if creation fails
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    create.mutate(values); // Call mutation with form values
  };

  return (
    <ResponsiveModal
      title="Create a playlist" // Modal title
      open={open}
      onOpenChange={onOpenChange}
    >
      {/* Playlist creation form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Playlist name input field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Playlist Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="My favorite videos" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Submit button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={create.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};

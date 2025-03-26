import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// CommentFormProps - Defines the props required for the CommentForm component
interface CommentFormProps {
  videoId: string; // Unique identifier for the video
  parentId?: string; // Optional parent comment ID for replies
  onSuccess?: () => void; // Callback function triggered on successful comment submission
  onCancel?: () => void; // Callback function triggered when comment form is canceled
  variant?: "comment" | "reply"; // Determines if the form is for a comment or a reply
}

// CommentForm - Component for submitting comments or replies
export const CommentForm = ({
  videoId,
  parentId,
  onCancel,
  onSuccess,
  variant = "comment",
}: CommentFormProps) => {
  const { user } = useUser(); // Get the authenticated user's details
  const clerk = useClerk(); // Clerk instance for authentication handling
  const utils = trpc.useUtils(); // Utility functions for cache invalidation

  // Mutation to create a new comment
  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId }); // Invalidate cache to refresh top-level comments
      utils.comments.getMany.invalidate({ videoId, parentId }); // Invalidate cache to refresh replies
      form.reset(); // Reset the form after successful submission
      toast.success("Comment added"); // Show success notification
      onSuccess?.(); // Execute optional success callback
    },
    onError: (error) => {
      toast.error("Something went wrong"); // Show error notification

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn(); // Prompt the user to sign in if unauthorized
      }
    },
  });

  // Define form schema based on the comment schema, omitting the userId field
  const commentSchema = commentInsertSchema.omit({ userId: true });
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema), // Validate form inputs using Zod
    defaultValues: {
      parentId, // Pre-fill parentId if replying
      videoId, // Set the video ID
      value: "", // Default empty comment value
    },
  });

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof commentSchema>) => {
    create.mutate(values); // Send mutation request to create a comment
  };

  // Handle form cancellation
  const handleCancel = () => {
    form.reset(); // Reset form fields
    onCancel?.(); // Execute optional cancel callback
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex gap-4 group"
      >
        {/* User Avatar - Displays the current user's profile image */}
        <UserAvatar
          size={"lg"}
          imageUrl={user?.imageUrl || "/user-placeholder.svg"}
          name={user?.username || "User"}
        />
        <div className="flex-1">
          {/* Comment Input Field */}
          <FormField
            name="value"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      variant === "reply"
                        ? "Reply to this comment..."
                        : "Add a comment..."
                    }
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons (Submit & Cancel) */}
          <div className="justify-end gap-2 mt-2 flex">
            {/* Cancel Button (Only visible if onCancel is provided) */}
            {onCancel && (
              <Button variant={"ghost"} type="button" onClick={handleCancel}>
                Cancel
              </Button>
            )}

            {/* Submit Button */}
            <Button disabled={create.isPending} type="submit" size={"sm"}>
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

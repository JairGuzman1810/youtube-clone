"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { APP_URL } from "@/constants";
import { videoUpdateSchema } from "@/db/schema";
import { snakeCaseToTitle } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";

// Define the props interface for the FormSection component
interface FormSectionProps {
  videoId: string; // Unique identifier for the video
}

// FormSection component - Handles video metadata and interactions
export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Skeleton loader for form section
const FormSectionSkeleton = () => {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[220px] w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-[84px] w-[153px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col gap-4 overflow-hidden rounded-xl bg-[#f9f9f9]">
            <Skeleton className="aspect-video" />
            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </>
  );
};

// FormSectionSuspense component - Handles data fetching and form submission
const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const router = useRouter(); // Hook for navigating between pages
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId }); // Fetch video details
  const [categories] = trpc.categories.getMany.useSuspenseQuery(); // Fetch available categories

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false); // State to control the thumbnail upload modal

  const utils = trpc.useUtils(); // Utility functions for cache invalidation

  // Mutation hook for updating video details
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate(); // Refresh studio videos list
      utils.studio.getOne.invalidate({ id: videoId }); // Refresh single video details
      toast.success("Video updated"); // Show success message
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message on failure
    },
  });

  // Mutation hook for deleting a video
  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate(); // Refresh studio videos list
      toast.success("Video removed"); // Show success message
      router.push("/studio"); // Redirect to studio page
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message on failure
    },
  });

  // Mutation hook for revalidating video upload status with Mux
  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate(); // Refresh the list of videos in the studio
      utils.studio.getOne.invalidate({ id: videoId }); // Refresh the specific video details
      toast.success("Video revalidated"); // Display success notification
    },
    onError: () => {
      toast.error("Something went wrong"); // Display error notification if revalidation fails
    },
  });

  // Mutation hook for restoring the video thumbnail from Mux
  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate(); // Refresh studio videos list
      utils.studio.getOne.invalidate({ id: videoId }); // Refresh single video details
      toast.success("Thumbnail restored"); // Show success message
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message on failure
    },
  });

  // Mutation hook for generating a video description using AI
  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("Background job started", {
        description: (
          <span className="text-gray-500">This may take some time</span>
        ),
      }); // Show success message
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message on failure
    },
  });

  // Mutation hook for generating an SEO-friendly video title using AI
  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("Background job started", {
        description: (
          <span className="text-gray-500">This may take some time</span>
        ),
      }); // Show success message
    },
    onError: () => {
      toast.error("Something went wrong"); // Show error message on failure
    },
  });

  // Form handling setup
  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema), // Use Zod schema validation
    defaultValues: video, // Pre-fill form with existing video data
  });

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(data);
  };

  // Construct full URL for video link
  const fullUrl = `${APP_URL}/videos/${videoId}`;

  const [isCopied, setIsCopied] = useState(false); // State for copy button feedback

  // Copy video link to clipboard
  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    // Form container with form state management
    <>
      {/* Thumbnail Upload Modal */}
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header section with title and actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <h1 className="text-xs text-muted-foreground">
                Manage your video details
              </h1>
            </div>
            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                disabled={update.isPending || !form.formState.isDirty}
              >
                Save
              </Button>
              {/* Dropdown menu for additional actions */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} size={"icon"}>
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Option to delete the video */}
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: videoId })}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  {/* Option to revalidate the video's upload status with Mux */}
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ id: videoId })}
                  >
                    <RotateCcwIcon className="size-4 mr-2" />
                    Revalidate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Grid layout for video details and settings */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column - Video details form fields */}
            <div className="space-y-8 lg:col-span-3">
              {/* Video Title Input Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Title
                        {/* Button to generate an AI-powered video title */}
                        <Button
                          size="icon"
                          variant="outline"
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() => generateTitle.mutate({ id: videoId })}
                          disabled={
                            generateTitle.isPending || !video.muxTrackId
                          }
                        >
                          {generateTitle.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Video Description Input Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Description
                        {/* Button to generate an AI-powered video description */}
                        <Button
                          size="icon"
                          variant="outline"
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() =>
                            generateDescription.mutate({ id: videoId })
                          }
                          disabled={
                            generateDescription.isPending || !video.muxTrackId
                          }
                        >
                          {generateDescription.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={10}
                        placeholder="Add a description to your video"
                        className="resize-none pr-10"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Thumbnail Upload and Management */}
              <FormField
                name="thumbnailUrl"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                        <Image
                          src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
                          className="object-cover"
                          fill
                          alt="Thumbnail"
                        />
                        {/* Dropdown menu for thumbnail options */}
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="bg-blue/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                            >
                              <MoreVerticalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            {/* Change Thumbnail Option */}
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon className="size-4 mr-1" />
                              Change
                            </DropdownMenuItem>
                            {/* Restore Default Thumbnail Option */}
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ id: videoId })
                              }
                            >
                              <RotateCcwIcon className="size-4 mr-1" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Video Category Selection */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem value={category.id} key={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Right column - Video preview and metadata */}
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              {/* Video Preview Container */}
              <div className="flex h-fit flex-col gap-4 overflow-hidden rounded-xl bg-[#f9f9f9]">
                {/* Video player preview */}
                <div className="relative aspect-video overflow-hidden">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  {/* Video Link Section */}
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video Link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>
                        {/* Copy Video Link Button */}
                        <Button
                          type="button"
                          variant={"ghost"}
                          size={"icon"}
                          className="shrink-0"
                          onClick={onCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Video Processing Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || "preparing")}
                      </p>
                    </div>
                  </div>

                  {/* Subtitles Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitles Status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(
                          video.muxTrackStatus || "no_subtitles"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visibility Selection Dropdown */}
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Public Visibility Option */}
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe2Icon className="size-4 mr-4" />
                            Public
                          </div>
                        </SelectItem>
                        {/* Private Visibility Option */}
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <LockIcon className="size-4 mr-4" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

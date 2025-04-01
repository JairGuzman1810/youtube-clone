import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

// Defines the inferred output type of the "getMany" procedure from the "playlists" router
export type PlaylistGetManyOutput =
  inferRouterOutputs<AppRouter>["playlists"]["getMany"];

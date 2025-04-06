import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

// Infers the output type of the "getOne" procedure from the "videos" router
export type VideoGetOneOutput =
  inferRouterOutputs<AppRouter>["videos"]["getOne"];

// Infers the output type of the "getMany" procedure from the "suggestions" router
export type VideoGetManyOutput =
  inferRouterOutputs<AppRouter>["suggestions"]["getMany"];

import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

// Defines the inferred output type of the "getMany" procedure from the "comments" router
export type CommentsGetManyOutput =
  inferRouterOutputs<AppRouter>["comments"]["getMany"];

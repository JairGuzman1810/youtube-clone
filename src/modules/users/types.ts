import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

// Infers the output type of the "getOne" procedure from the "users" router
export type UserGetOneOutput = inferRouterOutputs<AppRouter>["users"]["getOne"];

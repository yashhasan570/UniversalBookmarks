import { createCallerFactory } from "@universalbookmarks/trpc";
import { buildImpersonatingAuthedContext as buildAuthedContext } from "@universalbookmarks/trpc/lib/impersonate";
import { appRouter } from "@universalbookmarks/trpc/routers/_app";

export const buildImpersonatingAuthedContext = buildAuthedContext;

/**
 * This is only safe to use in the context of a worker.
 */
export async function buildImpersonatingTRPCClient(userId: string) {
  const createCaller = createCallerFactory(appRouter);

  return createCaller(await buildImpersonatingAuthedContext(userId));
}

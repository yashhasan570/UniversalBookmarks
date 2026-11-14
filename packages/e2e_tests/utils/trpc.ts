import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@universalbookmarks/trpc/routers/_app";

export function getTrpcClient(
  apiKey?: string,
  port = process.env.UNIVERSALBOOKMARKS_PORT,
) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        transformer: superjson,
        url: `http://localhost:${port}/api/trpc`,
        headers() {
          return {
            authorization: apiKey ? `Bearer ${apiKey}` : undefined,
          };
        },
      }),
    ],
  });
}

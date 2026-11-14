import { Hono } from "hono";

import serverConfig from "@universalbookmarks/shared/config";
import { Context } from "@universalbookmarks/trpc";

const version = new Hono<{
  Variables: {
    ctx: Context;
  };
}>().get("/", (c) => {
  return c.json({
    version: serverConfig.serverVersion ?? "unknown",
  });
});

export default version;

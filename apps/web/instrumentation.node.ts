import {
  initEventLogger,
  initTracing,
  loadAllPlugins,
} from "@universalbookmarks/shared-server";

await loadAllPlugins();
await initTracing("web");
await initEventLogger("web");

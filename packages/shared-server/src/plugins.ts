import { PluginManager } from "@universalbookmarks/shared/plugins";

const pluginLoaderStateKey = "__universalbookmarks_plugins_loader_state__";

const globalPluginLoaderState = globalThis as typeof globalThis & {
  [pluginLoaderStateKey]?: {
    loaded: boolean;
    loading?: Promise<void>;
  };
};

const pluginLoaderState = (globalPluginLoaderState[pluginLoaderStateKey] ??= {
  loaded: false,
});

export async function loadAllPlugins() {
  if (pluginLoaderState.loaded) {
    return;
  }
  if (pluginLoaderState.loading) {
    await pluginLoaderState.loading;
    return;
  }
  pluginLoaderState.loading = (async () => {
    // Load plugins here. Order of plugin loading matter.
    // Asset store providers (order matters - last one wins)
    await import("@universalbookmarks/plugins/assetstore-filesystem");
    await import("@universalbookmarks/plugins/assetstore-s3");
    // Queue provider(s)
    await import("@universalbookmarks/plugins/queue-liteque");
    await import("@universalbookmarks/plugins/queue-restate");
    await import("@universalbookmarks/plugins/search-meilisearch");
    await import("@universalbookmarks/plugins/vectorstore-meilisearch");
    // Rate limiters (order matters - last one wins)
    await import("@universalbookmarks/plugins/ratelimit-memory");
    await import("@universalbookmarks/plugins/ratelimit-redis");
    PluginManager.logAllPlugins();
    pluginLoaderState.loaded = true;
  })();

  try {
    await pluginLoaderState.loading;
  } finally {
    pluginLoaderState.loading = undefined;
  }
}

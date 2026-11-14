// Auto-register the RateLimit plugin when this package is imported
import serverConfig from "@universalbookmarks/shared/config";
import { PluginManager, PluginType } from "@universalbookmarks/shared/plugins";
import type { PluginProvider } from "@universalbookmarks/shared/plugins";
import type { RateLimitClient } from "@universalbookmarks/shared/ratelimiting";

interface RedisRateLimiterOptions {
  url: string;
}

class RedisRateLimitProvider implements PluginProvider<RateLimitClient> {
  private provider: PluginProvider<RateLimitClient> | null = null;

  constructor(private readonly options: RedisRateLimiterOptions) {}

  async getClient(): Promise<RateLimitClient | null> {
    const { RedisRateLimitProvider: RedisRateLimitProviderImpl } =
      await import("./src");
    if (!this.provider) {
      this.provider = new RedisRateLimitProviderImpl(this.options);
    }
    return this.provider.getClient();
  }
}

if (serverConfig.redis?.url) {
  PluginManager.register({
    type: PluginType.RateLimit,
    name: "Redis Rate Limiter",
    provider: new RedisRateLimitProvider({
      url: serverConfig.redis.url,
    }),
  });
}

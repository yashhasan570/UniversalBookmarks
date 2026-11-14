import type { AssetStore } from "@universalbookmarks/shared/assetdb";
import serverConfig from "@universalbookmarks/shared/config";
import { PluginManager, PluginType } from "@universalbookmarks/shared/plugins";
import type { PluginProvider } from "@universalbookmarks/shared/plugins";

export class FileSystemAssetStoreProvider implements PluginProvider<AssetStore> {
  private client: AssetStore | null = null;

  async getClient(): Promise<AssetStore> {
    if (!this.client) {
      const { LocalFileSystemAssetStore } = await import("./src");
      if (!this.client) {
        this.client = new LocalFileSystemAssetStore(serverConfig.assetsDir);
      }
    }
    return this.client;
  }
}

PluginManager.register({
  type: PluginType.AssetStore,
  name: "Filesystem",
  provider: new FileSystemAssetStoreProvider(),
});

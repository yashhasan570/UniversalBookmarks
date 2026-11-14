import { clientConfig } from "@universalbookmarks/shared/config";
import { zClientConfigSchema } from "@universalbookmarks/shared/types/config";

import { publicProcedure, router } from "../index";

export const configAppRouter = router({
  clientConfig: publicProcedure
    .output(zClientConfigSchema)
    .query(() => clientConfig),
});

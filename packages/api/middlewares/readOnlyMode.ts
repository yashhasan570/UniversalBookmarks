import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import serverConfig from "@universalbookmarks/shared/config";
import { getReadOnlyModeError } from "@universalbookmarks/shared/readOnlyMode";

export const rejectMutationInReadOnlyMode = createMiddleware(
  async (_c, next) => {
    const message = getReadOnlyModeError(serverConfig);
    if (message) {
      throw new HTTPException(403, { message });
    }
    return next();
  },
);

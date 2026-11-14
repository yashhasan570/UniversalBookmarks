import createClient from "openapi-fetch";

import type { components, paths } from "./universalbookmarks-api.d.ts";

/**
 * @deprecated Use createUniversalBookmarksClient instead.
 */
export const createUniversalBookmarksClient = createClient<paths>;

export const createUniversalBookmarksClient = createClient<paths>;

export type UniversalBookmarksAPISchemas = components["schemas"];

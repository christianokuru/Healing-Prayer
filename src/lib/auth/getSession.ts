import "server-only";
import { cache } from "react";
import { getServerApi } from "../api/server";
import type { User } from "../api/types";
import { isApiError } from "../errors";

/**
 * The logged-in user for this request, or null. Deduplicated per request.
 * Only "not logged in" becomes null; other failures are thrown so guards never
 * mistake an outage for a logged-out visitor.
 */
export const getSession = cache(async (): Promise<User | null> => {
  const api = await getServerApi();
  try {
    return (await api.auth.me()).user;
  } catch (error) {
    if (isApiError(error, "UNAUTHENTICATED")) return null;
    throw error;
  }
});

import { createSend } from "./client";
import { createApi } from "./endpoints";

/** The API for client components. Same origin, cookies sent by the browser. */
export const api = createApi(createSend());

export type { Api, RegisterInput } from "./endpoints";
export * from "./types";

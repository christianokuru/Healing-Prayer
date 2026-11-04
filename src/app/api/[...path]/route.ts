import { USE_MOCK } from "@/lib/config";
import { handleMockRequest } from "@/lib/api/mock/handlers";
import { getStore } from "@/lib/api/mock/store";

// Serves the mock API in mock mode only. In production, Nginx sends /api/* to FastAPI,
// and in development with a real backend, next.config rewrites /api/* before this runs.

const MOCK_DELAY_MS = 250;

async function handle(request: Request, ctx: RouteContext<"/api/[...path]">): Promise<Response> {
  if (!USE_MOCK) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Mock API is off." } },
      { status: 404 },
    );
  }
  const { path } = await ctx.params;
  // A short delay so loading states are visible during development.
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return handleMockRequest(request, path, getStore());
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };

import { clerkMiddleware } from "@clerk/nextjs/server";
import { createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(["/multi-project-board(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

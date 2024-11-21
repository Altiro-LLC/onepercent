/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// Base directory for your API routes
const baseDir = path.join(__dirname, "app/api");

const boilerplate = `import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({ message: "GET response from the route." });
}

export async function POST(req: Request) {
  return NextResponse.json({ message: "POST response from the route." });
}

export async function DELETE(req: Request) {
  return NextResponse.json({ message: "DELETE response from the route." });
}
`;

function createRoute(route) {
  // Convert route string into a path
  const routePath = path.join(baseDir, route);

  // Ensure all directories exist
  fs.mkdirSync(routePath, { recursive: true });

  // Full path for the route.ts file
  const routeFilePath = path.join(routePath, "route.ts");

  // Check if the route.ts file already exists
  if (fs.existsSync(routeFilePath)) {
    console.log(`❌ The route "${route}" already exists.`);
    return;
  }

  // Write the boilerplate to the route.ts file
  fs.writeFileSync(routeFilePath, boilerplate);
  console.log(`✅ Created route: ${route}`);
}

// Get the route name from command-line arguments
const route = process.argv[2];
if (!route) {
  console.log("❌ Please provide a route name.");
  console.log("Example: npm run create-route feature-requests");
  process.exit(1);
}

// Create the route
createRoute(route);

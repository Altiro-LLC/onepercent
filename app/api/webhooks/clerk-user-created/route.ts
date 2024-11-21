import clientPromise from "@/lib/mongo";
import { WebhookEvent } from "@clerk/nextjs/server";

import { Webhook } from "svix";
import { NextRequest, NextResponse } from "next/server";

// Replace the deprecated export for API config
export const dynamic = "force-dynamic"; // For dynamic routes in Next.js

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the Svix headers for verification
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  // Ensure headers are present
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Error occurred -- no Svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (evt.type === "user.created") {
    const userId = evt.data.id;
    const userEmail = evt.data.email_addresses[0]?.email_address;
    const firstName = evt.data.first_name;
    const lastName = evt.data.last_name;

    try {
      // Save user in MongoDB
      const client = await clientPromise;
      const db = client.db("onepercent");
      const collection = db.collection("users");

      await collection.insertOne({
        firstName,
        lastName,
        clerkUserId: userId,
        email: userEmail,
        createdAt: new Date(),
      });

      console.log(`User ${userId} has been created.`);
    } catch (err) {
      console.error("Error saving user in MongoDB:", err);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ response: "Success" });
}

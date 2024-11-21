import clientPromise from "@/lib/mongo";
import { WebhookEvent } from "@clerk/nextjs/server";
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import { Webhook } from "svix";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  console.log(process.env.WEBHOOK_SECRET);
  const { WEBHOOK_SECRET } = process.env;
  console.log("WEBHOOK_SECRET: ", WEBHOOK_SECRET);
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the Svix headers for verification
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: "Error occured -- no svix headers" });
  }

  console.log("headers", req.headers, svixId, svixSignature, svixTimestamp);
  // Get the body
  const body = (await buffer(req)).toString();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Attempt to verify the incoming webhook
  // If successful, the payload will be available from 'evt'
  // If the verification fails, error out and  return error code
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).json({ Error: err });
  }
  // Whatever
  // Do something with the payload
  // For this guide, you simply log the payload to the console
  // const { id } = evt.data;
  // const eventType = evt.type;
  if (evt.type === "user.created") {
    const userId = evt.data.id;
    const userEmail = evt.data.email_addresses[0]?.email_address;
    // const userName = `${evt.data.first_name} ${evt.data.last_name}`;
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
      console.error(
        "Error creating Stripe customer or subscription or Clerk user:",
        err
      );
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json({ response: "Success" });
}

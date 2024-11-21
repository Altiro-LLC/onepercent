import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    // Fetch all feature requests
    const featureRequests = await db
      .collection("featureRequests")
      .find({})
      .toArray();

    return NextResponse.json(featureRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching feature requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { userId, title, description } = await req.json();

    // Validate input
    if (!userId || !title || !description) {
      return NextResponse.json(
        { error: "userId, title, and description are required." },
        { status: 400 }
      );
    }

    // Create the new feature request
    const newFeatureRequest = {
      userId,
      title,
      description,
      votes: 0,
      createdAt: new Date().toISOString(),
    };

    // Insert into the collection
    const result = await db
      .collection("featureRequests")
      .insertOne(newFeatureRequest);

    // Fetch the inserted document
    const insertedFeatureRequest = await db
      .collection("featureRequests")
      .findOne({ _id: result.insertedId });

    return NextResponse.json(insertedFeatureRequest, { status: 201 });
  } catch (error) {
    console.error("Error submitting feature request:", error);
    return NextResponse.json(
      { error: "Failed to submit feature request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing id in request body" },
        { status: 400 }
      );
    }

    await db.collection("featureRequests").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Feature request deleted" });
  } catch (error) {
    console.error("Error deleting feature request:", error);
    return NextResponse.json(
      { error: "Failed to delete feature request" },
      { status: 500 }
    );
  }
}

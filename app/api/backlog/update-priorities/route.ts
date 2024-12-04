// app/api/backlog/update-priorities/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function PUT(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    // Parse the request body
    const { projectId, backlog } = await req.json();

    if (!projectId || !Array.isArray(backlog)) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    // Validate project ID
    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    // Update the priorities of tasks in the backlog
    await Promise.all(
      backlog.map(async (task: { id: string; priority: number }) => {
        // Handle both ObjectId and non-ObjectId string IDs
        const taskIdFilter =
          ObjectId.isValid(task.id) && task.id.length === 24
            ? new ObjectId(task.id)
            : task.id;

        await db.collection("projects").updateOne(
          {
            _id: new ObjectId(projectId),
            "backlog.id": taskIdFilter,
          },
          {
            $set: {
              "backlog.$.priority": task.priority,
              "backlog.$.lastUpdated": new Date(), // Optional: Update the timestamp
            },
          }
        );
      })
    );

    return NextResponse.json({
      message: "Backlog priorities updated successfully",
    });
  } catch (error) {
    console.error("Failed to update backlog priorities:", error);
    return NextResponse.json(
      { error: "Failed to update backlog priorities" },
      { status: 500 }
    );
  }
}

// app/api/tasks/[taskId]/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { notes, projectId } = await request.json(); // Get projectId from request body
    const { taskId } = params;

    console.log("Updating notes for projectId:", projectId, "taskId:", taskId);

    const client = await clientPromise;
    const db = client.db("onepercent");

    const result = await db.collection("projects").updateOne(
      {
        _id: new ObjectId(projectId),
        "tasks.id": taskId,
      },
      {
        $set: { "tasks.$.notes": notes },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Notes updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating notes:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

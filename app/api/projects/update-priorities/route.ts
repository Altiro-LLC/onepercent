// app/api/projects/update-priorities/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";

export async function PUT(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projects } = await req.json();

    // Update each project's priority
    await Promise.all(
      projects.map(
        async ({ id, priority }: { id: number; priority: number }) => {
          await db
            .collection("projects")
            .updateOne({ _id: new ObjectId(id) }, { $set: { priority } });
        }
      )
    );

    return NextResponse.json({ message: "Priorities updated successfully" });
  } catch (error) {
    console.error("Failed to update priorities:", error);
    return NextResponse.json(
      { error: "Failed to update priorities" },
      { status: 500 }
    );
  }
}

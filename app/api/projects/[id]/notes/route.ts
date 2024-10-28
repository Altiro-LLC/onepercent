// app/api/projects/[id]/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { notes } = await request.json();
    const { id } = params;

    const client = await clientPromise;
    const db = client.db("onepercent");

    const result = await db
      .collection("projects")
      .updateOne({ _id: new ObjectId(id) }, { $set: { notes } });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
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
